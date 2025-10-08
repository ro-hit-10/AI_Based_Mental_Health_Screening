// backend/models/ScreeningSession.js
const mongoose = require("mongoose");

const screeningSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String },
    phqScore: { type: Number },
    phqAnswers: { type: [Number] },
    questions: { type: [String] }, // AI-generated questions
    answers: { type: [String] }, // User responses to AI questions
    depression_level: { type: String },
    suggestions: { type: [String] }, // AI-generated suggestions
    // PHQ-9 detailed question responses
    phq9_detailed_responses: [{
      question_index: { type: Number },
      question_text: { type: String },
      response_value: { type: Number },
      response_text: { type: String }
    }],
    // AI Assessment details
    ai_questions_responses: [{
      question: { type: String },
      answer: { type: String }
    }],
    // Additional comprehensive data
    confidence: { type: Number }, // AI confidence level
    key_indicators: { type: [String] }, // Key depression indicators identified
    secondary_domains: { type: [String] }, // Secondary affected domains
    risk_factors: { type: [String] }, // Identified risk factors
    // Categorized AI suggestions
    categorized_suggestions: {
      immediate_actions: { type: [String], default: [] },
      lifestyle_modifications: { type: [String], default: [] },
      professional_support: { type: [String], default: [] },
      social_emotional_support: { type: [String], default: [] }
    },
    // Risk assessment details
    risk_assessment: {
      level: { type: String }, // Low, Moderate, High
      follow_up_recommended: { type: String }, // Timeline for follow-up
      emergency_contacts: { type: [String], default: [
        'National Suicide Prevention Lifeline: 988',
        'Crisis Text Line: Text HOME to 741741',
        'Emergency Services: 911'
      ] }
    },
    // Depression severity interpretation
    severity_interpretation: {
      level: { type: String }, // Minimal, Mild, Moderate, Moderately Severe, Severe
      description: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScreeningSession", screeningSessionSchema);

