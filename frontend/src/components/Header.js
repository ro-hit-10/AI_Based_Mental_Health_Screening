import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Header.css';

const Header = ({ showLogo = true, showNav = true, title = "MindCare AI" }) => {
  const navigate = useNavigate();

  return (
    <motion.header 
      className="header"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        {showLogo && (
          <motion.div 
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src="/logo.png" 
              alt="MindCare AI Logo" 
              className="logo"
              onError={(e) => {
                // Fallback to text if logo image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="logo-text" style={{ display: 'none' }}>
              {title}
            </span>
          </motion.div>
        )}
        
        {showNav && (
          <nav className="nav-menu">
            <motion.button
              className="nav-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
            >
              Login
            </motion.button>
            <motion.button
              className="nav-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </motion.button>
          </nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
