// backend/models/ProgressReport.js
const mongoose = require("mongoose");

const progressReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    summary: { type: String, required: true },
    suggestions: [String],
    phqScores: [Number],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgressReport", progressReportSchema);
