// backend/models/PHQTest.js
const mongoose = require("mongoose");

const phqTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [Number], required: true }, // Array of 9 PHQ-9 responses (0-3 scale)
    score: { type: Number, required: true },
    domain: { type: String, required: false },
    // Additional detailed PHQ-9 data
    severity_level: { type: String }, // Minimal, Mild, Moderate, Moderately Severe, Severe
    interpretation: { type: String }, // Description of what the score means
    question_responses: [{
      question_index: { type: Number }, // 0-8 for PHQ-9 questions
      question_text: { type: String }, // The actual question text
      response_value: { type: Number }, // 0-3 response
      response_text: { type: String } // "Not at all", "Several days", etc.
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PHQTest", phqTestSchema);
