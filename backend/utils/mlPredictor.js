const axios = require('axios');

// AI Engine service URLs
const AI_ENGINE_BASE = 'http://localhost:5001/api';

// Predict domain using trained RoBERTa model
async function predictDomain(phqAnswers, userHistory, occupation, age) {
  try {
    const response = await axios.post(`${AI_ENGINE_BASE}/phq9-submit`, {
      phq9_answers: phqAnswers,
      history: userHistory || '',
      occupation: occupation || '',
      age: age || 25
    });

    return response.data.domain;
  } catch (error) {
    console.error('AI Engine Domain Prediction Error:', error.message);
    throw error;
  }
}

// Generate personalized questions using trained T5 model
async function generateQuestions(phqAnswers, domain, history, previousAnswers = null, isFollowup = false) {
  try {
    const response = await axios.post(`${AI_ENGINE_BASE}/generate-questions`, {
      phq9_answers: phqAnswers,
      domain: domain,
      history: history || '',
      previous_answers: previousAnswers,
      is_followup: isFollowup
    });

    return response.data.questions;
  } catch (error) {
    console.error('AI Engine Question Generation Error:', error.message);
    throw error;
  }
}

// Analyze depression level using Gemini API
async function analyzeDepression(phqAnswers, domain, history, followUpAnswers) {
  try {
    const response = await axios.post(`${AI_ENGINE_BASE}/analyze-depression`, {
      phq9_answers: phqAnswers,
      domain: domain,
      history: history || '',
      follow_up_answers: followUpAnswers
    });

    return response.data;
  } catch (error) {
    console.error('AI Engine Depression Analysis Error:', error.message);
    throw error;
  }
}

// Generate personalized suggestions
async function generateSuggestions(depressionLevel, domain, history, phqAnswers) {
  try {
    const response = await axios.post(`${AI_ENGINE_BASE}/generate-suggestions`, {
      depression_level: depressionLevel,
      domain: domain,
      history: history || '',
      phq9_answers: phqAnswers
    });

    return response.data.suggestions;
  } catch (error) {
    console.error('AI Engine Suggestions Error:', error.message);
    throw error;
  }
}

// Complete screening analysis (depression level + suggestions)
async function completeScreening(phqAnswers, domain, history, followUpAnswers) {
  try {
    const response = await axios.post(`${AI_ENGINE_BASE}/complete-screening`, {
      phq9_answers: phqAnswers,
      domain: domain,
      history: history || '',
      follow_up_answers: followUpAnswers
    });

    return response.data;
  } catch (error) {
    console.error('AI Engine Complete Screening Error:', error.message);
    throw error;
  }
}

module.exports = {
  predictDomain,
  generateQuestions,
  analyzeDepression,
  generateSuggestions,
  completeScreening
};
