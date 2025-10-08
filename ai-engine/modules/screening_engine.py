# modules/screening_engine.py
from .question_generator import generate_questions
from .predictor import predict_depression_level
from .suggestion_engine import generate_suggestions

def handle_screening_session(user_data, model, label_encoder):
    domain = user_data.get("domain", "")
    phq_answers = user_data.get("phq_answers", [])
    history = user_data.get("history", "")
    follow_up_questions = user_data.get("follow_up_questions", [])

    # 1. Generate personalized therapist-style questions
    generated_questions = generate_questions({
        "domain": domain,
        "history": history,
        "follow_up_questions": follow_up_questions
    })

    # 2. Predict depression level based on PHQ + follow-up answers
    answers = user_data.get("answers", [])  # Should be numeric or vectorized
    prediction = predict_depression_level(answers, model, label_encoder)

    # 3. Generate coping suggestions based on predicted level
    suggestions = generate_suggestions(prediction["level"], history)

    return {
        "questions": generated_questions,
        "depression_level": prediction["level"],
        "confidence": prediction["confidence"],
        "suggestions": suggestions
    }
