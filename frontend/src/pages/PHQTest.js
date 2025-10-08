import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './PHQTest.css';

const PHQTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

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

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0);
  };

  const getDepressionLevel = (score) => {
    if (score <= 4) return "Minimal depression";
    if (score <= 9) return "Mild depression";
    if (score <= 14) return "Moderate depression";
    if (score <= 19) return "Moderately severe depression";
    return "Severe depression";
  };

  if (showResults) {
    const score = calculateScore();
    const level = getDepressionLevel(score);

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
          <p>Depression Level: {level}</p>
        </div>
        <div className="recommendations">
          <h3>Recommendations</h3>
          <p>Based on your score, we recommend:</p>
          <ul>
            {score <= 4 && (
              <li>Continue monitoring your mood and practicing self-care</li>
            )}
            {score > 4 && score <= 9 && (
              <li>Consider talking to a mental health professional</li>
            )}
            {score > 9 && (
              <li>Schedule an appointment with a mental health professional</li>
            )}
          </ul>
        </div>
        <motion.button
          className="restart-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setCurrentQuestion(0);
            setAnswers({});
            setShowResults(false);
          }}
        >
          Take Test Again
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