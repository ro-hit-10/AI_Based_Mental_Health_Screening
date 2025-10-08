# ai-engine/app.py - Depression Detection AI using Trained Models
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
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

app = Flask(__name__)
CORS(app)

# Configure Gemini API (only for depression level prediction)
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
# Use a current, supported Gemini model
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

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
    
    def load_models(self):
        try:
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
    
    def generate_questions(self, phq9_answers, domain, history, previous_answers=None, is_followup=False):
        """Use trained T5 model to generate personalized questions"""
        try:
            # Create context for question generation
            if is_followup:
                context = f"Follow-up session. PHQ-9: {phq9_answers}. Domain: {domain}. History: {history}. Previous answers: {previous_answers}"
            else:
                context = f"Initial screening. PHQ-9: {phq9_answers}. Domain: {domain}. History: {history}"
            
            # Add generation prompt
            input_text = f"Generate therapeutic questions based on: {context}"
            
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
            for text in raw_outputs:
                # Split on question marks and line breaks
                parts = re.split(r"[\n\r]+|(?<=\?)\s+", text)
                for p in parts:
                    q = p.strip()
                    if not q:
                        continue
                    # Ensure ends with '?'
                    if not q.endswith('?') and len(q.split()) > 3:
                        q = q.rstrip('.') + '?'
                    # Remove numbering/prefixes
                    q = re.sub(r"^\s*\d+\s*[).:-]\s*", "", q)
                    # Filter overly long or duplicate
                    if 8 <= len(q) <= 180 and q not in split_questions:
                        split_questions.append(q)

            return split_questions[:5]
            
        except Exception as e:
            print(f"Error in question generation: {e}")
            return []
    
    
    def predict_depression_level(self, phq9_answers, domain, history, follow_up_answers):
        """Use Gemini API to predict depression level (4-level scale)"""
        try:
            phq9_score = self.calculate_phq9_score(phq9_answers)
            
            prompt = f"""
            You are a licensed mental health professional. Analyze the following patient information and provide a depression level assessment.
            
            Patient Information:
            - PHQ-9 Score: {phq9_score} (Total score from 0-27 scale)
            - PHQ-9 Individual Responses: {phq9_answers}
            - Identified Domain: {domain}
            - Mental Health History: {history if history else 'None reported'}
            - Follow-up Session Responses: {follow_up_answers}
            
            Based on this comprehensive information, provide ONLY a JSON response with:
            1. Depression Level: Choose EXACTLY one from ["No Depression", "Mild", "Moderate", "Severe"]
            2. Confidence Score: A number from 0.0 to 1.0
            3. Key Indicators: 2-3 specific observations that led to this assessment
            
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
            
            # Clean the response text
            # Remove markdown code blocks if present
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            
            result_text = result_text.strip()
            
            # Parse JSON response
            try:
                result = json.loads(result_text)
                
                # Validate the response structure
                if not all(key in result for key in ['depression_level', 'confidence', 'key_indicators']):
                    raise ValueError("Missing required keys in response")
                    
                # Ensure confidence is a float between 0 and 1
                result['confidence'] = max(0.0, min(1.0, float(result['confidence'])))
                
                # Ensure key_indicators is a list
                if not isinstance(result['key_indicators'], list):
                    result['key_indicators'] = [str(result['key_indicators'])]
                    
                return result
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                print(f"Error parsing Gemini response: {e}")
                print(f"Raw response: {result_text}")
                
                # Fallback: Try to extract information manually
                depression_level = "Moderate"  # Default based on PHQ-9 score
                if phq9_score <= 4:
                    depression_level = "No Depression"
                elif phq9_score <= 9:
                    depression_level = "Mild"
                elif phq9_score <= 14:
                    depression_level = "Moderate"
                else:
                    depression_level = "Severe"
                    
                return {
                    "depression_level": depression_level,
                    "confidence": 0.7,
                    "key_indicators": [f"PHQ-9 score of {phq9_score} indicates {depression_level.lower()} depression", f"Primary domain: {domain}", "AI analysis completed with fallback scoring"]
                }
            
        except Exception as e:
            print(f"Error in depression level prediction: {e}")
            phq9_score = self.calculate_phq9_score(phq9_answers)
            
            # Fallback scoring based on PHQ-9
            depression_level = "Moderate"
            if phq9_score <= 4:
                depression_level = "No Depression"
            elif phq9_score <= 9:
                depression_level = "Mild"
            elif phq9_score <= 14:
                depression_level = "Moderate"
            else:
                depression_level = "Severe"
                
            return {
                "depression_level": depression_level,
                "confidence": 0.6,
                "key_indicators": [f"PHQ-9 score: {phq9_score}", f"Domain: {domain}", "Fallback assessment due to API error"]
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
            
            # Process and clean suggestions
            processed_suggestions = []
            for suggestion in raw_suggestions:
                # Clean and format suggestion
                clean_suggestion = suggestion.strip()
                # Remove input context if it appears in output
                if "Generate" in clean_suggestion:
                    parts = clean_suggestion.split(".", 1)
                    if len(parts) > 1:
                        clean_suggestion = parts[1].strip()
                
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
        
        if not phq9_answers or not domain:
            return jsonify({"error": "PHQ-9 answers and domain are required"}), 400
        
        # Generate questions using trained model
        questions = ai_model.generate_questions(
            phq9_answers, domain, history, previous_answers, is_followup
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
        
        if not all([phq9_answers, domain, follow_up_answers]):
            return jsonify({"error": "PHQ-9 answers, domain, and follow-up answers are required"}), 400
        
        # Predict depression level using Gemini
        depression_analysis = ai_model.predict_depression_level(
            phq9_answers, domain, history, follow_up_answers
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
        
        if not all([phq9_answers, domain, follow_up_answers]):
            return jsonify({"error": "PHQ-9 answers, domain, and follow-up answers are required"}), 400
        
        # Analyze depression level
        depression_analysis = ai_model.predict_depression_level(
            phq9_answers, domain, history, follow_up_answers
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
            "suggestion_generation": ai_model.suggestion_model is not None
        },
        "fallback_methods": {
            "suggestion_method": "trained_model" if ai_model.suggestion_model is not None else "gemini_api"
        },
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    print("Starting Mental Health AI Engine...")
    app.run(debug=True, port=5001, host='0.0.0.0')
