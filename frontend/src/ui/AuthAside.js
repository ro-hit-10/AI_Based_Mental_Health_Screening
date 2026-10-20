import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, HeartPulse } from 'lucide-react';
import { stagger, fadeUp } from './motion';

// Right-hand reassurance panel shown beside the sign-in and sign-up forms
const AuthAside = () => (
  <motion.aside className="auth-aside" variants={stagger(0.12, 0.2)} initial="hidden" animate="show">
    <motion.p className="auth-quote" variants={fadeUp}>
      “Asking how you feel is the <em>first act</em> of care.”
    </motion.p>
    <ul className="auth-points">
      {[
        [Lock, 'Your answers are private and stored securely.'],
        [ShieldCheck, 'Built on the clinically validated PHQ-9 questionnaire.'],
        [HeartPulse, 'Crisis support is always one tap away.']
      ].map(([Icon, text]) => (
        <motion.li key={text} variants={fadeUp}>
          <Icon size={18} />
          <span>{text}</span>
        </motion.li>
      ))}
    </ul>
  </motion.aside>
);

export default AuthAside;
