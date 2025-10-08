import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_suggestions(depression_level, history_text=""):
    try:
        prompt = (
            f"You are a mental health therapist. A user is experiencing *{depression_level}* level depression.\n"
            f"User's mental health history:\n{history_text if history_text else 'No specific history provided.'}\n\n"
            "Based on this, identify possible causes behind their depression and provide **3 personalized therapy-like suggestions**, such as:\n"
            "- Daily emotional routines\n"
            "- Cognitive or behavioral changes\n"
            "- Mindfulness or physical exercises\n"
            "- Relevant lifestyle changes\n"
            "Ensure your tone is empathetic, supportive, and avoids clinical jargon."
        )

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a caring and professional mental health assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=300
        )

        reply = response["choices"][0]["message"]["content"]
        return reply.strip()

    except Exception as e:
        return f"Error generating suggestions: {e}"

