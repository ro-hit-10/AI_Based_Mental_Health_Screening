import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PHQResult = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    const s = localStorage.getItem('phqScore');
    const d = localStorage.getItem('assignedDomain');
    if (!s || !d) {
      navigate('/phq-test');
      return;
    }
    setScore(Number(s));
    setDomain(d);
  }, [navigate]);

  if (score === null) return null;

  return (
    <div className="phq-test-container">
      <motion.div 
        className="phq-results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Your PHQ-9 Results</h2>
        <div className="score-container">
          <h3>Score: {score}</h3>
          <p>Assigned Domain: {domain}</p>
        </div>
        <motion.button
          className="continue-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/screening')}
        >
          Start AI Screening
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PHQResult;



