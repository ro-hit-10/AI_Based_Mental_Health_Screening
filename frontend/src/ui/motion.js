import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

export const ease = [0.22, 1, 0.36, 1];

export const stagger = (staggerChildren = 0.07, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } }
});

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } }
};

// Fades/slides children in when they scroll into view
export const Reveal = ({ children, delay = 0, y = 18, className, style, as = 'div' }) => {
  const Component = motion[as];
  return (
    <Component
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </Component>
  );
};

// Word-by-word rise for display headlines. Words listed in `italic` are set in the accent italic.
export const SplitText = ({ text, delay = 0, italic = [] }) => {
  const words = text.split(' ');
  return (
    <motion.span initial="hidden" animate="show" variants={stagger(0.05, delay)} aria-label={text} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.8, ease } } }}
          >
            {italic.includes(i) ? <em className="serif-em">{word}</em> : word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

// Number that counts up when it scrolls into view
export const CountUp = ({ to, duration = 1.4, decimals = 0, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, Number(to) || 0, {
      duration,
      ease,
      onUpdate: (v) => setValue(v)
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Pill-style filter chips with a sliding selection background
export const FilterChips = ({ options, value, onChange, layoutId }) => (
  <div className="chip-row" role="tablist">
    {options.map((opt) => {
      const active = opt.id === value;
      return (
        <button
          key={opt.id}
          role="tab"
          aria-selected={active}
          className={`chip ${active ? 'active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {active && (
            <motion.span layoutId={layoutId} className="chip-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
          )}
          {opt.name}
        </button>
      );
    })}
  </div>
);
