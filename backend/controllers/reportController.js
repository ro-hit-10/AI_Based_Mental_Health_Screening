// backend/controllers/reportController.js
const ProgressReport = require("../models/ProgressReport");
const ScreeningSession = require("../models/ScreeningSession");
const User = require("../models/User");
const { generatePDFReport } = require("../utils/generatePDF");

exports.generateReport = async (req, res) => {
  try {
    const { summary, suggestions, phqScores } = req.body;
    const report = new ProgressReport({
      userId: req.user.id,
      summary,
      suggestions,
      phqScores
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate report" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await ProgressReport.find({ userId: req.user.id });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress reports" });
  }
};

// Get comprehensive patient data for prescription download
exports.getPatientData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user information
    const user = await User.findById(userId).select('username email age gender occupation location mobile past_mental_health_history');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the most recent screening session
    const latestSession = await ScreeningSession.findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();

    if (!latestSession) {
      return res.status(404).json({ error: "No assessment data found. Please complete a mental health assessment first." });
    }

    // Validate that we have all required data
    if (!latestSession.phqScore || !latestSession.depression_level || !latestSession.suggestions) {
      return res.status(400).json({ error: "Incomplete assessment data. Please complete a full mental health assessment." });
    }

    // Format the comprehensive patient data with real values only
    const patientData = {
      patientInfo: {
        name: user.username,
        age: user.age,
        gender: user.gender,
        date: latestSession.createdAt.toLocaleDateString(),
        patientId: `MH-${user._id.toString().slice(-6).toUpperCase()}`
      },
      phqScore: {
        total: latestSession.phqScore,
        level: latestSession.severity_interpretation?.level,
        questions: latestSession.phq9_detailed_responses || []
      },
      domainAnalysis: {
        primaryDomain: latestSession.domain,
        secondaryDomains: latestSession.secondary_domains || [],
        riskFactors: latestSession.risk_factors || []
      },
      aiQuestions: latestSession.ai_questions_responses || [],
      aiSuggestions: [
        {
          category: 'Immediate Actions',
          suggestions: latestSession.categorized_suggestions?.immediate_actions || []
        },
        {
          category: 'Lifestyle Modifications',
          suggestions: latestSession.categorized_suggestions?.lifestyle_modifications || []
        },
        {
          category: 'Professional Support',
          suggestions: latestSession.categorized_suggestions?.professional_support || []
        },
        {
          category: 'Social & Emotional Support',
          suggestions: latestSession.categorized_suggestions?.social_emotional_support || []
        },
        {
          category: 'Therapeutic Techniques',
          suggestions: latestSession.categorized_suggestions?.therapeutic_techniques || []
        },
        {
          category: 'Medication Considerations',
          suggestions: latestSession.categorized_suggestions?.medication_considerations || []
        }
      ].filter(category => category.suggestions.length > 0), // Only include categories with suggestions
      riskAssessment: {
        level: latestSession.risk_assessment?.level,
        followUpRecommended: latestSession.risk_assessment?.follow_up_recommended,
        emergencyContacts: latestSession.risk_assessment?.emergency_contacts || [
          'National Suicide Prevention Lifeline: 988',
          'Crisis Text Line: Text HOME to 741741',
          'Emergency Services: 911'
        ],
        riskFactorsDetailed: latestSession.risk_assessment?.risk_factors_detailed || [],
        safetyPlan: latestSession.risk_assessment?.safety_plan || ''
      },
      assessmentDetails: {
        depression_level: latestSession.depression_level,
        confidence: latestSession.confidence,
        key_indicators: latestSession.key_indicators || [],
        severity_description: latestSession.severity_interpretation?.description
      },
      prescriptionData: {
        personalized_recommendations: latestSession.prescription_data?.personalized_recommendations || [],
        treatment_goals: latestSession.prescription_data?.treatment_goals || [],
        monitoring_plan: latestSession.prescription_data?.monitoring_plan || '',
        follow_up_schedule: latestSession.prescription_data?.follow_up_schedule || '',
        contraindications: latestSession.prescription_data?.contraindications || [],
        lifestyle_recommendations: latestSession.prescription_data?.lifestyle_recommendations || []
      },
      sessionDate: latestSession.createdAt
    };

    res.status(200).json(patientData);
  } catch (err) {
    console.error("Error in getPatientData:", err);
    res.status(500).json({ error: "Failed to fetch patient data" });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const { data } = req.body; // contains summary, suggestions etc.
    const pdfPath = await generatePDFReport(data, req.user.id);
    res.download(pdfPath);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
