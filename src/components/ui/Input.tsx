import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
    return (
        <input 
        className={`w-full px-4 py-3 rounded-[12px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/10 focus:outline-none focus:border-[#3B82F6] ${className}`} 
        {...props} 
        />
    );
};
