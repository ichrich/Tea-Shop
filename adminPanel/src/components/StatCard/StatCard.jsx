import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, change, isPositive, description }) => {
    return (
        <div className="StatCard">
            <div className="StatCard_header">
                <h3 className="StatCard_title">{title}</h3>
            </div>

            <div className="StatCard_content">
                <div className="StatCard_value">{value}</div>

                <div className={`StatCard_change ${isPositive ? 'positive' : 'negative'}`}>
                    <span className="StatCard_change_percent">{change}</span>
                    <span className="StatCard_change_description">{description}</span>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
