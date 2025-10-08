import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Use dashboard styling

const PrescriptionDownload = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load patient data from API
    const loadPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/reports/patient-data', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch patient data');
        }

        const data = await response.json();
        setPatientData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading patient data:', error);
        setPatientData(null);
        setLoading(false);
      }
    };

    loadPatientData();
  }, []);

  const getDepressionLevelColor = (level) => {
    switch(level.toLowerCase()) {
      case 'minimal depression':
      case 'minimal':
        return '#4ECDC4';
      case 'mild depression':
      case 'mild':
        return '#FFD93D';
      case 'moderate depression':
      case 'moderate':
        return '#FF9A8B';
      case 'moderately severe depression':
      case 'moderately severe':
        return '#FF6B6B';
      case 'severe depression':
      case 'severe':
        return '#FF4757';
      default:
        return '#00b4d8';
    }
  };

  const getScoreInterpretation = (score) => {
    if (score <= 4) return { level: 'Minimal Depression', description: 'Little to no depression symptoms' };
    if (score <= 9) return { level: 'Mild Depression', description: 'Some depression symptoms that may affect daily life' };
    if (score <= 14) return { level: 'Moderate Depression', description: 'Moderate depression symptoms requiring attention' };
    if (score <= 19) return { level: 'Moderately Severe Depression', description: 'Significant symptoms requiring professional help' };
    return { level: 'Severe Depression', description: 'Severe symptoms requiring immediate professional intervention' };
  };

  const downloadPDF = async () => {
    try {
      // Create PDF content
      const pdfContent = generatePDFContent();
      
      // For now, we'll create a downloadable text file
      // In production, you would use a PDF library like jsPDF or html2pdf
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mental_Health_Assessment_${patientData.patientInfo.patientId}_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating download. Please try again.');
    }
  };

  const generatePDFContent = () => {
    if (!patientData) return '';

    return `
MENTAL HEALTH ASSESSMENT REPORT
=====================================

PATIENT INFORMATION
-------------------
Name: ${patientData.patientInfo.name}
Age: ${patientData.patientInfo.age}
Gender: ${patientData.patientInfo.gender}
Date: ${patientData.patientInfo.date}
Patient ID: ${patientData.patientInfo.patientId}

PHQ-9 DEPRESSION SCREENING RESULTS
----------------------------------
Total Score: ${patientData.phqScore.total}/27
Depression Level: ${patientData.phqScore.level}

Individual Question Responses:
${patientData.phqScore.questions.map((q, i) => `${i + 1}. ${q.question_text}\n   Answer: ${q.response_text} (Score: ${q.response_value})`).join('\n')}

DOMAIN ANALYSIS
---------------
Primary Domain: ${patientData.domainAnalysis.primaryDomain}
Secondary Domains: ${patientData.domainAnalysis.secondaryDomains.join(', ')}
Risk Factors: ${patientData.domainAnalysis.riskFactors.join(', ')}

AI ASSESSMENT QUESTIONS & RESPONSES
-----------------------------------
${patientData.aiQuestions.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\n`).join('\n')}

AI GENERATED RECOMMENDATIONS
----------------------------
${patientData.aiSuggestions.map(category => `
${category.category.toUpperCase()}:
${category.suggestions.map(s => `• ${s}`).join('\n')}
`).join('\n')}

RISK ASSESSMENT
---------------
Risk Level: ${patientData.riskAssessment.level}
Follow-up Recommended: ${patientData.riskAssessment.followUpRecommended}

Emergency Contacts:
${patientData.riskAssessment.emergencyContacts.map(c => `• ${c}`).join('\n')}

DISCLAIMER
----------
This assessment is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Please consult with a qualified healthcare provider for proper evaluation and treatment of mental health concerns.

Generated on: ${new Date().toLocaleString()}
`;
  };

  if (loading) {
    return (
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '3rem' }}
        >
          🔄
        </motion.div>
      </motion.div>
    );
  }

  if (!patientData) {
    return (
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="feature-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div className="feature-icon" style={{ fontSize: '4rem' }}>❌</div>
          <h2>No Assessment Data Found</h2>
          <p>Please complete a mental health assessment first to download your prescription.</p>
          <motion.button
            className="feature-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/phq-test')}
          >
            Take PHQ-9 Assessment
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const scoreInterpretation = getScoreInterpretation(patientData.phqScore.total);

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="dashboard-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>📋 Mental Health Assessment Report</h1>
        <p>Complete assessment results with AI analysis and personalized recommendations</p>
      </motion.div>

      {/* Patient Information */}
      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="stat-card">
          <div className="feature-icon">👤</div>
          <h3>Patient Information</h3>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'left' }}>
            <p><strong>Name:</strong> {patientData.patientInfo.name}</p>
            <p><strong>Age:</strong> {patientData.patientInfo.age}</p>
            <p><strong>Gender:</strong> {patientData.patientInfo.gender}</p>
            <p><strong>Assessment Date:</strong> {patientData.patientInfo.date}</p>
            <p><strong>Patient ID:</strong> {patientData.patientInfo.patientId}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="feature-icon">📊</div>
          <h3>PHQ-9 Score</h3>
          <p className="stat-value" style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            color: getDepressionLevelColor(scoreInterpretation.level)
          }}>
            {patientData.phqScore.total}<span style={{ fontSize: '1.5rem' }}>/27</span>
          </p>
          <p style={{ fontSize: '0.9rem', color: getDepressionLevelColor(scoreInterpretation.level) }}>
            {scoreInterpretation.level}
          </p>
        </div>

        <div className="stat-card">
          <div className="feature-icon">🎯</div>
          <h3>Primary Domain</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00b4d8' }}>
            {patientData.domainAnalysis.primaryDomain}
          </p>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <p><strong>Secondary:</strong></p>
            {patientData.domainAnalysis.secondaryDomains.map((domain, i) => (
              <span key={i} style={{ 
                display: 'inline-block', 
                background: 'rgba(0,180,216,0.2)', 
                color: '#00b4d8',
                padding: '0.2rem 0.5rem', 
                borderRadius: '10px', 
                margin: '0.2rem',
                fontSize: '0.8rem'
              }}>
                {domain}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* PHQ-9 Detailed Results */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>📝 PHQ-9 Detailed Question Responses</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {patientData.phqScore.questions.map((q, index) => (
              <div key={index} style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '1rem', 
                borderRadius: '10px',
                borderLeft: `4px solid ${q.response_value === 0 ? '#4ECDC4' : q.response_value === 1 ? '#FFD93D' : q.response_value === 2 ? '#FF9A8B' : '#FF6B6B'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      {index + 1}. {q.question_text}
                    </p>
                    <p style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                      <strong>Response:</strong> {q.response_text}
                    </p>
                  </div>
                  <div style={{ 
                    background: q.response_value === 0 ? '#4ECDC4' : q.response_value === 1 ? '#FFD93D' : q.response_value === 2 ? '#FF9A8B' : '#FF6B6B',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    minWidth: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {q.response_value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Questions and Responses */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>🤖 AI Assessment Questions & Responses</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {patientData.aiQuestions.map((qa, index) => (
              <div key={index} style={{ 
                background: 'rgba(0, 180, 216, 0.05)', 
                padding: '1.5rem', 
                borderRadius: '15px',
                border: '1px solid rgba(0, 180, 216, 0.2)'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#00b4d8', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                      Q{index + 1}
                    </span>
                    <span style={{ color: '#00b4d8', fontWeight: 'bold' }}>AI Question:</span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', marginLeft: '1rem' }}>
                    {qa.question}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#4ECDC4', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                      A{index + 1}
                    </span>
                    <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>Your Response:</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#e0e0e0', lineHeight: '1.5', marginLeft: '1rem' }}>
                    {qa.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>💡 AI-Generated Personalized Recommendations</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {patientData.aiSuggestions.map((category, index) => (
              <div key={index} style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                padding: '1.5rem', 
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{ 
                  color: '#FFD93D', 
                  marginBottom: '1rem', 
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {index === 0 ? '⚡' : index === 1 ? '🔄' : index === 2 ? '👨‍⚕️' : '💝'}
                  {category.category}
                </h4>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {category.suggestions.map((suggestion, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '10px'
                    }}>
                      <span style={{ color: '#4ECDC4', fontSize: '1.2rem', marginTop: '0.1rem' }}>•</span>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.4', margin: 0 }}>
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>⚠️ Risk Assessment & Follow-up</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ 
              background: 'rgba(255, 154, 139, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              border: '2px solid rgba(255, 154, 139, 0.3)'
            }}>
              <h4 style={{ color: '#FF9A8B', marginBottom: '1rem' }}>📊 Risk Level</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF9A8B' }}>
                {patientData.riskAssessment.level} Risk
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Follow-up recommended: <strong>{patientData.riskAssessment.followUpRecommended}</strong>
              </p>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 107, 107, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              border: '2px solid rgba(255, 107, 107, 0.3)'
            }}>
              <h4 style={{ color: '#FF6B6B', marginBottom: '1rem' }}>🚨 Emergency Contacts</h4>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                {patientData.riskAssessment.emergencyContacts.map((contact, i) => (
                  <p key={i} style={{ margin: '0.5rem 0' }}>
                    <strong>{contact}</strong>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="dashboard-stats"
        style={{ marginTop: '3rem' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.button
          className="feature-button"
          style={{ 
            background: 'linear-gradient(45deg, #4ECDC4, #45B7AF)',
            fontSize: '1.1rem',
            padding: '1.2rem 2rem'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPDF}
        >
          📥 Download Full Report
        </motion.button>
        
        <motion.button
          className="feature-button"
          style={{ 
            background: 'linear-gradient(45deg, #6C5CE7, #5A4FCF)',
            fontSize: '1.1rem',
            padding: '1.2rem 2rem'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/professionals')}
        >
          👨‍⚕️ Find Professional Help
        </motion.button>
        
        <motion.button
          className="feature-button"
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            fontSize: '1.1rem',
            padding: '1.2rem 2rem'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        style={{ marginTop: '2rem' }}
      >
        <div className="stat-card" style={{ 
          background: 'rgba(255, 215, 61, 0.1)', 
          border: '1px solid rgba(255, 215, 61, 0.3)' 
        }}>
          <h4 style={{ color: '#FFD93D', marginBottom: '1rem' }}>⚠️ Important Disclaimer</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#e0e0e0' }}>
            This assessment is for informational purposes only and should not replace professional medical advice, 
            diagnosis, or treatment. Please consult with a qualified healthcare provider for proper evaluation 
            and treatment of mental health concerns. If you are experiencing thoughts of self-harm or suicide, 
            please seek immediate professional help or contact emergency services.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrescriptionDownload;
