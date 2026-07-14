import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import './CategoryPieChart.css';

const CategoryPieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await apiRequest('/api/dataPercent');
        const json = await res.json();
        const items = json?.items ?? json;
        const arr = Array.isArray(items) ? items : [];

        const topTwo = arr
          .slice()
          .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
          .slice(0, 2);

        if (mounted) {
          setData(topTwo);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);
  const circumference = 2 * Math.PI * 100;
  const main = data[0];
  const add = data[1];

  const mainPercentage = main?.percentage ?? 0;
  const addPercentage = add?.percentage ?? 0;

  const mainStrokeDasharray = `${(mainPercentage / 100) * circumference} ${circumference}`;
  const addStrokeDasharray = `${(addPercentage / 100) * circumference} ${circumference}`;
  const addStrokeDashoffset = -((mainPercentage / 100) * circumference);

  const itemsForLegend = data;

  return (
    <div className="CategoryPieChart">
      <div className="CategoryPieChart_header">
        <h3 className="CategoryPieChart_title">Продажи в категории</h3>
      </div>

      <div className="CategoryPieChart_content">
        <div className="CategoryPieChart_chart">
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <svg viewBox="0 0 240 240" className="CategoryPieChart_svg" aria-label="Категории продаж">
              {mainPercentage > 0 && (
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#2600ff"
                  strokeWidth="40"
                  strokeDasharray={mainStrokeDasharray}
                  transform="rotate(-90 120 120)"
                />
              )}

              {addPercentage > 0 && (
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#82cbff"
                  strokeWidth="40"
                  strokeDasharray={addStrokeDasharray}
                  strokeDashoffset={addStrokeDashoffset}
                  transform="rotate(-90 120 120)"
                />
              )}

              <text
                x="120"
                y="110"
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.6)"
                fontSize="14"
                fontWeight="400"
              >
                Сумма
              </text>

              <text
                x="120"
                y="135"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="18"
                fontWeight="600"
              >
                {(data[0]?.total_Sum+data[1]?.total_Sum) || data[0]?.total_Sum} Р
              </text>
            </svg>
          )}
        </div>

        <div className="CategoryPieChart_legend">
          {itemsForLegend.length > 0 ? itemsForLegend.slice(0, 2).map((it, idx) => (
            <div className="CategoryPieChart_legend_item" key={idx}>
              <span className={`CategoryPieChart_legend_dot ${idx === 0 ? 'main' : 'additional'}`}></span>
              <span className="CategoryPieChart_legend_label">
                {it.type} ({it.percentage}%)
              </span>
            </div>
          )) : (
            <div className="CategoryPieChart_legend_item">
              <span className="CategoryPieChart_legend_dot main"></span>
              <span className="CategoryPieChart_legend_label">
                Нет данных
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;
