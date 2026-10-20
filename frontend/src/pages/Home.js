import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Lock, Clock, ShieldCheck, Brain, Sprout, LineChart, Check, MessageCircle
} from 'lucide-react';
import { SplitText, Reveal, stagger, fadeUp, ease } from '../ui/motion';
import './Home.css';

const FEATURES = [
  { icon: Brain, title: 'Assessment that listens', text: 'Fine-tuned language models read what you write in your own words - not just which boxes you tick.' },
  { icon: Sprout, title: 'Plans built around your life', text: 'Recommendations shaped by what weighs on you most: work, studies, relationships or family.' },
  { icon: LineChart, title: 'Progress you can see', text: 'Every check-in is saved, so you can watch how you are doing over weeks and months.' }
];

const STEPS = [
  { title: 'Answer the PHQ-9', text: 'Nine clinically validated questions about the last two weeks.' },
  { title: 'Find your focus', text: 'Our classifier identifies the area of life affecting you most.' },
  { title: 'Talk it through', text: 'Answer five personal follow-up questions in your own words.' },
  { title: 'Get your plan', text: 'Receive an assessment, a care plan and expert contacts.' }
];

const STATS = [
  { value: '9', label: 'validated PHQ-9 questions' },
  { value: '~5 min', label: 'to complete a check-in' },
  { value: '3', label: 'fine-tuned AI models' },
  { value: '24/7', label: 'crisis helpline access' }
];

// Composed preview of the product: score, conversation and care plan cards
const ProductPreview = () => (
  <motion.div className="preview" variants={stagger(0.18, 0.5)} initial="hidden" animate="show" aria-hidden="true">
    <motion.div className="card preview-score" variants={fadeUp}>
      <div className="preview-row">
        <span className="preview-label">PHQ-9 score</span>
        <span className="badge level-chip moderate">Moderate</span>
      </div>
      <div className="preview-score-body">
        <svg width="92" height="92" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r="40" stroke="var(--bg-tint)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="46" cy="46" r="40" stroke="var(--accent)" strokeWidth="8" fill="none" strokeLinecap="round"
            strokeDasharray={251} initial={{ strokeDashoffset: 251 }} animate={{ strokeDashoffset: 251 * (1 - 12 / 27) }}
            transition={{ duration: 1.6, delay: 0.9, ease }} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
          <text x="46" y="53" textAnchor="middle" className="preview-score-num">12</text>
        </svg>
        <div>
          <p className="preview-strong">Focus area: Academic</p>
          <p className="faint small">Exam pressure is the main theme in your answers.</p>
        </div>
      </div>
    </motion.div>

    <motion.div className="card preview-chat" variants={fadeUp}>
      <div className="preview-row">
        <span className="preview-label"><MessageCircle size={14} /> Follow-up conversation</span>
      </div>
      <div className="bubble ai sm">How have your studies been affecting how you feel lately?</div>
      <div className="bubble user sm">I keep worrying about exams and can't switch off at night.</div>
    </motion.div>

    <motion.div className="card preview-plan" variants={fadeUp}>
      <span className="preview-label">Your care plan</span>
      {['Keep a consistent sleep routine', 'Break revision into 25-minute blocks', 'Talk to a counsellor this week'].map((t, i) => (
        <motion.div
          key={t}
          className="preview-task"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 + i * 0.15 }}
        >
          <span className={`preview-check ${i === 0 ? 'done' : ''}`}>{i === 0 && <Check size={12} strokeWidth={3} />}</span>
          {t}
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const start = () => navigate(localStorage.getItem('token') ? '/dashboard' : '/register');

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            AI-assisted mental health screening
          </motion.span>
          <h1 className="hero-title">
            <SplitText text="Understand how you're really feeling." italic={[3, 4]} delay={0.1} />
          </h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease }}
          >
            A private, five-minute check-in that combines the clinically validated PHQ-9 with a short conversation.
            You get a clear assessment and a personal plan for what to do next.
          </motion.p>
          <motion.div
            className="btn-row hero-cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
          >
            <button className="btn btn-primary" onClick={start}>
              Start your check-in <ArrowRight size={17} className="arrow" />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>I have an account</button>
          </motion.div>
          <motion.ul className="hero-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }}>
            <li><Lock size={15} /> Private and secure</li>
            <li><Clock size={15} /> About 5 minutes</li>
            <li><ShieldCheck size={15} /> Clinically validated</li>
          </motion.ul>
        </div>
        <ProductPreview />
      </section>

      <Reveal className="stats-strip">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </Reveal>

      <section className="page" style={{ paddingTop: '5rem' }}>
        <Reveal className="page-header">
          <span className="eyebrow">Why MindCare</span>
          <h2 className="home-h2">Care that pays <em className="serif-em">attention</em></h2>
        </Reveal>
        <motion.div className="grid grid-3" variants={stagger(0.12)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} variants={fadeUp} className="card card-pad feature">
              <div className="icon-tile lg"><Icon size={24} strokeWidth={1.8} /></div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="section steps-section">
          <Reveal className="page-header">
            <span className="eyebrow">How it works</span>
            <h2 className="home-h2">Four steps, at your own pace</h2>
          </Reveal>
          <motion.ol className="steps" variants={stagger(0.12)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            {STEPS.map((s, i) => (
              <motion.li key={s.title} variants={fadeUp} className="step">
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <motion.span
                  className="step-line"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease }}
                />
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>

        <Reveal className="section">
          <div className="cta-band">
            <div>
              <h2>Ready when you are.</h2>
              <p>It takes about five minutes, and you can stop at any time.</p>
            </div>
            <button className="btn cta-btn" onClick={start}>
              Begin your check-in <ArrowRight size={17} className="arrow" />
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
