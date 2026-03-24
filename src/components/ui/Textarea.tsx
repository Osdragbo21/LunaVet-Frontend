import React from 'react';

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
    return (
        <textarea 
        className={`w-full px-4 py-3 rounded-[12px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/10 focus:outline-none focus:border-[#3B82F6] resize-none ${className}`} 
        {...props} 
        />
    );
};


