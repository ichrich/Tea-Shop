import React from 'react';
import TeaLeafCanvas from '../../Tea/TeaLeafCanvas/TeaLeafCanvas.jsx';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const AhnfeltiaSharedCanvas = ({ progress = 0, colorMix = 0, className = '' }) => (
  <div className={`AhnfeltiaSharedCanvas ${className}`.trim()}>
    <TeaLeafCanvas
      variant="shared"
      progress={clamp(progress, 0, 1)}
      accent={clamp(colorMix, 0, 1)}
    />
  </div>
);

export default AhnfeltiaSharedCanvas;
