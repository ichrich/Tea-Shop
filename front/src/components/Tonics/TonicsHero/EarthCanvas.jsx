import React from 'react';
import TeaLeafCanvas from '../../Tea/TeaLeafCanvas/TeaLeafCanvas.jsx';

const EarthCanvas = ({ scrollProgress = 0, className = '' }) => (
  <div className={`TonicsHero_canvas ${className}`.trim()}>
    <TeaLeafCanvas variant="hero" progress={scrollProgress} accent={scrollProgress} />
    <div className="TonicsHero_canvas_overlay" />
  </div>
);

export default EarthCanvas;
