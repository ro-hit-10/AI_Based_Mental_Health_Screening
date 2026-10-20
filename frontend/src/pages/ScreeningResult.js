import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, FileText, Stethoscope } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing';
import CrisisCard from '../ui/CrisisCard';
import Loader from '../ui/Loader';
import { getLevel, LEVEL_ORDER } from '../ui/levels';
import { Reveal, stagger, fadeUp, ease } from '../ui/motion';

const ScreeningResult = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('screeningAnalysis');
    if (!raw) {
      navigate('/ai-screening');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.error) {
        setError(`API Error: ${parsed.error}`);
        return;
      }
      setAnalysisData({
        depression_level: parsed?.depression_level || 'No Depression',
        confidence: parsed?.confidence || 0,
        key_indicators: parsed?.key_indicators || [],
        domain: parsed?.domain || localStorage.getItem('assignedDomain') || '',
        phq9_score: parsed?.phq9_score || 0
      });
    } catch (e) {
      console.error('Error parsing screening analysis:', e);
      setError('Error loading analysis data');
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="page page-narrow">
        <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>
        <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => navigate('/ai-screening')}>Try again</button>
      </div>
    );
  }

  if (!analysisData) return <Loader message="Loading your results…" />;

  const level = getLevel(analysisData.depression_level);
  const levelIndex = LEVEL_ORDER.findIndex((s) => getLevel(s) === level);
  const phqAnswers = JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]');
  const showCrisis = levelIndex === 3 || (phqAnswers[8] || 0) >= 1;

  return (
    <div className="page">
      <motion.section className="card level-hero" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <div className="level-hero-main">
          <span className="eyebrow">Your AI screening result</span>
          <motion.h1
            className="level-name"
            style={{ color: level.color }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            {level.title}
          </motion.h1>
          <p className="level-message">{level.message}</p>

          <div className="level-scale" aria-label={`Level ${levelIndex + 1} of 4`}>
            {LEVEL_ORDER.map((s, i) => {
              const l = getLevel(s);
              return (
                <div key={s} className="level-seg">
                  <div className="level-bar">
                    <motion.span
                      style={{ background: l.hex }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: i <= levelIndex ? 1 : 0 }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.45, ease }}
                    />
                  </div>
                  <span className={i === levelIndex ? 'current' : ''}>{l.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="level-hero-side">
          <div>
            <ScoreRing value={Math.round(analysisData.confidence * 100)} max={100} size={132} suffix="%" label="confidence" />
          </div>
          <div>
            <ScoreRing value={analysisData.phq9_score} max={27} size={132} color={level.hex} label="PHQ-9 / 27" />
          </div>
          <div className="level-domain">
            <span className="stat-label">Focus area</span>
            <span className="domain-name">{analysisData.domain || 'General'}</span>
          </div>
        </div>
      </motion.section>

      {showCrisis && (
        <div style={{ marginTop: '1.25rem' }}>
          <CrisisCard />
        </div>
      )}

      {analysisData.key_indicators.length > 0 && (
        <Reveal className="card card-pad section">
          <h2 className="section-title">What we noticed in your answers</h2>
          <motion.ol className="indicator-list" variants={stagger(0.12)} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {analysisData.key_indicators.map((indicator, index) => (
              <motion.li key={index} variants={fadeUp}>
                <span className="indicator-num">{String(index + 1).padStart(2, '0')}</span>
                <span>{indicator}</span>
              </motion.li>
            ))}
          </motion.ol>
        </Reveal>
      )}

      <Reveal className="btn-row section">
        <button className="btn btn-primary" onClick={() => navigate('/suggestions')}>
          See your care plan <ArrowRight size={17} className="arrow" />
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/prescription-download')}><FileText size={17} /> Full report</button>
        <button className="btn btn-ghost" onClick={() => navigate('/professionals')}><Stethoscope size={17} /> Talk to an expert</button>
      </Reveal>

      <p className="faint small" style={{ marginTop: '2rem' }}>
        This is an AI-assisted screening, not a medical diagnosis.
      </p>
    </div>
  );
};

export default ScreeningResult;
