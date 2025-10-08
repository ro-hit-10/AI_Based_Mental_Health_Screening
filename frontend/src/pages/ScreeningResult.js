import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Use dashboard styling

const ScreeningResult = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('screeningAnalysis');
    if (!raw) {
      navigate('/ai-screening');
      return;
    }
    
    try {
      const parsed = JSON.parse(raw);
      console.log('Screening analysis data:', parsed);
      
      if (parsed.error) {
        setError(`API Error: ${parsed.error}`);
        setLoading(false);
        return;
      }
      
      setAnalysisData({
        depression_level: parsed?.depression_level || 'No Depression',
        confidence: parsed?.confidence || 0,
        key_indicators: parsed?.key_indicators || [],
        suggestions: parsed?.suggestions || [],
        domain: parsed?.domain || '',
        phq9_score: parsed?.phq9_score || 0
      });
      setLoading(false);
    } catch (e) {
      console.error('Error parsing screening analysis:', e);
      setError('Error loading analysis data');
      setLoading(false);
    }
  }, [navigate]);

  const getLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'no depression':
      case 'minimal':
        return '#4ECDC4';
      case 'mild':
        return '#FFD93D';
      case 'moderate':
        return '#FF9F43';
      case 'moderately severe':
      case 'severe':
        return '#FF6B6B';
      default:
        return '#6C5CE7';
    }
  };

  const getLevelIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'no depression':
      case 'minimal':
        return '😊';
      case 'mild':
        return '😐';
      case 'moderate':
        return '😟';
      case 'moderately severe':
      case 'severe':
        return '😰';
      default:
        return '🤔';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Analyzing your responses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Analysis Error</h2>
          <p>{error}</p>
          <motion.button
            className="feature-button"
            onClick={() => navigate('/ai-screening')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  if (!analysisData) return null;

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
        <h1>AI Screening Results</h1>
        <p>Based on your responses, here's our comprehensive analysis</p>
      </motion.div>

      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Depression Level Card */}
        <motion.div
          className="stat-card"
          style={{ borderColor: getLevelColor(analysisData.depression_level) }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="feature-icon" style={{ fontSize: '4rem' }}>
            {getLevelIcon(analysisData.depression_level)}
          </div>
          <h3 style={{ color: getLevelColor(analysisData.depression_level) }}>
            {analysisData.depression_level}
          </h3>
          <p className="stat-value">Depression Level</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Confidence: {Math.round(analysisData.confidence * 100)}%
          </p>
        </motion.div>

        {/* PHQ-9 Score Card */}
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="feature-icon">📊</div>
          <h3>PHQ-9 Score</h3>
          <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {analysisData.phq9_score}/27
          </p>
        </motion.div>

        {/* Domain Card */}
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="feature-icon">🎯</div>
          <h3>Primary Domain</h3>
          <p className="stat-value">{analysisData.domain || 'General'}</p>
        </motion.div>
      </motion.div>

      {/* Key Indicators */}
      {analysisData.key_indicators && analysisData.key_indicators.length > 0 && (
        <motion.div 
          className="features-grid"
          style={{ gridTemplateColumns: '1fr' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.02 }}
          >
            <div className="feature-icon">🔍</div>
            <h3>Key Indicators</h3>
            <ul style={{ textAlign: 'left', color: '#e0e0e0', lineHeight: '1.8' }}>
              {analysisData.key_indicators.map((indicator, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{indicator}</li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div 
        className="dashboard-stats"
        style={{ marginTop: '2rem' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.button
          className="feature-button"
          style={{ width: '100%', padding: '1.2rem 2rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/suggestions')}
        >
          View Personalized Suggestions 💡
        </motion.button>
        
        <motion.button
          className="feature-button"
          style={{ 
            width: '100%', 
            padding: '1.2rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            marginTop: '1rem'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard 🏠
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ScreeningResult;





