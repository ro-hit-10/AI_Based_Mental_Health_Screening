import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screening from '../components/Screening';

const AIScreening = () => {
  const navigate = useNavigate();
  const ready = Boolean(localStorage.getItem('hasCompletedPHQ') && localStorage.getItem('latestPHQAnswers'));

  useEffect(() => {
    // The AI screening builds on the PHQ-9 answers, so send the user there first
    if (!ready) navigate('/phq-test');
  }, [navigate, ready]);

  return ready ? <Screening /> : null;
};

export default AIScreening;
