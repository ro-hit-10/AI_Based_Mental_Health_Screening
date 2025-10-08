import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="onboarding-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="onboarding-title"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to MindCare
      </motion.h1>
      
      <div className="cards-container">
        <motion.div 
          className="onboarding-card"
          variants={cardVariants}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          onClick={() => navigate('/login')}
        >
          <div className="card-content">
            <h2>Login</h2>
            <p>Already have an account? Sign in to continue your journey.</p>
            <motion.button 
              className="card-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="onboarding-card"
          variants={cardVariants}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          onClick={() => navigate('/register')}
        >
          <div className="card-content">
            <h2>Register</h2>
            <p>New to MindCare? Create an account to get started.</p>
            <motion.button 
              className="card-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Account
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Onboarding; 