const mongoose = require("mongoose");

const screeningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  answers: [{
    question: String,
    answer: String
  }],
  depression_level: {
    type: String,
    enum: ["mild", "moderate", "severe"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Screening", screeningSchema); 