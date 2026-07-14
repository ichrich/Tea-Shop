import React from 'react';
import TeaLeafCanvas from '../../Tea/TeaLeafCanvas/TeaLeafCanvas.jsx';

const AhnfeltiaCanvas = ({ scrollProgress = 0, className = '' }) => (
  <div className={`AhnfeltiaScroll_canvas ${className}`.trim()}>
    <TeaLeafCanvas variant="story" progress={scrollProgress} accent={scrollProgress} />
  </div>
);

export default AhnfeltiaCanvas;
