import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../ui/Loader';
import { answerColor } from '../ui/levels';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that other people could have noticed — or being so restless that you move around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself'
];

const OPTIONS = [
  { value: 0, label: 'Not at all', hint: '0 days' },
  { value: 1, label: 'Several days', hint: '1–6 days' },
  { value: 2, label: 'More than half the days', hint: '7–11 days' },
  { value: 3, label: 'Nearly every day', hint: '12–14 days' }
];

const PHQTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  const submit = useCallback(async (finalAnswers) => {
    setSubmitting(true);
    setError('');
    try {
      const values = QUESTIONS.map((_, i) => finalAnswers[i]);
      const { data } = await api.post('/api/phq/submit', { answers: values });
      localStorage.setItem('hasCompletedPHQ', 'true');
      localStorage.setItem('assignedDomain', data.domain || 'General');
      localStorage.setItem('latestPHQAnswers', JSON.stringify(values));
      localStorage.setItem('phqScore', String(data.score));
      localStorage.removeItem('screeningAnalysis');
      navigate('/phq-result');
    } catch (err) {
      console.error('Error submitting PHQ-9:', err);
      setError('We could not save your answers. Please check your connection and try again.');
      setSubmitting(false);
    }
  }, [navigate]);

  const handleAnswer = useCallback((value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    setDirection(1);
    if (currentQuestion < QUESTIONS.length - 1) {
      // brief pause so the selection animation is visible
      setTimeout(() => setCurrentQuestion((q) => q + 1), 280);
    } else {
      submit(newAnswers);
    }
  }, [answers, currentQuestion, submit]);

  const goBack = useCallback(() => {
    if (currentQuestion === 0) return;
    setDirection(-1);
    setCurrentQuestion((q) => q - 1);
  }, [currentQuestion]);

  // Keyboard shortcuts: 1-4 to answer, Backspace / left arrow to go back
  useEffect(() => {
    const onKey = (e) => {
      if (submitting) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) handleAnswer(n - 1);
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAnswer, goBack, submitting]);

  if (submitting) {
    return <Loader messages={['Saving your answers…', 'Understanding your focus area…', 'Almost there…']} />;
  }

  if (error) {
    return (
      <div className="page page-narrow">
        <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>
        <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => submit(answers)}>Try again</button>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  return (
    <div className="page page-narrow quiz">
      <div className="quiz-top">
        <span className="eyebrow">PHQ-9 check-in</span>
        <span className="faint">Question {currentQuestion + 1} / {QUESTIONS.length}</span>
      </div>
      <div className="progress-track">
        <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div style={{ height: '3rem' }} />

      <p className="quiz-intro muted">Over the last 2 weeks, how often have you been bothered by…</p>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestion}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="quiz-question">{QUESTIONS[currentQuestion]}</h2>

          <div className="option-list">
            {OPTIONS.map((opt, i) => {
              const selected = answers[currentQuestion] === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  className={`option-card ${selected ? 'selected' : ''}`}
                  style={{ '--opt': answerColor(opt.value) }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswer(opt.value)}
                >
                  <span className="kbd">{i + 1}</span>
                  <span className="option-label">{opt.label}</span>
                  <span className="option-hint faint">{opt.hint}</span>
                  <span className="option-radio" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="quiz-foot">
        <button className="btn btn-ghost btn-sm" onClick={goBack} disabled={currentQuestion === 0}><ArrowLeft size={16} /> Previous</button>
        <span className="faint" style={{ fontSize: '0.82rem' }}>Tip: press <span className="kbd">1</span>–<span className="kbd">4</span> to answer</span>
      </div>
    </div>
  );
};

export default PHQTest;
