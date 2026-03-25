import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon: Icon, rightElement, className = "", ...props }) => (
    <div className="relative">
        {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
            <Icon size={20} />
        </div>
        )}
        <input
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B]/50 dark:placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all ${className}`}
        {...props}
        />
        {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#3B82F6] transition-colors">
            {rightElement}
        </div>
        )}
    </div>
);