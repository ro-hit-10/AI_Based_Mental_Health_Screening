"""Convert the fine-tuned PyTorch models to compact int8 ONNX models for CPU-only hosting.

Usage (from the ai-engine folder, inside the venv):
    python tools/export_onnx.py

Needs: pip install onnx onnxruntime onnxconverter-common (export-time only).
Note: onnxconverter-common pins protobuf 3.20.x - reinstall protobuf==4.25.8 afterwards.

Reads ./models, writes ./models_onnx. The domain classifier is stored as fp16 and the
T5 generators as int8. T5 models are split into an encoder and a decoder
(without KV cache) so generation can run with onnxruntime + numpy only - no PyTorch needed at runtime.
"""
import json
import os
import shutil
import warnings

import joblib
import torch
from onnxruntime.quantization import quantize_dynamic, QuantType
from transformers import (
    RobertaForSequenceClassification, RobertaTokenizer, RobertaTokenizerFast,
    T5ForConditionalGeneration, T5Tokenizer, T5TokenizerFast
)

warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "models")
DST = os.path.join(HERE, "models_onnx")
OPSET = 17


def to_fp16(fp32_path):
    # The domain classifier's scores are very close together, so int8 rounding flips its
    # predictions (35% -> 25% accuracy). fp16 halves the size and matches PyTorch exactly.
    import onnx
    from onnxconverter_common import float16
    out_path = fp32_path.replace(".fp32.onnx", ".onnx")
    onnx.save(float16.convert_float_to_float16(onnx.load(fp32_path), keep_io_types=True), out_path)
    os.remove(fp32_path)
    print(f"   {os.path.basename(out_path)} (fp16): {os.path.getsize(out_path) / 1e6:.0f} MB")


def quantize(fp32_path):
    int8_path = fp32_path.replace(".fp32.onnx", ".onnx")
    quantize_dynamic(fp32_path, int8_path, weight_type=QuantType.QInt8)
    os.remove(fp32_path)
    data = fp32_path + ".data"
    if os.path.exists(data):
        os.remove(data)
    print(f"   {os.path.basename(int8_path)}: {os.path.getsize(int8_path) / 1e6:.0f} MB")


def export_domain():
    print("Domain classifier (RoBERTa)...")
    out = os.path.join(DST, "domain_assignment")
    os.makedirs(out, exist_ok=True)
    model = RobertaForSequenceClassification.from_pretrained(os.path.join(SRC, "domain_assignment")).eval()
    tok = RobertaTokenizer.from_pretrained("roberta-base")
    # tokenizer.json lets the runtime use the light `tokenizers` package instead of transformers
    RobertaTokenizerFast.from_pretrained("roberta-base").save_pretrained(out)
    # Plain JSON labels so the runtime doesn't need scikit-learn to unpickle the label encoder
    encoder = joblib.load(os.path.join(SRC, "domain_assignment", "label_encoder.joblib"))
    with open(os.path.join(out, "labels.json"), "w") as f:
        json.dump([str(c) for c in encoder.classes_], f)
    shutil.copy(os.path.join(SRC, "domain_assignment", "config.json"), out)

    enc = tok("sample text", return_tensors="pt")
    path = os.path.join(out, "model.fp32.onnx")
    torch.onnx.export(
        model, (enc["input_ids"], enc["attention_mask"]), path,
        input_names=["input_ids", "attention_mask"], output_names=["logits"],
        dynamic_axes={"input_ids": {0: "b", 1: "s"}, "attention_mask": {0: "b", 1: "s"}, "logits": {0: "b"}},
        opset_version=OPSET,
    )
    to_fp16(path)


class T5Encoder(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.encoder = model.get_encoder()

    def forward(self, input_ids, attention_mask):
        return self.encoder(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state


class T5Decoder(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.decoder = model.get_decoder()
        self.lm_head = model.lm_head
        self.scale = model.config.d_model ** -0.5 if model.config.tie_word_embeddings else 1.0

    def forward(self, decoder_input_ids, encoder_hidden_states, encoder_attention_mask):
        hidden = self.decoder(
            input_ids=decoder_input_ids,
            encoder_hidden_states=encoder_hidden_states,
            encoder_attention_mask=encoder_attention_mask,
            use_cache=False,
        ).last_hidden_state
        # Only the last position is needed for generation
        return self.lm_head(hidden[:, -1, :] * self.scale)


def export_t5(name):
    print(f"T5 model '{name}'...")
    src = os.path.join(SRC, name)
    out = os.path.join(DST, name)
    os.makedirs(out, exist_ok=True)
    model = T5ForConditionalGeneration.from_pretrained(src).eval()
    tok = T5Tokenizer.from_pretrained(src)
    T5TokenizerFast.from_pretrained(src, from_slow=True).save_pretrained(out)
    model.config.save_pretrained(out)

    ids = tok("sample text", return_tensors="pt")
    enc_path = os.path.join(out, "encoder.fp32.onnx")
    torch.onnx.export(
        T5Encoder(model), (ids["input_ids"], ids["attention_mask"]), enc_path,
        input_names=["input_ids", "attention_mask"], output_names=["hidden"],
        dynamic_axes={"input_ids": {0: "b", 1: "s"}, "attention_mask": {0: "b", 1: "s"}, "hidden": {0: "b", 1: "s"}},
        opset_version=OPSET,
    )
    with torch.no_grad():
        hidden = T5Encoder(model)(ids["input_ids"], ids["attention_mask"])
    dec_ids = torch.tensor([[model.config.decoder_start_token_id, 100]])
    dec_path = os.path.join(out, "decoder.fp32.onnx")
    torch.onnx.export(
        T5Decoder(model), (dec_ids, hidden, ids["attention_mask"]), dec_path,
        input_names=["decoder_input_ids", "encoder_hidden_states", "encoder_attention_mask"], output_names=["logits"],
        dynamic_axes={
            "decoder_input_ids": {0: "b", 1: "t"},
            "encoder_hidden_states": {0: "b", 1: "s"},
            "encoder_attention_mask": {0: "b", 1: "s"},
            "logits": {0: "b"},
        },
        opset_version=OPSET,
    )
    quantize(enc_path)
    quantize(dec_path)


if __name__ == "__main__":
    os.makedirs(DST, exist_ok=True)
    export_domain()
    export_t5("question_generation")
    export_t5("suggestion")
    print(f"Done -> {DST}")
