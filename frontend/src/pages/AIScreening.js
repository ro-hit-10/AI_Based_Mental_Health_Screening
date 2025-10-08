import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screening from '../components/Screening';

const AIScreening = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed PHQ-9
    const hasCompletedPHQ = localStorage.getItem('hasCompletedPHQ');
    const latestPHQAnswers = localStorage.getItem('latestPHQAnswers');
    
    if (!hasCompletedPHQ || !latestPHQAnswers) {
      // Redirect to PHQ test first
      navigate('/phq-test');
      return;
    }
  }, [navigate]);

  return <Screening />;
};

export default AIScreening; 