import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import './CategoryTabs.css';

const CategoryTabs = ({ onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await apiRequest('/api/products/categories');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const formattedTabs = [
          {
            id: '',
            label: 'Все',
            count: data.reduce((acc, category) => acc + (category.count || 0), 0),
          },
          ...data.map((category) => ({
            id: (category.name || '').toLowerCase(),
            label: category.name || 'Без категории',
            count: category.count || 0,
          })),
        ];

        setTabs(formattedTabs);
      } catch (error) {
        console.error('Ошибка при получении данных о категориях:', error);
        setTabs([{ id: '', label: 'Все', count: 0 }]);
      }
    };

    fetchCategoryData();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    if (onCategoryChange) onCategoryChange(tab.id);
  };

  return (
    <div className="CategoryTabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`CategoryTabs_tab ${activeTab === tab.id ? 'CategoryTabs_tab_active' : ''}`}
          onClick={() => handleTabClick(tab)}
        >
          {tab.label}
          <span className="CategoryTabs_badge">{tab.count}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
