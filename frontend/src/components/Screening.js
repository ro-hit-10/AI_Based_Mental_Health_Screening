import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Screening = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed PHQ-9
    const hasCompletedPHQ = localStorage.getItem('hasCompletedPHQ');
    if (!hasCompletedPHQ) {
      navigate('/phq-test');
      return;
    }

    // Get screening questions
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/screening/start', {
          domain: localStorage.getItem('assignedDomain'),
          latestPHQAnswers: JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]')
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const q = Array.isArray(response.data.questions) ? response.data.questions.slice(0, 5) : [];
        setQuestions(q);
        setCurrentInput('');
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [navigate]);

  const submitCurrentAnswer = async () => {
    if (!currentInput.trim()) return;
    const updated = { ...answers, [currentQuestion]: currentInput.trim() };
    setAnswers(updated);
    setCurrentInput('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/screening/save', {
        domain: localStorage.getItem('assignedDomain'),
        latestPHQAnswers: JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]'),
        questions: questions,
        answers: Object.values(updated)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAnalysis(response.data.analysis);
      setShowResults(true);
      localStorage.setItem('screeningAnalysis', JSON.stringify(response.data.analysis));
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  if (showResults && analysis) {
    navigate('/screening-result');
    return null;
  }

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <motion.div 
      className="screening-container"
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
        
        <div className="answer-input">
          <textarea
            placeholder="Type your answer here..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            rows={5}
          />
          <motion.button
            className="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submitCurrentAnswer}
          >
            {currentQuestion < questions.length - 1 ? 'Next' : 'Submit'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Screening;