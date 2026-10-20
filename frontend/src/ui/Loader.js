import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Calm pulse loader; optional rotating messages keep long AI waits feeling alive
const Loader = ({ message = 'Loading…', messages }) => {
  const [index, setIndex] = React.useState(0);
  const lines = messages && messages.length ? messages : [message];

  React.useEffect(() => {
    if (lines.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % lines.length), 2600);
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <div className="loader-screen" role="status" aria-live="polite">
      <div className="pulse-ring">
        <span />
        <span />
      </div>
      <div style={{ height: '1.8em', minWidth: 280 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="loader-text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {lines[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Loader;
