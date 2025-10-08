import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo at top left */}
      <motion.div 
        className="home-logo"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <img 
          src="/logo.png" 
          alt="MindCare AI Logo" 
          className="logo-image"
        />
      </motion.div>
      <div className="hero-section">
        <motion.h1 
          className="hero-title"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Your Journey to Mental Wellness
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Take the first step towards better mental health with our AI-powered assessment and personalized recommendations.
        </motion.p>
        <motion.div
          className="cta-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.button
            className="get-started-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/onboarding')}
          >
            Get Started
            <motion.span
              className="btn-arrow"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
      <div className="features-section">
        <motion.div 
          className="feature-card"
          whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
        >
          <h3>AI-Powered Assessment</h3>
          <p>Get personalized insights using advanced AI technology</p>
        </motion.div>
        <motion.div 
          className="feature-card"
          whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
        >
          <h3>Personalized Recommendations</h3>
          <p>Receive tailored suggestions for your mental wellness journey</p>
        </motion.div>
        <motion.div 
          className="feature-card"
          whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
        >
          <h3>Track Your Progress</h3>
          <p>Monitor your mental health improvements over time</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;