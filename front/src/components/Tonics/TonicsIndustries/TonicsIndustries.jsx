import React, { useEffect, useState } from 'react';
import './TonicsIndustries.css';

const TonicsIndustries = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const text =
    'Этот раздел теперь описывает чайную коллекцию: базовые сорта, подарочные линейки, сезонные новинки и ассортимент для розницы или опта.';

  return (
    <section className="TonicsIndustries_section">
      {!isMobile && (
        <>
          <h2 className="TonicsIndustries_title TonicsIndustries_title--left">Чайная</h2>
          <div className="TonicsIndustries_info container">
            <p className="TonicsIndustries_text">{text}</p>
          </div>
          <h2 className="TonicsIndustries_title TonicsIndustries_title--right">коллекция</h2>
        </>
      )}

      {isMobile && (
        <div className="TonicsIndustries_mobile_wrap">
          <h2 className="TonicsIndustries_title">Чайная</h2>
          <div className="TonicsIndustries_info">
            <p className="TonicsIndustries_text">{text}</p>
          </div>
          <h2 className="TonicsIndustries_title">коллекция</h2>
        </div>
      )}
    </section>
  );
};

export default TonicsIndustries;
