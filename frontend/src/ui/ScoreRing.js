import React from 'react';
import { motion } from 'framer-motion';
import { CountUp, ease } from './motion';

// Animated circular gauge, e.g. PHQ-9 score out of 27 or confidence out of 100
const ScoreRing = ({ value, max, size = 168, stroke = 10, color = 'var(--accent)', label, suffix = '' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, (Number(value) || 0) / max));

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--bg-tint)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.6, ease, delay: 0.15 }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.3, lineHeight: 1, color: 'var(--ink)' }}>
            <CountUp to={value} suffix={suffix} />
          </div>
          {label && <div className="faint" style={{ fontSize: '0.78rem', marginTop: 6, fontWeight: 500 }}>{label}</div>}
        </div>
      </div>
    </div>
  );
};

export default ScoreRing;
