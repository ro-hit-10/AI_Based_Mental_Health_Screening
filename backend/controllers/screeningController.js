// backend/controllers/screeningController.js
const ScreeningSession = require("../models/ScreeningSession");
const User = require("../models/User");
const { generateQuestions, completeScreening, generateSuggestions } = require("../utils/mlPredictor");

// Start screening session - generate personalized questions
exports.runScreening = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latestPHQAnswers, domain, previousAnswers, isFollowup } = req.body;

    if (!latestPHQAnswers || !domain) {
      return res.status(400).json({ error: "PHQ-9 answers and domain are required" });
    }

    // Get user context
    const user = await User.findById(userId).select('past_mental_health_history');

    // Generate personalized questions using trained T5 model
    const questions = await generateQuestions(
      latestPHQAnswers,
      domain,
      user?.past_mental_health_history || '',
      previousAnswers,
      isFollowup || false
    );

    res.status(200).json({ 
      questions,
      domain,
      isFollowup: isFollowup || false
    });
  } catch (err) {
    console.error("Error in runScreening:", err);
    res.status(500).json({ error: "AI screening failed" });
  }
};

// Helper function to get PHQ-9 questions
const getPhq9Questions = () => {
  return [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself"
  ];
};

// Helper function to get response text
const getResponseText = (value) => {
  switch(value) {
    case 0: return "Not at all";
    case 1: return "Several days";
    case 2: return "More than half the days";
    case 3: return "Nearly every day";
    default: return "Not specified";
  }
};

// Helper function to get severity interpretation
const getSeverityInterpretation = (score) => {
  if (score <= 4) return { level: "Minimal Depression", description: "Little to no depression symptoms" };
  if (score <= 9) return { level: "Mild Depression", description: "Some depression symptoms that may affect daily life" };
  if (score <= 14) return { level: "Moderate Depression", description: "Moderate depression symptoms requiring attention" };
  if (score <= 19) return { level: "Moderately Severe Depression", description: "Significant symptoms requiring professional help" };
  return { level: "Severe Depression", description: "Severe symptoms requiring immediate professional intervention" };
};

// Save screening results and get complete analysis
exports.saveScreeningResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { domain, latestPHQAnswers, questions, answers } = req.body;

    if (!domain || !latestPHQAnswers || !answers || !questions) {
      return res.status(400).json({ error: "Domain, PHQ-9 answers, screening questions, and screening answers are required" });
    }

    // Validate that arrays are actually arrays
    if (!Array.isArray(latestPHQAnswers) || !Array.isArray(answers) || !Array.isArray(questions)) {
      return res.status(400).json({ error: "PHQ-9 answers, questions, and answers must be arrays" });
    }

    // Get user context
    const user = await User.findById(userId).select('username age gender past_mental_health_history occupation');

    // Get complete screening analysis from AI engine
    const analysis = await completeScreening(
      latestPHQAnswers,
      domain,
      user?.past_mental_health_history || '',
      answers
    );

    // Calculate PHQ-9 score from AI response
    const phqScore = analysis.phq9_score || latestPHQAnswers.reduce((sum, score) => sum + (score || 0), 0);
    
    // Get PHQ-9 questions and create detailed responses
    const phq9Questions = getPhq9Questions();
    const phq9DetailedResponses = latestPHQAnswers.map((answer, index) => ({
      question_index: index,
      question_text: phq9Questions[index] || `Question ${index + 1}`,
      response_value: answer || 0,
      response_text: getResponseText(answer || 0)
    }));

    // Create AI questions and responses array
    const aiQuestionsResponses = Array.isArray(questions) ? questions.map((question, index) => ({
      question: question || '',
      answer: Array.isArray(answers) && answers[index] ? answers[index] : ''
    })) : [];

    // Get severity interpretation
    const severityInterpretation = getSeverityInterpretation(phqScore);

    // Enhanced risk assessment based on PHQ-9 score and suicidal ideation (question 9)
    let riskAssessment = {
      level: 'Low',
      follow_up_recommended: 'Within 1 month',
      emergency_contacts: [
        'National Suicide Prevention Lifeline: 988',
        'Crisis Text Line: Text HOME to 741741',
        'Emergency Services: 911'
      ],
      risk_factors_detailed: [],
      safety_plan: ''
    };

    // Determine risk level based on PHQ-9 score and specific question 9 (suicidal ideation)
    if (phqScore >= 20 || (latestPHQAnswers[8] && latestPHQAnswers[8] >= 2)) {
      riskAssessment.level = 'High';
      riskAssessment.follow_up_recommended = 'Immediately';
      riskAssessment.risk_factors_detailed = ['High PHQ-9 score', 'Suicidal ideation present'];
      riskAssessment.safety_plan = 'Immediate professional intervention required. Do not leave patient alone.';
    } else if (phqScore >= 15) {
      riskAssessment.level = 'Moderate';
      riskAssessment.follow_up_recommended = 'Within 1 week';
      riskAssessment.risk_factors_detailed = ['Moderate depression symptoms'];
      riskAssessment.safety_plan = 'Regular monitoring and professional support recommended.';
    } else if (phqScore >= 10) {
      riskAssessment.level = 'Low-Moderate';
      riskAssessment.follow_up_recommended = 'Within 2 weeks';
      riskAssessment.risk_factors_detailed = ['Mild depression symptoms'];
    }

    // Categorize suggestions for better prescription
    const categorizedSuggestions = {
      immediate_actions: [],
      lifestyle_modifications: [],
      professional_support: [],
      social_emotional_support: [],
      therapeutic_techniques: [],
      medication_considerations: []
    };

    // Categorize AI suggestions based on content
    if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
      analysis.suggestions.forEach(suggestion => {
        const lowerSuggestion = suggestion.toLowerCase();
        if (lowerSuggestion.includes('immediate') || lowerSuggestion.includes('urgent') || lowerSuggestion.includes('emergency')) {
          categorizedSuggestions.immediate_actions.push(suggestion);
        } else if (lowerSuggestion.includes('exercise') || lowerSuggestion.includes('sleep') || lowerSuggestion.includes('diet') || lowerSuggestion.includes('routine')) {
          categorizedSuggestions.lifestyle_modifications.push(suggestion);
        } else if (lowerSuggestion.includes('professional') || lowerSuggestion.includes('therapist') || lowerSuggestion.includes('counselor') || lowerSuggestion.includes('psychiatrist')) {
          categorizedSuggestions.professional_support.push(suggestion);
        } else if (lowerSuggestion.includes('social') || lowerSuggestion.includes('family') || lowerSuggestion.includes('friend') || lowerSuggestion.includes('support')) {
          categorizedSuggestions.social_emotional_support.push(suggestion);
        } else if (lowerSuggestion.includes('therapy') || lowerSuggestion.includes('cbt') || lowerSuggestion.includes('meditation') || lowerSuggestion.includes('technique')) {
          categorizedSuggestions.therapeutic_techniques.push(suggestion);
        } else if (lowerSuggestion.includes('medication') || lowerSuggestion.includes('antidepressant') || lowerSuggestion.includes('prescription')) {
          categorizedSuggestions.medication_considerations.push(suggestion);
        } else {
          // Default to social emotional support if no specific category matches
          categorizedSuggestions.social_emotional_support.push(suggestion);
        }
      });
    }

    // Generate personalized prescription data
    const prescriptionData = {
      personalized_recommendations: analysis.suggestions || [],
      treatment_goals: [
        `Reduce PHQ-9 score from ${phqScore} to below 10`,
        `Improve daily functioning in ${domain} domain`,
        `Develop healthy coping mechanisms`,
        `Establish regular support system`
      ],
      monitoring_plan: `Track PHQ-9 symptoms weekly. Reassess in ${riskAssessment.follow_up_recommended.toLowerCase()}.`,
      follow_up_schedule: riskAssessment.follow_up_recommended,
      contraindications: [],
      lifestyle_recommendations: categorizedSuggestions.lifestyle_modifications
    };

    // Add contraindications based on depression level
    if (analysis.depression_level === 'Severe') {
      prescriptionData.contraindications.push('Avoid alcohol and recreational drugs', 'Do not discontinue medications without medical supervision');
    }

    // Save comprehensive screening session to database
    const session = new ScreeningSession({
      userId,
      domain,
      phqScore,
      phqAnswers: Array.isArray(latestPHQAnswers) ? latestPHQAnswers : [],
      questions: Array.isArray(questions) ? questions : [],
      answers: Array.isArray(answers) ? answers : [],
      depression_level: analysis.depression_level,
      suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
      // Store detailed PHQ-9 responses
      phq9_detailed_responses: phq9DetailedResponses,
      // Store AI questions and user responses
      ai_questions_responses: aiQuestionsResponses,
      // Store AI analysis results
      confidence: analysis.confidence || 0.8,
      key_indicators: analysis.key_indicators || [],
      secondary_domains: [], // Could be populated by AI in future
      risk_factors: riskAssessment.risk_factors_detailed,
      // Store categorized suggestions
      categorized_suggestions: categorizedSuggestions,
      risk_assessment: riskAssessment,
      severity_interpretation: severityInterpretation,
      prescription_data: prescriptionData
    });
    
    await session.save();

    res.status(201).json({ 
      msg: "Screening completed and saved successfully", 
      analysis: {
        depression_level: analysis.depression_level,
        confidence: analysis.confidence,
        key_indicators: analysis.key_indicators,
        suggestions: analysis.suggestions,
        domain: analysis.domain,
        phq9_score: phqScore,
        severity_interpretation: severityInterpretation,
        risk_assessment: riskAssessment,
        categorized_suggestions: categorizedSuggestions,
        prescription_data: prescriptionData
      },
      sessionId: session._id
    });
  } catch (err) {
    console.error("Error in saveScreeningResult:", err);
    res.status(500).json({ error: "Failed to save screening" });
  }
};

// Get suggestions only using trained model via AI engine
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { depression_level, domain, phqAnswers } = req.body;

    if (!depression_level || !Array.isArray(phqAnswers)) {
      return res.status(400).json({ error: "Depression level and PHQ-9 answers are required" });
    }

    const user = await User.findById(userId).select('past_mental_health_history');
    const suggestions = await generateSuggestions(
      depression_level,
      domain || '',
      user?.past_mental_health_history || '',
      phqAnswers
    );

    res.status(200).json({ suggestions });
  } catch (err) {
    console.error("Error in getSuggestions:", err);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

// Get screening history for a user
exports.getScreeningHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sessions = await ScreeningSession.find({ userId })
      .sort({ createdAt: -1 })
      .select('domain depression_level phqScore createdAt suggestions')
      .limit(10);

    res.status(200).json(sessions);
  } catch (err) {
    console.error("Error in getScreeningHistory:", err);
    res.status(500).json({ error: "Failed to fetch screening history" });
  }
};

// Get specific screening session details
exports.getScreeningDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const session = await ScreeningSession.findOne({ 
      _id: sessionId, 
      userId 
    });

    if (!session) {
      return res.status(404).json({ error: "Screening session not found" });
    }

    res.status(200).json(session);
  } catch (err) {
    console.error("Error in getScreeningDetails:", err);
    res.status(500).json({ error: "Failed to fetch screening details" });
  }
};