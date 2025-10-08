import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PHQTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [domain, setDomain] = useState(null);
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  const questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself",
    "Trouble concentrating on things",
    "Moving or speaking so slowly that other people could have noticed",
    "Thoughts that you would be better off dead or of hurting yourself"
  ];

  const handleAnswer = async (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: value
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit PHQ-9 test
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/phq/submit', {
          answers: Object.values(newAnswers)
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setDomain(response.data.domain);
        setScore(response.data.score);
        setShowResults(true);
        
        // Store domain and completion status
        localStorage.setItem('hasCompletedPHQ', 'true');
        localStorage.setItem('assignedDomain', response.data.domain);
        localStorage.setItem('latestPHQAnswers', JSON.stringify(Object.values(newAnswers)));
        localStorage.setItem('phqScore', String(response.data.score));

        // Redirect to PHQ result page
        navigate('/phq-result');
      } catch (error) {
        console.error('Error submitting PHQ-9:', error);
      }
    }
  };

  // Removed depression level display from PHQ result

  if (showResults) {

    return (
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
        <div className="recommendations">
          <h3>Next Steps</h3>
          <p>Based on your assessment, you now have access to:</p>
          <ul>
            <li>AI Screening Session (Personalized to your domain: {domain})</li>
            <li>Follow-up Sessions</li>
            <li>Progress Tracking</li>
          </ul>
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
    );
  }

  return (
    <motion.div 
      className="phq-test-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="progress-bar">
        <div 
          className="progress"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <motion.div 
        className="question-container"
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <h2>Question {currentQuestion + 1} of {questions.length}</h2>
        <p className="question">{questions[currentQuestion]}</p>
        
        <div className="options">
          {[0, 1, 2, 3].map((value) => (
            <motion.button
              key={value}
              className={`option-button ${answers[currentQuestion] === value ? 'selected' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(value)}
            >
              {value === 0 && "Not at all"}
              {value === 1 && "Several days"}
              {value === 2 && "More than half the days"}
              {value === 3 && "Nearly every day"}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PHQTest;