import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // Use dashboard styling

const Suggestions = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // First check if we have screening analysis data
        const analysisRaw = localStorage.getItem('screeningAnalysis');
        if (!analysisRaw) {
          navigate('/ai-screening');
          return;
        }

        const parsedAnalysis = JSON.parse(analysisRaw);
        console.log('Analysis data for suggestions:', parsedAnalysis);
        setAnalysisData(parsedAnalysis);

        // Check if suggestions are already in the analysis data
        if (parsedAnalysis.suggestions && Array.isArray(parsedAnalysis.suggestions) && parsedAnalysis.suggestions.length > 0) {
          setSuggestions(parsedAnalysis.suggestions);
          setLoading(false);
          return;
        }

        // If no suggestions in analysis, fetch them from API
        const token = localStorage.getItem('token');
        const phqAnswers = JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]');
        const domain = localStorage.getItem('assignedDomain') || parsedAnalysis.domain || '';
        const depressionLevel = parsedAnalysis?.depression_level || '';

        if (!depressionLevel) {
          setError('No depression level found. Please complete the screening first.');
          setLoading(false);
          return;
        }

        const resp = await axios.post('http://localhost:5000/api/screening/suggestions', {
          depression_level: depressionLevel,
          domain,
          phqAnswers
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const fetchedSuggestions = Array.isArray(resp.data?.suggestions) ? resp.data.suggestions : [];
        setSuggestions(fetchedSuggestions);
        
        // Update localStorage with suggestions
        const updatedAnalysis = { ...parsedAnalysis, suggestions: fetchedSuggestions };
        localStorage.setItem('screeningAnalysis', JSON.stringify(updatedAnalysis));
        
      } catch (e) {
        console.error('Failed to fetch suggestions', e);
        setError('Failed to load suggestions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [navigate]);

  const getSuggestionIcon = (index) => {
    const icons = ['💡', '🎯', '🌱', '💪', '🧠', '❤️', '🌟'];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading personalized suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error Loading Suggestions</h2>
          <p>{error}</p>
          <motion.button
            className="feature-button"
            onClick={() => navigate('/ai-screening')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back to Screening
          </motion.button>
        </div>
      </div>
    );
  }

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
        <h1>Personalized Suggestions</h1>
        <p>Based on your screening results, here are evidence-based recommendations tailored for you</p>
      </motion.div>

      {/* Summary Card */}
      {analysisData && (
        <motion.div 
          className="dashboard-stats"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="stat-card"
            whileHover={{ scale: 1.05 }}
          >
            <div className="feature-icon">📋</div>
            <h3>Your Profile</h3>
            <p className="stat-value">
              Level: {analysisData.depression_level}<br/>
              Domain: {analysisData.domain || 'General'}<br/>
              PHQ-9: {analysisData.phq9_score}/27
            </p>
          </motion.div>
          
          <motion.div
            className="stat-card"
            whileHover={{ scale: 1.05 }}
          >
            <div className="feature-icon">🎯</div>
            <h3>Suggestions Count</h3>
            <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {suggestions.length}
            </p>
            <p style={{ fontSize: '0.9rem' }}>Personalized recommendations</p>
          </motion.div>
        </motion.div>
      )}

      {/* Suggestions Grid */}
      {suggestions.length > 0 ? (
        <motion.div 
          className="features-grid"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              className="feature-card"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="feature-icon" style={{ fontSize: '2.5rem' }}>
                {getSuggestionIcon(index)}
              </div>
              <h3>Suggestion {index + 1}</h3>
              <p style={{ 
                textAlign: 'left', 
                lineHeight: '1.6', 
                color: '#e0e0e0',
                fontSize: '1.1rem'
              }}>
                {suggestion}
              </p>
            </motion.div>
          ))}
        </motion.div>
      ) : (
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
            <div className="feature-icon">⚠️</div>
            <h3>No Suggestions Available</h3>
            <p>We couldn't generate personalized suggestions at this time. Please try completing the screening again.</p>
            <motion.button
              className="feature-button"
              onClick={() => navigate('/ai-screening')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retake Screening
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div 
        className="dashboard-stats"
        style={{ marginTop: '3rem' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.button
          className="feature-button"
          style={{ width: '100%', padding: '1.2rem 2rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard 🏠
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
          onClick={() => navigate('/screening-result')}
        >
          View Results Again 📊
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div 
        className="features-grid"
        style={{ gridTemplateColumns: '1fr', marginTop: '2rem' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <div 
          className="feature-card"
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="feature-icon" style={{ fontSize: '1.5rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.2rem' }}>Important Disclaimer</h3>
          <p style={{ 
            fontSize: '0.9rem',
            color: '#b0b0b0',
            lineHeight: '1.5'
          }}>
            These suggestions are AI-generated based on your responses and are not a substitute for professional medical advice. 
            If you're experiencing severe symptoms or having thoughts of self-harm, please contact a mental health professional 
            or call a crisis hotline immediately.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Suggestions;





