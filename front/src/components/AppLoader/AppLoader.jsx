import React from 'react';
import './AppLoader.css';

export function AppLoader({ visible }) {
  if (!visible) return null;

  return (
    <div className="AppLoader" role="status" aria-live="polite" aria-label="Загрузка">
      <div className="AppLoader_inner">
        <div className="AppLoader_title">Чайный дом</div>
        <div className="AppLoader_subtitle">Подготавливаем витрину чая</div>
        <div className="AppLoader_bar" aria-hidden="true">
          <div className="AppLoader_barFill" />
        </div>
      </div>
    </div>
  );
}

