const axios = require("axios");

const suggestTreatment = async (depressionLevel, historyText = "") => {
  try {
    const response = await axios.post("http://localhost:5001/api/suggestions", {
      depression_level: depressionLevel,
      history_text: historyText,
    });

    return response.data.suggestions;
  } catch (err) {
    return "Could not generate suggestions at the moment.";
  }
};

module.exports = suggestTreatment;