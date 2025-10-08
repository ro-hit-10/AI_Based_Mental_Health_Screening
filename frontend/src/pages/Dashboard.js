import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.user);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const features = [
    {
      title: "PHQ-9 Test",
      description: "Take a comprehensive depression screening test",
      icon: "📋",
      path: "/phq-test",
      color: "#FF6B6B",
      gradient: "linear-gradient(45deg, #FF6B6B, #FF8E8E)"
    },
    {
      title: "AI Screening",
      description: "Get AI-powered mental health assessment",
      icon: "🤖",
      path: "/ai-screening",
      color: "#6C5CE7",
      gradient: "linear-gradient(45deg, #6C5CE7, #8F7FF7)"
    },
    {
      title: "Download Prescriptions",
      description: "Access all your prescriptions and recommendations",
      icon: "📥",
      path: "/prescription-download",
      color: "#96CEB4",
      gradient: "linear-gradient(45deg, #96CEB4, #88C0A3)"
    },
    {
      title: "Connect with Professionals",
      description: "Book sessions with mental health experts",
      icon: "👨‍⚕️",
      path: "/professionals",
      color: "#FF9F43",
      gradient: "linear-gradient(45deg, #FF9F43, #FFB976)"
    },
    {
      title: "Yoga Videos",
      description: "Access guided yoga sessions for mental wellness",
      icon: "🧘‍♀️",
      path: "/yoga",
      color: "#A8E6CF",
      gradient: "linear-gradient(45deg, #A8E6CF, #88D8B0)"
    },
    {
      title: "Mental Health Blogs",
      description: "Read informative articles about mental health",
      icon: "📚",
      path: "/blogs",
      color: "#FFD93D",
      gradient: "linear-gradient(45deg, #FFD93D, #FFE566)"
    }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.disabled) {
      return; // Don't navigate if feature is disabled
    }
    setActiveFeature(feature);
    setTimeout(() => {
      navigate(feature.path);
    }, 500);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
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
        <h1>Welcome Back{user ? `, ${user.username}` : ''}!</h1>
        <p>Track your mental wellness and see suggestions tailored for you.</p>
      </motion.div>

      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="feature-icon">📊</div>
          <h3>Your Progress</h3>
          <p className="stat-value">Track your mental wellness journey</p>
        </motion.div>
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="feature-icon">🎯</div>
          <h3>Goals</h3>
          <p className="stat-value">Set and achieve your wellness goals</p>
        </motion.div>
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="feature-icon">📈</div>
          <h3>Insights</h3>
          <p className="stat-value">View your improvement over time</p>
        </motion.div>
      </motion.div>

      <motion.div 
        className="features-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={`feature-card ${feature.disabled ? 'disabled' : ''}`}
            whileHover={{ scale: feature.disabled ? 1 : 1.05 }}
            whileTap={{ scale: feature.disabled ? 1 : 0.95 }}
            onClick={() => handleFeatureClick(feature)}
            style={{ opacity: feature.disabled ? 0.6 : 1 }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            {feature.disabled && (
              <p className="disabled-message">Complete AI screening first</p>
            )}
            <motion.button
              className="feature-button"
              whileHover={{ scale: feature.disabled ? 1 : 1.05 }}
              whileTap={{ scale: feature.disabled ? 1 : 0.95 }}
              disabled={feature.disabled}
            >
              {feature.disabled ? 'Locked' : 'Explore'}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {activeFeature && (
          <motion.div
            className="feature-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveFeature(null)}
          >
            <motion.div
              className="feature-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2>{activeFeature.title}</h2>
              <p>{activeFeature.description}</p>
              <motion.button
                className="feature-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(activeFeature.path)}
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard; 