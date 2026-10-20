import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

// 4-4-6 guided breathing: the circle expands, holds and contracts with the phases
const PHASES = [
  { label: 'Breathe in', seconds: 4, scale: 1 },
  { label: 'Hold', seconds: 4, scale: 1 },
  { label: 'Breathe out', seconds: 6, scale: 0.55 }
];

const BreathingWidget = () => {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = setTimeout(() => {
      setPhase((p) => {
        const nextPhase = (p + 1) % PHASES.length;
        if (nextPhase === 0) setCycles((c) => c + 1);
        return nextPhase;
      });
    }, PHASES[phase].seconds * 1000);
    return () => clearTimeout(id);
  }, [running, phase]);

  const toggle = () => {
    setRunning((r) => !r);
    setPhase(0);
  };

  const current = PHASES[phase];

  return (
    <div className="card card-pad breath-widget">
      <div className="breath-head">
        <div>
          <h3>A mindful minute</h3>
          <p className="muted small">In for 4, hold for 4, out for 6.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={toggle}>
          {running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start</>}
        </button>
      </div>
      <div className="breath-stage">
        <motion.div
          className="breath-circle"
          animate={running ? { scale: current.scale } : { scale: 0.62 }}
          transition={{ duration: running ? current.seconds : 0.6, ease: 'easeInOut' }}
        />
        <div className="breath-guide" />
        <AnimatePresence mode="wait">
          <motion.span
            key={running ? current.label : 'idle'}
            className="breath-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {running ? current.label : 'Ready'}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="faint small center">
        {cycles > 0 ? `${cycles} ${cycles === 1 ? 'breath' : 'breaths'} completed` : 'Press start and follow the circle'}
      </p>
    </div>
  );
};

export default BreathingWidget;
