import React from 'react';
import './Button.css';

export const Button = ({ children, variant = 'primary', ...props }) => {
    return (
        <button className={`Button Button--${variant}`} {...props}>
            {children}
        </button>
    );
};
