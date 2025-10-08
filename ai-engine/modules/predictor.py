import joblib
import numpy as np
from sentence_transformers import SentenceTransformer

# Load model and encoders
model = joblib.load("models/xgboost_depression_model.pkl")
label_encoder = joblib.load("models/label_encoder.pkl")
vectorizer = SentenceTransformer('all-MiniLM-L6-v2')

def predict_depression_level(qa_pairs: list) -> dict:
    """
    Accepts a list of Q&A pairs (tuples or dicts), combines answers, encodes using a sentence transformer,
    and predicts depression level.
    """
    if not qa_pairs:
        return {"error": "No user response data provided."}

    # Extract and combine all user answers into a single string
    if isinstance(qa_pairs[0], dict):
        all_text = " ".join([pair.get("answer", "") for pair in qa_pairs])
    else:
        all_text = " ".join([a for (_, a) in qa_pairs])

    if not all_text.strip():
        return {"error": "No valid text for prediction."}

    embedding = vectorizer.encode([all_text.strip()])
    prediction = model.predict(embedding)
    predicted_label = label_encoder.inverse_transform(prediction)[0]

    return {"depression_level": predicted_label}
