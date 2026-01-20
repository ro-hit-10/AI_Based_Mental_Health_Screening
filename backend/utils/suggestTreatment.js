const axios = require("axios");

const AI_ENGINE_BASE = process.env.AI_ENGINE_BASE || "http://localhost:5001/api";

const suggestTreatment = async (depressionLevel, historyText = "") => {
  try {
    const response = await axios.post(`${AI_ENGINE_BASE}/suggestions`, {
      depression_level: depressionLevel,
      history_text: historyText,
    });

    return response.data.suggestions;
  } catch (err) {
    return "Could not generate suggestions at the moment.";
  }
};

module.exports = suggestTreatment;