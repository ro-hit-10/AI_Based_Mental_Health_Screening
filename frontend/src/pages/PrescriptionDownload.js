import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../ui/Loader';
import { ArrowRight, Download, FileText, Stethoscope } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import ScoreRing from '../ui/ScoreRing';
import { Reveal, stagger, fadeUp } from '../ui/motion';
import { getLevel, answerColor } from '../ui/levels';


const PrescriptionDownload = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPatientData = async () => {
      if (!localStorage.getItem('token')) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await api.get('/api/reports/patient-data');
        setPatientData(data);
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError(err.response?.data?.error || 'Could not load your report.');
      } finally {
        setLoading(false);
      }
    };
    loadPatientData();
  }, [navigate]);

  const generateTextReport = () => `
MENTAL HEALTH ASSESSMENT REPORT
=====================================

PATIENT INFORMATION
-------------------
Name: ${patientData.patientInfo.name}
Age: ${patientData.patientInfo.age}
Gender: ${patientData.patientInfo.gender}
Date: ${patientData.patientInfo.date}
Patient ID: ${patientData.patientInfo.patientId}

AI ASSESSMENT
-------------
Depression Level: ${patientData.assessmentDetails.depression_level}
Confidence: ${Math.round((patientData.assessmentDetails.confidence || 0) * 100)}%
Key Indicators:
${(patientData.assessmentDetails.key_indicators || []).map((k) => `• ${k}`).join('\n')}

PHQ-9 DEPRESSION SCREENING RESULTS
----------------------------------
Total Score: ${patientData.phqScore.total}/27
Severity: ${patientData.phqScore.level}

${patientData.phqScore.questions.map((q, i) => `${i + 1}. ${q.question_text}\n   Answer: ${q.response_text} (Score: ${q.response_value})`).join('\n')}

DOMAIN ANALYSIS
---------------
Primary Domain: ${patientData.domainAnalysis.primaryDomain}

AI ASSESSMENT QUESTIONS & RESPONSES
-----------------------------------
${patientData.aiQuestions.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\n`).join('\n')}

AI GENERATED RECOMMENDATIONS
----------------------------
${patientData.aiSuggestions.map((category) => `
${category.category.toUpperCase()}:
${category.suggestions.map((s) => `• ${s}`).join('\n')}
`).join('\n')}

RISK ASSESSMENT
---------------
Risk Level: ${patientData.riskAssessment.level}
Follow-up Recommended: ${patientData.riskAssessment.followUpRecommended}

Crisis support (India): Tele-MANAS 14416 · Emergency 112

DISCLAIMER
----------
This assessment is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.

Generated on: ${new Date().toLocaleString()}
`;

  const downloadText = () => {
    const blob = new Blob([generateTextReport()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mental_Health_Assessment_${patientData.patientInfo.patientId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loader messages={['Compiling your report…', 'Gathering your assessment…']} />;

  if (!patientData) {
    return (
      <div className="page page-narrow">
        <PageHeader eyebrow="Care report" title="No report yet" subtitle={error || 'Complete a mental health assessment first to generate your report.'} />
        <button className="btn btn-primary" onClick={() => navigate('/phq-test')}>
          Take the PHQ-9 check-in <ArrowRight size={17} className="arrow" />
        </button>
      </div>
    );
  }

  const level = getLevel(patientData.assessmentDetails.depression_level);
  const info = patientData.patientInfo;

  return (
    <div className="page report">
      <div className="report-top">
        <PageHeader
          eyebrow="Care report"
          title="Your assessment report"
          italic={[2]}
          subtitle="Everything from your latest screening in one place, ready to save or share with a doctor."
        />
        <motion.div className="btn-row no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button className="btn btn-primary" onClick={() => window.print()}><Download size={17} /> Save as PDF</button>
          <button className="btn btn-ghost" onClick={downloadText}><FileText size={17} /> Text file</button>
        </motion.div>
      </div>

      <motion.section className="card report-summary" variants={stagger(0.08, 0.1)} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="report-cell">
          <span className="stat-label">Patient</span>
          <dl className="summary-list">
            <div><dt>Name</dt><dd>{info.name}</dd></div>
            <div><dt>Age</dt><dd>{info.age}</dd></div>
            <div><dt>Gender</dt><dd>{info.gender}</dd></div>
            <div><dt>Date</dt><dd>{info.date}</dd></div>
            <div><dt>Patient ID</dt><dd>{info.patientId}</dd></div>
          </dl>
        </motion.div>
        <motion.div variants={fadeUp} className="report-cell center">
          <span className="stat-label">PHQ-9 score</span>
          <div style={{ margin: '1rem 0 0.5rem' }}>
            <ScoreRing value={patientData.phqScore.total} max={27} size={140} label="out of 27" color={level.hex} />
          </div>
          <p className="muted small">{patientData.phqScore.level}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="report-cell">
          <span className="stat-label">AI assessment</span>
          <p className="level-name sm" style={{ color: level.color }}>{level.title}</p>
          <dl className="summary-list">
            <div><dt>Confidence</dt><dd>{Math.round((patientData.assessmentDetails.confidence || 0) * 100)}%</dd></div>
            <div><dt>Focus area</dt><dd>{patientData.domainAnalysis.primaryDomain}</dd></div>
            <div><dt>Follow-up</dt><dd>{patientData.riskAssessment.followUpRecommended}</dd></div>
          </dl>
        </motion.div>
      </motion.section>

      {patientData.assessmentDetails.key_indicators?.length > 0 && (
        <Reveal className="report-section">
          <h2 className="section-title">Key indicators</h2>
          <ol className="indicator-list card card-pad">
            {patientData.assessmentDetails.key_indicators.map((k, i) => (
              <li key={i}><span className="indicator-num">{String(i + 1).padStart(2, '0')}</span><span>{k}</span></li>
            ))}
          </ol>
        </Reveal>
      )}

      <div className="grid grid-2 report-section">
        <Reveal>
          <h2 className="section-title">PHQ-9 responses</h2>
          <div className="card">
            {patientData.phqScore.questions.map((q, i) => (
              <div key={i} className="phq-row">
                <div>
                  <p className="phq-q">{i + 1}. {q.question_text}</p>
                  <p className="faint small">{q.response_text}</p>
                </div>
                <span className="phq-val" style={{ color: answerColor(q.response_value), borderColor: answerColor(q.response_value) }}>{q.response_value}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="section-title">Your conversation</h2>
          <div className="card">
            {patientData.aiQuestions.map((qa, i) => (
              <div key={i} className="qa">
                <p className="q">{qa.question}</p>
                <p className="a">“{qa.answer}”</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {patientData.aiSuggestions.length > 0 && (
        <Reveal className="report-section">
          <h2 className="section-title">Recommendations</h2>
          <div className="grid grid-2">
            {patientData.aiSuggestions.map((category) => (
              <div key={category.category} className="card card-pad">
                <h3 style={{ marginBottom: '0.75rem' }}>{category.category}</h3>
                <ul className="rec-list">
                  {category.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal className="card card-pad crisis-card report-section">
        <h3 style={{ marginBottom: '0.4rem' }}>Crisis support (India)</h3>
        <p className="muted">
          Tele-MANAS mental health helpline: <a href="tel:14416"><b>14416</b></a> (24/7, free) · Emergency services: <a href="tel:112"><b>112</b></a>
        </p>
      </Reveal>

      <div className="btn-row no-print" style={{ marginTop: '2rem' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/professionals')}><Stethoscope size={17} /> Find professional help</button>
      </div>

      <p className="faint small" style={{ marginTop: '2rem', maxWidth: 720 }}>
        This assessment is for informational purposes only and does not replace professional medical advice,
        diagnosis or treatment.
      </p>
    </div>
  );
};

export default PrescriptionDownload;
