"""Model inference backends.

- TorchBackend: the original PyTorch models in ./models (local development).
- OnnxBackend:  int8 ONNX models in ./models_onnx (cloud hosting). Needs only onnxruntime,
  numpy and tokenizers - no PyTorch - so it fits in a small free-tier container.

Both expose the same two methods used by app.py:
    classify(text) -> (label, confidence)
    generate(model_name, text, num_return, max_length, temperature, top_k) -> [str]
"""
import json
import os

import numpy as np

DOMAIN = "domain_assignment"
GENERATORS = ("question_generation", "suggestion")


class OnnxBackend:
    name = "onnx"

    def __init__(self, models_path):
        import onnxruntime as ort
        from tokenizers import Tokenizer

        opts = ort.SessionOptions()
        threads = int(os.getenv("ORT_THREADS", "0"))
        if threads:
            opts.intra_op_num_threads = threads
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        def session(path):
            return ort.InferenceSession(path, opts, providers=["CPUExecutionProvider"])

        def tokenizer(folder):
            tok = Tokenizer.from_file(os.path.join(folder, "tokenizer.json"))
            tok.enable_truncation(512)
            tok.no_padding()
            return tok

        domain_dir = os.path.join(models_path, DOMAIN)
        self.domain = session(os.path.join(domain_dir, "model.onnx"))
        self.domain_tok = tokenizer(domain_dir)
        with open(os.path.join(domain_dir, "labels.json")) as f:
            self.labels = json.load(f)

        self.generators = {}
        for name in GENERATORS:
            folder = os.path.join(models_path, name)
            if not os.path.exists(os.path.join(folder, "encoder.onnx")):
                continue
            with open(os.path.join(folder, "config.json")) as f:
                config = json.load(f)
            self.generators[name] = {
                "encoder": session(os.path.join(folder, "encoder.onnx")),
                "decoder": session(os.path.join(folder, "decoder.onnx")),
                "tok": tokenizer(folder),
                "start": config.get("decoder_start_token_id", 0),
                "eos": config.get("eos_token_id", 1),
                "pad": config.get("pad_token_id", 0),
            }

    def has(self, name):
        return name == DOMAIN or name in self.generators

    def classify(self, text):
        enc = self.domain_tok.encode(text)
        ids = np.array([enc.ids], dtype=np.int64)
        mask = np.array([enc.attention_mask], dtype=np.int64)
        logits = self.domain.run(None, {"input_ids": ids, "attention_mask": mask})[0][0]
        probs = np.exp(logits - logits.max())
        probs /= probs.sum()
        idx = int(probs.argmax())
        return self.labels[idx], float(probs[idx])

    def generate(self, name, text, num_return=1, max_length=128, temperature=1.0, top_k=50, seed=None):
        g = self.generators[name]
        rng = np.random.default_rng(seed)
        enc = g["tok"].encode(text)
        ids = np.array([enc.ids], dtype=np.int64)
        mask = np.array([enc.attention_mask], dtype=np.int64)
        hidden = g["encoder"].run(None, {"input_ids": ids, "attention_mask": mask})[0]

        # Sample `num_return` sequences in one batch
        hidden = np.repeat(hidden, num_return, axis=0)
        mask = np.repeat(mask, num_return, axis=0)
        seqs = np.full((num_return, 1), g["start"], dtype=np.int64)
        finished = np.zeros(num_return, dtype=bool)

        for _ in range(max_length):
            logits = g["decoder"].run(None, {
                "decoder_input_ids": seqs,
                "encoder_hidden_states": hidden,
                "encoder_attention_mask": mask
            })[0].astype(np.float64)
            logits /= max(temperature, 1e-5)
            if top_k and top_k < logits.shape[-1]:
                kth = np.partition(logits, -top_k, axis=-1)[:, -top_k][:, None]
                logits = np.where(logits < kth, -np.inf, logits)
            probs = np.exp(logits - logits.max(axis=-1, keepdims=True))
            probs /= probs.sum(axis=-1, keepdims=True)
            next_tokens = np.array([rng.choice(len(p), p=p) for p in probs], dtype=np.int64)
            next_tokens[finished] = g["pad"]
            seqs = np.concatenate([seqs, next_tokens[:, None]], axis=1)
            finished |= next_tokens == g["eos"]
            if finished.all():
                break

        return [g["tok"].decode(s[1:].tolist(), skip_special_tokens=True) for s in seqs]


class TorchBackend:
    name = "torch"

    def __init__(self, models_path):
        import joblib
        import torch
        from transformers import RobertaTokenizer, RobertaForSequenceClassification, T5Tokenizer, T5ForConditionalGeneration

        self.torch = torch
        domain_dir = os.path.join(models_path, DOMAIN)
        self.domain_tok = RobertaTokenizer.from_pretrained("roberta-base")
        self.domain = RobertaForSequenceClassification.from_pretrained(domain_dir).eval()
        encoder_path = os.path.join(domain_dir, "label_encoder.joblib")
        self.labels = [str(c) for c in joblib.load(encoder_path).classes_] if os.path.exists(encoder_path) else None

        self.generators = {}
        for name in GENERATORS:
            folder = os.path.join(models_path, name)
            if os.path.exists(os.path.join(folder, "config.json")):
                self.generators[name] = (
                    T5Tokenizer.from_pretrained(folder),
                    T5ForConditionalGeneration.from_pretrained(folder).eval()
                )

    def has(self, name):
        return name == DOMAIN or name in self.generators

    def classify(self, text):
        inputs = self.domain_tok(text, return_tensors="pt", max_length=512, truncation=True)
        with self.torch.no_grad():
            probs = self.torch.softmax(self.domain(**inputs).logits, dim=-1)[0]
        idx = int(probs.argmax())
        label = self.labels[idx] if self.labels else str(idx)
        return label, float(probs[idx])

    def generate(self, name, text, num_return=1, max_length=128, temperature=1.0, top_k=50, seed=None):
        tok, model = self.generators[name]
        if seed is not None:
            self.torch.manual_seed(seed)
        inputs = tok(text, return_tensors="pt", max_length=512, truncation=True)
        with self.torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=max_length,
                do_sample=True,
                temperature=temperature,
                top_k=top_k,
                num_return_sequences=num_return,
                pad_token_id=tok.pad_token_id,
                eos_token_id=tok.eos_token_id
            )
        return [tok.decode(o, skip_special_tokens=True) for o in outputs]


def load_backend(base_path):
    """INFERENCE_BACKEND=onnx|torch picks explicitly; otherwise ONNX when PyTorch isn't installed."""
    choice = os.getenv("INFERENCE_BACKEND", "").lower()
    if not choice:
        try:
            import torch  # noqa: F401
            choice = "torch"
        except ImportError:
            choice = "onnx"
    folder = "models_onnx" if choice == "onnx" else "models"
    backend_cls = OnnxBackend if choice == "onnx" else TorchBackend
    return backend_cls(os.path.join(base_path, folder))
