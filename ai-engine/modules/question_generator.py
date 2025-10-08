import openai
import os
from dotenv import load_dotenv

# Load your OpenAI API key securely
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_questions(phq9_answers, history_text, previous_qa_pairs=None, num_questions=5):
    """
    Generates personalized mental health questions based on:
    - PHQ-9 test answers
    - User-provided mental health history
    - Previous follow-up Q&A (if any)

    Returns a list of therapist-style, emotionally sensitive follow-up questions.
    """
    previous_context = ""
    if previous_qa_pairs:
        previous_context = "\nPrevious follow-up Q&A:\n" + "\n".join(
            [f"Q: {q}\nA: {a}" for q, a in previous_qa_pairs]
        )

    prompt = f"""
You are a compassionate AI mental health therapist. Your goal is to generate personalized, open-ended follow-up questions 
to understand the user's emotional state more deeply.

User's PHQ-9 responses:
{phq9_answers}

User's mental health history:
{history_text}

{previous_context}

Based on this data, generate {num_questions} unique, emotionally intelligent questions that:
- Reflect empathy and therapeutic tone
- Are personalized to the user's responses
- Do NOT repeat PHQ-9 questions
- Are not yes/no format
- Are safe and non-triggering

Format your response as a numbered list.
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a compassionate AI mental health therapist."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )

        # Extract questions from response
        output = response.choices[0].message.content.strip()
        questions = [line.lstrip("1234567890. ").strip() for line in output.split("\n") if line.strip()]
        return questions[:num_questions]

    except Exception as e:
        print(f"Error generating questions: {e}")
        return ["Sorry, we couldn’t generate questions at the moment. Please try again later."]
