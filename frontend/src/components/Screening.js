import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowUp, Leaf } from 'lucide-react';
import api from '../utils/api';
import Loader from '../ui/Loader';

const StatusScreen = ({ error, onRetry }) => (
  <div className="page page-narrow">
    <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>
    <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={onRetry}>Try again</button>
  </div>
);

const TypingDots = () => (
  <div className="bubble ai typing" aria-label="MindCare is typing">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        animate={{ opacity: [0.25, 1, 0.25] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
      />
    ))}
  </div>
);

const Screening = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [typing, setTyping] = useState(true);
  const hasFetched = useRef(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const fetchQuestions = useCallback(async () => {
    setLoadError('');
    try {
      const response = await api.post('/api/screening/start', {
        domain: localStorage.getItem('assignedDomain'),
        latestPHQAnswers: JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]')
      });
      const q = Array.isArray(response.data.questions) ? response.data.questions.slice(0, 5) : [];
      if (q.length === 0) {
        setLoadError('We could not prepare your questions. Please try again.');
        return;
      }
      setQuestions(q);
      setCurrentInput('');
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoadError('Could not reach the screening service. Make sure the backend and AI engine are running, then try again.');
    }
  }, []);

  useEffect(() => {
    // Check if user has completed PHQ-9
    const hasCompletedPHQ = localStorage.getItem('hasCompletedPHQ');
    if (!hasCompletedPHQ) {
      navigate('/phq-test');
      return;
    }

    // Guard against React StrictMode running this effect twice in development
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchQuestions();
  }, [navigate, fetchQuestions]);

  // Show a short "typing" indicator before each new question
  useEffect(() => {
    if (!questions.length) return undefined;
    setTyping(true);
    const id = setTimeout(() => {
      setTyping(false);
      inputRef.current?.focus();
    }, 850);
    return () => clearTimeout(id);
  }, [currentQuestion, questions.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentQuestion, typing, answers]);

  const saveScreening = async (finalAnswers) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await api.post('/api/screening/save', {
        domain: localStorage.getItem('assignedDomain'),
        latestPHQAnswers: JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]'),
        questions: questions,
        answers: Object.values(finalAnswers)
      });

      localStorage.setItem('screeningAnalysis', JSON.stringify(response.data.analysis));
      navigate('/screening-result');
    } catch (error) {
      console.error('Error submitting answers:', error);
      setSubmitError('We could not analyze your answers. Please try again.');
      setSubmitting(false);
    }
  };

  const submitCurrentAnswer = async () => {
    if (!currentInput.trim() || submitting || typing) return;
    const updated = { ...answers, [currentQuestion]: currentInput.trim() };
    setAnswers(updated);
    setCurrentInput('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    await saveScreening(updated);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitCurrentAnswer();
    }
  };

  if (submitError) {
    return <StatusScreen error={submitError} onRetry={() => saveScreening(answers)} />;
  }

  if (submitting) {
    return <Loader messages={['Reading your answers carefully…', 'Understanding how you feel…', 'Preparing your care plan…']} />;
  }

  if (loadError) {
    return <StatusScreen error={loadError} onRetry={fetchQuestions} />;
  }

  if (questions.length === 0) {
    return <Loader messages={['Preparing your personalised questions…', 'Tailoring them to your focus area…']} />;
  }

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLast = currentQuestion === questions.length - 1;

  return (
    <div className="page page-narrow chat-page">
      <div className="chat-header">
        <div className="chat-avatar"><Leaf size={18} /></div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem' }}>MindCare</h3>
          <span className="faint small">{typing ? 'typing…' : `Question ${currentQuestion + 1} of ${questions.length}`}</span>
        </div>
        <span className="badge">Focus: {localStorage.getItem('assignedDomain')}</span>
      </div>
      <div className="progress-track" style={{ margin: '0 0 1.75rem' }}>
        <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      <div className="chat-thread">
        <motion.div className="bubble ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          Thank you for being here. I'll ask you a few questions - there are no right or wrong answers.
          Just share what feels true for you.
        </motion.div>

        {questions.slice(0, currentQuestion + 1).map((q, i) => {
          const isCurrent = i === currentQuestion;
          if (isCurrent && typing) return <TypingDots key={`typing-${i}`} />;
          return (
            <React.Fragment key={i}>
              <motion.div className="bubble ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                {q}
              </motion.div>
              {answers[i] && (
                <motion.div className="bubble user" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  {answers[i]}
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <textarea
          ref={inputRef}
          className="composer-input"
          placeholder={typing ? 'MindCare is typing…' : 'Write your answer. Press Enter to send, Shift + Enter for a new line.'}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          disabled={typing}
          aria-label="Your answer"
        />
        <button
          className={`btn ${isLast ? 'btn-accent' : 'btn-primary'} composer-send`}
          onClick={submitCurrentAnswer}
          disabled={!currentInput.trim() || typing}
          aria-label={isLast ? 'Finish and see results' : 'Send answer'}
        >
          {isLast ? 'Finish' : <ArrowUp size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Screening;
