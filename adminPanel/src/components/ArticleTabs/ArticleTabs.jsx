import React from 'react';
import './ArticleTabs.css';
const ArticleTabs = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className="ArticleTabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`ArticleTabs_tab ${
            activeTab === tab.id ? 'ArticleTabs_tab_active' : ''
          }`}
          onClick={() => onTabChange && onTabChange(tab.id)}
        >
          {tab.label}
          <span className="ArticleTabs_badge">{tab.count}</span>
        </button>
      ))}
    </div>
  );
};

export default ArticleTabs;