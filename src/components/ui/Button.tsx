import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    }

    export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-8 py-4 rounded-[12px] font-bold transition-all flex items-center justify-center gap-2";
    
    const variants = {
        primary: "bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_4px_20px_-5px_rgba(59,130,246,0.5)]",
        outline: "bg-white dark:bg-[#0F172A] hover:bg-black/5 dark:hover:bg-white/5 text-[#0F172A] dark:text-white border border-black/10 dark:border-white/10",
        ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#0F172A] dark:text-[#F8FAFC]"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
        </button>
    );
};
