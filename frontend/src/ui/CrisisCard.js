import React from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Phone, Siren } from 'lucide-react';

// Shown whenever answers indicate thoughts of self-harm or a severe result
const CrisisCard = () => (
  <motion.div
    className="card card-pad crisis-card"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    role="note"
  >
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className="icon-tile" style={{ background: 'var(--level-severe-bg)', color: 'var(--level-severe)' }}>
        <HeartHandshake size={22} />
      </div>
      <div>
        <h3 style={{ marginBottom: '0.35rem' }}>You don't have to go through this alone</h3>
        <p className="muted">
          If you are having thoughts of hurting yourself, please talk to someone right now. Free, confidential
          support is available 24/7.
        </p>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <a className="btn btn-danger btn-sm" href="tel:14416"><Phone size={16} /> Tele-MANAS 14416</a>
          <a className="btn btn-ghost btn-sm" href="tel:112"><Siren size={16} /> Emergency 112</a>
        </div>
      </div>
    </div>
  </motion.div>
);

export default CrisisCard;
