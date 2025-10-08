// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    occupation: { type: String, required: true },
    location: { type: String, required: true },
    mobile: { type: String, required: true },
    past_mental_health_history: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
