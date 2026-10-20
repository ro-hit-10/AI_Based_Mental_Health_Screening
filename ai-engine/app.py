# ai-engine/app.py - Depression Detection AI using Trained Models
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
import re
import torch
import joblib
import google.generativeai as genai
from transformers import (
    RobertaTokenizer, RobertaForSequenceClassification,
    T5Tokenizer, T5ForConditionalGeneration
)
from dotenv import load_dotenv
import numpy as np
from datetime import datetime

load_dotenv()

# Avoid UnicodeEncodeError on Windows consoles when printing status symbols
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

app = Flask(__name__)
CORS(app)

# Configure Gemini API (fallback for depression level prediction and suggestions)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
gemini_model = None
if GEMINI_API_KEY and 'your' not in GEMINI_API_KEY.lower():
    genai.configure(api_key=GEMINI_API_KEY)
    # gemini-1.5-flash has been retired by Google; override with GEMINI_MODEL in .env if needed
    gemini_model = genai.GenerativeModel(os.getenv('GEMINI_MODEL', 'gemini-3.1-flash-lite'))
else:
    print("GEMINI_API_KEY not set in ai-engine/.env - Gemini fallback disabled")

DEPRESSION_LEVELS = ["No Depression", "Mild", "Moderate", "Severe"]

# Curated opener per domain so every screening asks about the user's actual problem area
DOMAIN_QUESTIONS = {
    "academic": "How have your studies, exams or grades been affecting how you feel lately?",
    "work": "How has your work or workplace been affecting your mood and energy recently?",
    "relationship": "How has your relationship with your partner been affecting how you feel lately?",
    "family": "How have things at home with your family been affecting your mood recently?",
    "social": "How do you feel when you spend time with other people or in social situations?",
    "trauma": "Are there past experiences that still come back to you and affect how you feel today?"
}

# Load trained models
class MentalHealthAI:
    def __init__(self):
        self.models_path = "./models"
        
        # Domain assignment model (RoBERTa)
        self.domain_tokenizer = None
        self.domain_model = None
        self.label_encoder = None
        
        # Question generation model (T5)
        self.question_tokenizer = None
        self.question_model = None
        
        # Suggestion generation model (T5)
        self.suggestion_tokenizer = None
        self.suggestion_model = None

        # Depression level prediction model (T5) - optional, Gemini is used when absent
        self.depression_tokenizer = None
        self.depression_model = None

        # Domain labels (fallback mapping only; primary mapping uses label encoder)
        self.domain_labels = [
            'relationship',
            'work',
            'academic',
            'social',
            'family',
            'trauma'
        ]
        
        self.load_models()
    
    def download_models_if_missing(self):
        """In the cloud the models live in a Hugging Face model repo (HF_MODEL_REPO)"""
        repo = os.getenv('HF_MODEL_REPO')
        marker = os.path.join(self.models_path, "domain_assignment", "config.json")
        if not repo or os.path.exists(marker):
            return
        from huggingface_hub import snapshot_download
        print(f"Downloading models from {repo}...")
        snapshot_download(repo_id=repo, local_dir=self.models_path, token=os.getenv('HF_TOKEN'))
        print("✓ Models downloaded")

    def load_models(self):
        try:
            self.download_models_if_missing()
            print("Loading domain assignment model...")
            # Load domain assignment model
            domain_path = os.path.join(self.models_path, "domain_assignment")
            self.domain_tokenizer = RobertaTokenizer.from_pretrained('roberta-base')
            self.domain_model = RobertaForSequenceClassification.from_pretrained(domain_path)
            
            # Load label encoder
            label_encoder_path = os.path.join(domain_path, "label_encoder.joblib")
            if os.path.exists(label_encoder_path):
                self.label_encoder = joblib.load(label_encoder_path)
            
            print("Loading question generation model...")
            # Load question generation model
            question_path = os.path.join(self.models_path, "question_generation")
            self.question_tokenizer = T5Tokenizer.from_pretrained(question_path)
            self.question_model = T5ForConditionalGeneration.from_pretrained(question_path)
            
            # Try to load suggestion generation model (T5)
            print("Attempting to load suggestion generation model...")
            try:
                suggestion_path = os.path.join(self.models_path, "suggestion")
                if os.path.exists(suggestion_path) and os.path.exists(os.path.join(suggestion_path, "config.json")):
                    self.suggestion_tokenizer = T5Tokenizer.from_pretrained(suggestion_path)
                    self.suggestion_model = T5ForConditionalGeneration.from_pretrained(suggestion_path)
                    print("✓ Suggestion model loaded successfully!")
                else:
                    print("⚠ Suggestion model not found, will use Gemini API as primary")
            except Exception as e:
                print(f"⚠ Could not load suggestion model: {e}")
                print("Will use Gemini API as primary for suggestions")

            # Try to load depression prediction model (T5)
            print("Attempting to load depression prediction model...")
            try:
                depression_path = os.path.join(self.models_path, "depression_prediction")
                if os.path.exists(os.path.join(depression_path, "config.json")):
                    self.depression_tokenizer = T5Tokenizer.from_pretrained(depression_path)
                    self.depression_model = T5ForConditionalGeneration.from_pretrained(depression_path)
                    print("✓ Depression prediction model loaded successfully!")
                else:
                    print("⚠ Depression prediction model not found, will use Gemini API")
            except Exception as e:
                print(f"⚠ Could not load depression prediction model: {e}")

            print("Models loaded successfully!")
            
        except Exception as e:
            print(f"Error loading models: {e}")
            raise e
    
    def calculate_phq9_score(self, answers):
        """Calculate PHQ-9 total score"""
        return sum(answers)
    
    def assign_domain(self, phq9_answers, history, occupation, age):
        """Use trained RoBERTa model to assign domain"""
        try:
            # Create input text combining all factors
            phq9_text = f"PHQ-9 responses: {phq9_answers}"
            history_text = f"Mental health history: {history}" if history else "No mental health history"
            occupation_text = f"Occupation: {occupation}"
            age_text = f"Age: {age}"
            
            input_text = f"{phq9_text}. {history_text}. {occupation_text}. {age_text}"
            
            # Tokenize input
            inputs = self.domain_tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True, padding=True)
            
            # Get prediction
            with torch.no_grad():
                outputs = self.domain_model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class_id = predictions.argmax().item()
            
            # Map prediction to domain label
            if self.label_encoder is not None:
                domain = self.label_encoder.inverse_transform([predicted_class_id])[0]
            else:
                # Fallback mapping if label encoder not available
                domain = self.domain_labels[predicted_class_id % len(self.domain_labels)]
            
            # Normalize to simple label set
            domain = str(domain).strip()
            confidence = float(predictions.max().item())
            
            return domain, confidence
            
        except Exception as e:
            print(f"Error in domain assignment: {e}")
            return 'General Depression', 0.5
    
    @staticmethod
    def format_profile(phq9_answers, history, domain, occupation, age):
        """Input format the T5 models were trained on (see quegen.ipynb)"""
        phq_text = " ".join(f"phq{i+1}:{v}" for i, v in enumerate(phq9_answers))
        return f"{phq_text} history: {history or 'None'} domain: {domain} occupation: {occupation or 'Unknown'} age: {age or 25}"

    def generate_questions(self, phq9_answers, domain, history, previous_answers=None, is_followup=False,
                           occupation='', age=25):
        """Use trained T5 model to generate personalized questions"""
        try:
            input_text = self.format_profile(phq9_answers, history, domain, occupation, age)
            
            # Tokenize input
            inputs = self.question_tokenizer(
                input_text,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding=True
            )
            
            # Generate questions
            with torch.no_grad():
                outputs = self.question_model.generate(
                    **inputs,
                    max_length=128,
                    num_beams=8,
                    temperature=0.9,
                    do_sample=True,
                    pad_token_id=self.question_tokenizer.pad_token_id,
                    eos_token_id=self.question_tokenizer.eos_token_id,
                    num_return_sequences=8
                )
            
            # Decode and split into separate questions
            raw_outputs = [
                self.question_tokenizer.decode(output, skip_special_tokens=True)
                for output in outputs
            ]

            split_questions = []
            domain_question = DOMAIN_QUESTIONS.get(str(domain).strip().lower())
            if domain_question:
                split_questions.append(domain_question)
            for text in raw_outputs:
                # Split on "||" separators, question marks and line breaks
                parts = re.split(r"\s*\|\|\s*|[\n\r]+|(?<=\?)\s+", text)
                for p in parts:
                    q = p.strip()
                    if not q:
                        continue
                    # Ensure ends with '?'
                    if not q.endswith('?') and len(q.split()) > 3:
                        q = q.rstrip('.') + '?'
                    # Remove numbering/prefixes (the model sometimes emits "Q-9:" style prefixes)
                    q = re.sub(r"^\s*(Q-?\d+\s*:|\d+\s*[).:-])\s*", "", q)
                    q = re.sub(r"\?+$", "?", q)
                    # Filter overly long or duplicate
                    if 8 <= len(q) <= 180 and q not in split_questions:
                        split_questions.append(q)

            return split_questions[:5]
            
        except Exception as e:
            print(f"Error in question generation: {e}")
            return []
    
    
    @staticmethod
    def normalize_depression_level(text):
        """Map free-text model output onto the 4-level scale, or None if it is not a valid level"""
        t = str(text).strip().lower()
        if not t or t in ("nan", "none", "null"):
            return None
        if "no depression" in t or "minimal" in t or t in ("no", "normal"):
            return "No Depression"
        if "severe" in t:  # includes "moderately severe"
            return "Severe"
        if "moderate" in t:
            return "Moderate"
        if "mild" in t:
            return "Mild"
        return None

    def phq9_level(self, phq9_answers):
        """Standard PHQ-9 cut-offs mapped to the 4-level scale"""
        phq9_score = self.calculate_phq9_score(phq9_answers)
        if phq9_score <= 4:
            return "No Depression"
        if phq9_score <= 9:
            return "Mild"
        if phq9_score <= 14:
            return "Moderate"
        return "Severe"

    def predict_depression_with_model(self, phq9_answers, domain, history, follow_up_answers, follow_up_questions=None):
        """Predict depression level using the trained T5 model (primary method)"""
        if self.depression_model is None or self.depression_tokenizer is None:
            return None
        try:
            qa_text = self.format_qa(follow_up_questions, follow_up_answers).replace("\n", " ")
            input_text = f"{self.format_profile(phq9_answers, history, domain, '', '')} answers: {qa_text}"
            inputs = self.depression_tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
            with torch.no_grad():
                outputs = self.depression_model.generate(**inputs, max_length=16, num_beams=4,
                                                         output_scores=True, return_dict_in_generate=True)
            raw = self.depression_tokenizer.decode(outputs.sequences[0], skip_special_tokens=True)
            level = self.normalize_depression_level(raw)
            if level is None:
                print(f"⚠ Depression model returned an invalid level ({raw!r}), falling back")
                return None
            confidence = float(torch.exp(outputs.sequences_scores[0]).item())
            phq9_score = self.calculate_phq9_score(phq9_answers)
            return {
                "depression_level": level,
                "confidence": max(0.0, min(1.0, confidence)),
                "key_indicators": [f"PHQ-9 score of {phq9_score}", f"Primary domain: {domain}",
                                   "Predicted by trained depression model"],
                "method": "trained_model"
            }
        except Exception as e:
            print(f"Error in trained model depression prediction: {e}")
            return None

    @staticmethod
    def format_qa(follow_up_questions, follow_up_answers):
        """Pair each generated screening question with the user's answer"""
        answers = follow_up_answers if isinstance(follow_up_answers, list) else [follow_up_answers]
        questions = follow_up_questions if isinstance(follow_up_questions, list) else []
        lines = []
        for i, answer in enumerate(answers):
            question = questions[i] if i < len(questions) else f"Question {i + 1}"
            lines.append(f"Q{i + 1}: {question}\nA{i + 1}: {answer}")
        return "\n".join(lines)

    def predict_depression_with_gemini(self, phq9_answers, domain, history, follow_up_answers, follow_up_questions=None):
        """Predict depression level using Gemini API (fallback method)"""
        if gemini_model is None:
            return None
        try:
            qa_text = self.format_qa(follow_up_questions, follow_up_answers)

            # The PHQ-9 score is deliberately left out: the level must come from the answers
            # to the generated questions, and Gemini anchors on the score when it is given.
            prompt = f"""
            You are a licensed mental health professional. Assess the user's depression level
            ONLY from their own answers to the personalized screening questions below.

            Screening Questions and the User's Answers:
            {qa_text}

            Background (context only, not evidence of severity):
            - Identified Domain: {domain}
            - Mental Health History: {history if history else 'None reported'}

            Judge what the answers reveal about mood, hopelessness, energy, sleep, appetite,
            concentration, withdrawal, self-worth and thoughts of death or self-harm:
            - "No Depression": answers show normal mood and coping; stress is situational and manageable.
            - "Mild": some low mood, stress or tiredness, but the person is still functioning and engaged.
            - "Moderate": persistent low mood plus several symptoms (sleep, energy, withdrawal,
              worthlessness) that clearly affect daily life.
            - "Severe": pervasive hopelessness, inability to function, or ANY mention of death,
              self-harm or others being better off without them.
            Short or vague answers (e.g. "yes", "maybe") carry little evidence: pick the level they
            best support and use a lower confidence.

            Provide ONLY a JSON response with:
            1. Depression Level: Choose EXACTLY one from ["No Depression", "Mild", "Moderate", "Severe"]
            2. Confidence Score: A number from 0.0 to 1.0
            3. Key Indicators: 2-3 specific observations, quoting or referring to the user's answers
            
            Return ONLY this JSON, no other text:
            {{
                "depression_level": "[Level]",
                "confidence": [0.0-1.0],
                "key_indicators": ["indicator1", "indicator2", "indicator3"]
            }}
            """
            
            response = gemini_model.generate_content(prompt)
            result_text = response.text.strip()
            print(f"Raw Gemini response for depression level: {result_text}")
            
            # Remove markdown code blocks if present
            result_text = re.sub(r"^```(json)?|```$", "", result_text).strip()
            
            result = json.loads(result_text)
            level = self.normalize_depression_level(result.get('depression_level', ''))
            if level is None or 'confidence' not in result:
                print(f"⚠ Gemini returned an invalid assessment: {result_text}")
                return None
            
            key_indicators = result.get('key_indicators', [])
            if not isinstance(key_indicators, list):
                key_indicators = [str(key_indicators)]
            
            return {
                "depression_level": level,
                "confidence": max(0.0, min(1.0, float(result['confidence']))),
                "key_indicators": key_indicators,
                "method": "gemini_api"
            }
            
        except Exception as e:
            print(f"Error in Gemini depression prediction: {e}")
            return None

    def predict_depression_level(self, phq9_answers, domain, history, follow_up_answers, follow_up_questions=None):
        """Predict depression level from the answers to the generated questions -
        trained model first, Gemini as fallback, PHQ-9 cut-offs as last resort"""
        result = self.predict_depression_with_model(phq9_answers, domain, history, follow_up_answers, follow_up_questions)
        if result:
            print(f"✓ Depression level from trained model: {result['depression_level']}")
            return result
        
        result = self.predict_depression_with_gemini(phq9_answers, domain, history, follow_up_answers, follow_up_questions)
        if result:
            print(f"✓ Depression level from Gemini API: {result['depression_level']}")
            return result
        
        phq9_score = self.calculate_phq9_score(phq9_answers)
        depression_level = self.phq9_level(phq9_answers)
        print(f"✓ Depression level from PHQ-9 cut-offs: {depression_level}")
        return {
            "depression_level": depression_level,
            "confidence": 0.7,
            "key_indicators": [f"PHQ-9 score of {phq9_score} falls in the {depression_level.lower()} range",
                               f"Primary domain: {domain}"],
            "method": "phq9_score"
        }
    
    
    def generate_suggestions_with_model(self, depression_level, domain, history, phq9_answers):
        """Generate suggestions using trained T5 model (primary method)"""
        try:
            if self.suggestion_model is None or self.suggestion_tokenizer is None:
                print("Trained suggestion model not available, using fallback")
                return None
                
            # Create context for suggestion generation
            context = f"Generate therapeutic suggestions. Level: {depression_level}. Domain: {domain}. History: {history}. PHQ-9: {phq9_answers}"
            input_text = f"Generate personalized treatment suggestions based on: {context}"
            
            # Tokenize input
            inputs = self.suggestion_tokenizer(
                input_text,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding=True
            )
            
            # Generate suggestions
            with torch.no_grad():
                outputs = self.suggestion_model.generate(
                    **inputs,
                    max_length=200,
                    num_beams=6,
                    temperature=0.8,
                    do_sample=True,
                    pad_token_id=self.suggestion_tokenizer.pad_token_id,
                    eos_token_id=self.suggestion_tokenizer.eos_token_id,
                    num_return_sequences=5
                )
            
            # Decode suggestions
            raw_suggestions = [
                self.suggestion_tokenizer.decode(output, skip_special_tokens=True)
                for output in outputs
            ]
            
            # Process and clean suggestions. The model emits several suggestions in one
            # sequence separated by ";", so split them out and dedupe across sequences.
            processed_suggestions = []
            for suggestion in raw_suggestions:
                for part in suggestion.split(";"):
                    clean_suggestion = part.strip()
                    # Remove input context if it appears in output
                    if clean_suggestion.startswith("Generate"):
                        continue

                    # Remove numbering/prefixes
                    clean_suggestion = re.sub(r"^\s*\d+\s*[).:-]\s*", "", clean_suggestion)
                    clean_suggestion = re.sub(r"^\s*[-*]\s*", "", clean_suggestion)

                    if len(clean_suggestion) > 15 and clean_suggestion not in processed_suggestions:
                        processed_suggestions.append(clean_suggestion)
            
            return processed_suggestions[:5] if processed_suggestions else None
            
        except Exception as e:
            print(f"Error in trained model suggestion generation: {e}")
            return None
    
    def generate_suggestions_with_gemini(self, depression_level, domain, history, phq9_answers):
        """Generate suggestions using Gemini API (fallback method)"""
        if gemini_model is None:
            return None
        try:
            print("Using Gemini API for suggestion generation")
            prompt = f"""
            You are a licensed therapist providing personalized mental health suggestions.
            
            Patient Profile:
            - Depression Level: {depression_level}
            - Primary Domain: {domain}
            - Mental Health History: {history if history else 'None reported'}
            - PHQ-9 Responses: {phq9_answers}
            
            Provide 4-5 specific, actionable therapeutic suggestions tailored to this patient's profile.
            Focus on evidence-based interventions appropriate for their depression level and domain.
            
            Return ONLY a JSON array of strings, no other text:
            ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
            """
            
            response = gemini_model.generate_content(prompt)
            result_text = response.text.strip()
            print(f"Raw Gemini response for suggestions: {result_text}")
            
            # Clean the response text
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            
            result_text = result_text.strip()
            
            try:
                suggestions = json.loads(result_text)
                if not isinstance(suggestions, list):
                    suggestions = [str(suggestions)]
                suggestions = [str(item) for item in suggestions]
                return suggestions
            except json.JSONDecodeError as e:
                print(f"Error parsing Gemini suggestions response: {e}")
                return None
            
        except Exception as e:
            print(f"Error generating suggestions with Gemini: {e}")
            return None
    
    def generate_suggestions(self, depression_level, domain, history, phq9_answers):
        """Generate personalized suggestions - uses trained model first, Gemini as fallback"""
        print(f"Generating suggestions for: Level={depression_level}, Domain={domain}")
        
        # Method 1: Try trained T5 model first
        suggestions = self.generate_suggestions_with_model(depression_level, domain, history, phq9_answers)
        if suggestions and len(suggestions) > 0:
            print(f"✓ Generated {len(suggestions)} suggestions using trained model")
            return suggestions
        
        # Method 2: Fallback to Gemini API
        print("Trained model failed, trying Gemini API...")
        suggestions = self.generate_suggestions_with_gemini(depression_level, domain, history, phq9_answers)
        if suggestions and len(suggestions) > 0:
            print(f"✓ Generated {len(suggestions)} suggestions using Gemini API")
            return suggestions
        
        # Method 3: Last resort - predefined suggestions
        print("Both AI methods failed, using predefined suggestions")
        fallback_suggestions = {
            "No Depression": [
                "Continue with healthy lifestyle habits like regular exercise and adequate sleep",
                "Practice mindfulness and stress management techniques",
                "Maintain social connections and engage in enjoyable activities",
                "Consider preventive mental health strategies"
            ],
            "Mild": [
                "Establish a regular daily routine with consistent sleep and wake times",
                "Engage in regular physical activity, even light walking can help",
                "Practice relaxation techniques such as deep breathing or meditation",
                "Consider talking to a counselor or joining a support group",
                "Focus on activities that bring you joy and satisfaction"
            ],
            "Moderate": [
                "Consider professional counseling or therapy sessions",
                "Establish a structured daily routine to provide stability",
                "Practice cognitive behavioral techniques to challenge negative thoughts",
                "Engage in regular exercise and outdoor activities when possible",
                "Consider discussing medication options with a healthcare provider"
            ],
            "Severe": [
                "Seek immediate professional mental health support",
                "Consider intensive therapy or psychiatric evaluation",
                "Ensure you have a strong support system of family and friends",
                "Discuss medication options with a psychiatrist",
                "Create a safety plan and emergency contact list"
            ]
        }
        
        # Add domain-specific suggestions
        domain_specific = {
            "work": "Address workplace stress through time management and boundary setting",
            "relationship": "Focus on communication skills and relationship counseling",
            "academic": "Develop study strategies and manage academic pressure",
            "social": "Work on social skills and gradually increase social interactions",
            "family": "Consider family therapy or mediation for family conflicts",
            "trauma": "Seek specialized trauma therapy such as EMDR or trauma-focused CBT"
        }
        
        base_suggestions = fallback_suggestions.get(depression_level, fallback_suggestions["Moderate"])
        if domain.lower() in domain_specific:
            base_suggestions = base_suggestions + [domain_specific[domain.lower()]]
            
        print(f"✓ Generated {len(base_suggestions[:5])} predefined suggestions")
        return base_suggestions[:5]
    
    

# Initialize the AI model
ai_model = MentalHealthAI()

# API Endpoints
@app.route("/api/phq9-submit", methods=["POST"])
def submit_phq9():
    """Submit PHQ-9 test and get domain assignment"""
    try:
        data = request.get_json()
        phq9_answers = data.get('phq9_answers')
        history = data.get('history', '')
        occupation = data.get('occupation', '')
        age = data.get('age', 25)
        
        if not phq9_answers or len(phq9_answers) != 9:
            return jsonify({"error": "PHQ-9 answers must contain exactly 9 responses"}), 400
        
        # Calculate PHQ-9 score
        phq9_score = ai_model.calculate_phq9_score(phq9_answers)
        
        # Assign domain using trained model
        domain, confidence = ai_model.assign_domain(phq9_answers, history, occupation, age)
        
        return jsonify({
            "phq9_score": phq9_score,
            "domain": domain,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Error processing PHQ-9 submission: {str(e)}"}), 500

@app.route("/api/generate-questions", methods=["POST"])
def generate_questions():
    """Generate personalized screening questions"""
    try:
        data = request.get_json()
        phq9_answers = data.get('phq9_answers')
        domain = data.get('domain')
        history = data.get('history', '')
        previous_answers = data.get('previous_answers')
        is_followup = data.get('is_followup', False)
        occupation = data.get('occupation', '')
        age = data.get('age', 25)

        if not phq9_answers or not domain:
            return jsonify({"error": "PHQ-9 answers and domain are required"}), 400

        # Generate questions using trained model
        questions = ai_model.generate_questions(
            phq9_answers, domain, history, previous_answers, is_followup, occupation, age
        )
        
        return jsonify({
            "questions": questions,
            "domain": domain,
            "is_followup": is_followup,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Error generating questions: {str(e)}"}), 500

@app.route("/api/analyze-depression", methods=["POST"])
def analyze_depression():
    """Analyze depression level using Gemini API"""
    try:
        data = request.get_json()
        phq9_answers = data.get('phq9_answers')
        domain = data.get('domain')
        history = data.get('history', '')
        follow_up_answers = data.get('follow_up_answers')
        follow_up_questions = data.get('follow_up_questions')

        if not all([phq9_answers, domain, follow_up_answers]):
            return jsonify({"error": "PHQ-9 answers, domain, and follow-up answers are required"}), 400
        
        # Predict depression level using Gemini
        depression_analysis = ai_model.predict_depression_level(
            phq9_answers, domain, history, follow_up_answers, follow_up_questions
        )
        
        return jsonify({
            **depression_analysis,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Error analyzing depression level: {str(e)}"}), 500

@app.route("/api/generate-suggestions", methods=["POST"])
def generate_suggestions():
    """Generate personalized therapy suggestions"""
    try:
        data = request.get_json()
        depression_level = data.get('depression_level')
        domain = data.get('domain')
        history = data.get('history', '')
        phq9_answers = data.get('phq9_answers')
        
        if not all([depression_level, domain, phq9_answers]):
            return jsonify({"error": "Depression level, domain, and PHQ-9 answers are required"}), 400
        
        # Generate suggestions using Gemini
        suggestions = ai_model.generate_suggestions(
            depression_level, domain, history, phq9_answers
        )
        
        return jsonify({
            "suggestions": suggestions,
            "depression_level": depression_level,
            "domain": domain,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Error generating suggestions: {str(e)}"}), 500

@app.route("/api/complete-screening", methods=["POST"])
def complete_screening():
    """Complete full screening analysis (depression level + suggestions)"""
    try:
        data = request.get_json()
        phq9_answers = data.get('phq9_answers')
        domain = data.get('domain')
        history = data.get('history', '')
        follow_up_answers = data.get('follow_up_answers')
        follow_up_questions = data.get('follow_up_questions')

        if not all([phq9_answers, domain, follow_up_answers]):
            return jsonify({"error": "PHQ-9 answers, domain, and follow-up answers are required"}), 400
        
        # Analyze depression level
        depression_analysis = ai_model.predict_depression_level(
            phq9_answers, domain, history, follow_up_answers, follow_up_questions
        )
        
        # Generate suggestions
        suggestions = ai_model.generate_suggestions(
            depression_analysis['depression_level'], domain, history, phq9_answers
        )
        
        return jsonify({
            "depression_level": depression_analysis['depression_level'],
            "confidence": depression_analysis['confidence'],
            "key_indicators": depression_analysis['key_indicators'],
            "suggestions": suggestions,
            "domain": domain,
            "phq9_score": ai_model.calculate_phq9_score(phq9_answers),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Error completing screening: {str(e)}"}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": {
            "domain_assignment": ai_model.domain_model is not None,
            "question_generation": ai_model.question_model is not None,
            "suggestion_generation": ai_model.suggestion_model is not None,
            "depression_prediction": ai_model.depression_model is not None
        },
        "gemini_configured": gemini_model is not None,
        "fallback_methods": {
            "suggestion_method": "trained_model" if ai_model.suggestion_model is not None else "gemini_api",
            "depression_method": "trained_model" if ai_model.depression_model is not None
                                 else ("gemini_api" if gemini_model is not None else "phq9_score")
        },
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    print("Starting Mental Health AI Engine...")
    app.run(
        debug=os.getenv('FLASK_DEBUG', '1') == '1',
        port=int(os.getenv('PORT', '5001')),
        host='0.0.0.0'
    )
