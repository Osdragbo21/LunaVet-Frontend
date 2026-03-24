import React from 'react';

export const Label = ({ children, className = "", ...props }) => (
    <label className={`text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] block text-left ${className}`} {...props}>
        {children}
    </label>
);