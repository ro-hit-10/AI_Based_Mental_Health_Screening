import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing';
import CrisisCard from '../ui/CrisisCard';
import { stagger, fadeUp } from '../ui/motion';
import { getLevel } from '../ui/levels';

const severityFor = (score) => {
  if (score <= 4) return { label: 'Minimal symptoms', level: 'No Depression', text: 'Few or no symptoms right now.' };
  if (score <= 9) return { label: 'Mild symptoms', level: 'Mild', text: 'Some symptoms worth keeping an eye on.' };
  if (score <= 14) return { label: 'Moderate symptoms', level: 'Moderate', text: 'Symptoms that are likely affecting daily life.' };
  if (score <= 19) return { label: 'Moderately severe symptoms', level: 'Severe', text: 'Significant symptoms. Support is recommended.' };
  return { label: 'Severe symptoms', level: 'Severe', text: 'Strong symptoms. Please consider professional help soon.' };
};

const PHQResult = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [domain, setDomain] = useState('');
  const [selfHarm, setSelfHarm] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('phqScore');
    const d = localStorage.getItem('assignedDomain');
    if (!s || !d) {
      navigate('/phq-test');
      return;
    }
    setScore(Number(s));
    setDomain(d);
    const answers = JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]');
    setSelfHarm((answers[8] || 0) >= 1);
  }, [navigate]);

  if (score === null) return null;
  const sev = severityFor(score);
  const level = getLevel(sev.level);

  return (
    <div className="page page-narrow">
      <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
        <motion.span variants={fadeUp} className="eyebrow">Step 1 of 2 complete</motion.span>
        <motion.h1 variants={fadeUp} className="result-title">Your PHQ-9 results</motion.h1>

        <motion.div variants={fadeUp} className="card card-pad result-hero">
          <ScoreRing value={score} max={27} size={176} color={level.hex} label="out of 27" />
          <div className="result-hero-copy">
            <span className="level-tag" style={{ color: level.color, background: level.bg }}>{sev.label}</span>
            <p className="muted" style={{ marginTop: '0.75rem' }}>{sev.text}</p>
            <div className="divider" style={{ margin: '1.25rem 0' }} />
            <p className="stat-label">Focus area identified by our AI</p>
            <p className="domain-name">{domain}</p>
          </div>
        </motion.div>

        {selfHarm && (
          <motion.div variants={fadeUp} style={{ marginTop: '1.25rem' }}>
            <CrisisCard />
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="card card-pad next-card">
          <div className="icon-tile"><MessageCircle size={20} /></div>
          <div>
            <h3>Next: a short conversation</h3>
            <p className="muted">
              We'll ask five personal questions about your {domain.toLowerCase()} life. Answer in your own words -
              our AI reads your answers to understand how you are really doing.
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="btn-row" style={{ marginTop: '1.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/screening')}>
            Start the AI screening <ArrowRight size={17} className="arrow" />
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Do this later</button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PHQResult;
