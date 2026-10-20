import React from 'react';
import { motion } from 'framer-motion';
import { ease } from './motion';

// Page title block: eyebrow, serif headline (optional italic accent words) and subtitle
const PageHeader = ({ eyebrow, title, italic = [], subtitle, centered = false, children }) => {
  const words = title.split(' ');
  return (
    <motion.header
      className={`page-header ${centered ? 'centered' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>
        {words.map((w, i) => (
          <React.Fragment key={i}>
            {italic.includes(i) ? <em className="serif-em">{w}</em> : w}
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </motion.header>
  );
};

export default PageHeader;
