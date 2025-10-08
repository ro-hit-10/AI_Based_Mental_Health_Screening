// frontend/src/components/ProgressTracker.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './styles.css';

const ProgressTracker = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/reports/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgress(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  return (
    <motion.div 
      className="progress-tracker-container"
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }}
    >
      <h2>📈 Weekly Progress Tracker</h2>
      {loading ? (
        <p>Loading...</p>
      ) : progress.length === 0 ? (
        <p>No progress data yet. Take a screening test to begin tracking!</p>
      ) : (
        <ul className="progress-list">
          {progress.map((entry, idx) => (
            <motion.li
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <strong>Week {entry.week}:</strong> {entry.summary}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default ProgressTracker;
