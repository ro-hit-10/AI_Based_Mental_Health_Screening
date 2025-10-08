// backend/controllers/phqController.js
const PHQTest = require("../models/PHQTest");
const User = require("../models/User");
const { predictDomain } = require("../utils/mlPredictor");

// Submit PHQ-9 test and get domain assignment
exports.submitPHQ = async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;
    
    if (!answers || !Array.isArray(answers) || answers.length !== 9) {
      return res.status(400).json({ error: "PHQ-9 answers must be an array of 9 responses" });
    }
    
    // Validate answer values (0-3 scale)
    const validAnswers = answers.every(answer => 
      typeof answer === 'number' && answer >= 0 && answer <= 3
    );
    
    if (!validAnswers) {
      return res.status(400).json({ error: "Each PHQ-9 answer must be between 0-3" });
    }
    
    // Calculate total score
    const score = answers.reduce((sum, val) => sum + val, 0);
    
    // Fetch user context
    const user = await User.findById(userId).select('past_mental_health_history occupation age');

    // Determine domain via AI engine using PHQ9 + history + occupation + age
    let domain = null;
    try {
      domain = await predictDomain(
        answers,
        user?.past_mental_health_history || '',
        user?.occupation || '',
        user?.age || 25
      );
    } catch (_) {
      // AI engine unavailable; proceed without domain
      domain = null;
    }
    
    // Save PHQ test with domain and score to MongoDB
    const phqTest = new PHQTest({ 
      userId, 
      answers,
      domain,
      score
    });
    
    await phqTest.save();
    
    // Interpret score level
    let severity = 'Minimal';
    if (score >= 20) severity = 'Severe';
    else if (score >= 15) severity = 'Moderately Severe';
    else if (score >= 10) severity = 'Moderate';
    else if (score >= 5) severity = 'Mild';
    
    res.status(200).json({ 
      msg: "PHQ-9 submitted successfully",
      testId: phqTest._id,
      score: score,
      severity: severity,
      domain: domain,
      canStartScreening: true // User can now start AI screening
    });
  } catch (err) {
    console.error("Error in submitPHQ:", err);
    res.status(500).json({ error: "Error saving PHQ-9 test" });
  }
};

// Get PHQ-9 history for user
exports.getPHQHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tests = await PHQTest.find({ userId })
      .sort({ createdAt: -1 })
      .select('score domain createdAt answers')
      .limit(10);
    
    const formattedTests = tests.map(test => ({
      id: test._id,
      score: test.score,
      domain: test.domain,
      createdAt: test.createdAt,
      severity: test.score >= 20 ? 'Severe' : 
               test.score >= 15 ? 'Moderately Severe' :
               test.score >= 10 ? 'Moderate' :
               test.score >= 5 ? 'Mild' : 'Minimal'
    }));
    
    res.status(200).json(formattedTests);
  } catch (err) {
    console.error("Error in getPHQHistory:", err);
    res.status(500).json({ error: "Failed to fetch PHQ-9 history" });
  }
};

// Get latest PHQ-9 test for screening
exports.getLatestPHQ = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const latestTest = await PHQTest.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('answers score domain createdAt');
    
    if (!latestTest) {
      return res.status(404).json({ error: "No PHQ-9 test found. Please complete the PHQ-9 assessment first." });
    }
    
    res.status(200).json({
      id: latestTest._id,
      answers: latestTest.answers,
      score: latestTest.score,
      domain: latestTest.domain,
      createdAt: latestTest.createdAt,
      canStartScreening: true
    });
  } catch (err) {
    console.error("Error in getLatestPHQ:", err);
    res.status(500).json({ error: "Failed to fetch latest PHQ-9 test" });
  }
};

// Get specific PHQ-9 test details
exports.getPHQDetails = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;
    
    const test = await PHQTest.findOne({ _id: testId, userId });
    
    if (!test) {
      return res.status(404).json({ error: "PHQ-9 test not found" });
    }
    
    res.status(200).json(test);
  } catch (err) {
    console.error("Error in getPHQDetails:", err);
    res.status(500).json({ error: "Failed to fetch PHQ-9 details" });
  }
};
