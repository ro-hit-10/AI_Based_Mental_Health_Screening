import React from 'react';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <span>© {new Date().getFullYear()} MindCare AI · A screening tool, not a medical diagnosis.</span>
      <span>
        In crisis? Call <a href="tel:14416"><b>Tele-MANAS 14416</b></a> or <a href="tel:112"><b>112</b></a>
      </span>
    </div>
  </footer>
);

export default Footer;
