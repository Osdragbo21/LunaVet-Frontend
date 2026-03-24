import React from 'react';

interface AuthLinkProps {
    text: string;
    href: string;
    align?: "center" | "left" | "right";
}

export const AuthLink: React.FC<AuthLinkProps> = ({ text, href, align = "center" }) => (
    <p className={`mt-8 text-${align} text-sm text-[#64748B] dark:text-[#94A3B8]`}>
        {text}{' '}
        <a href={href} className="font-medium text-[#3B82F6] hover:underline">
            soporte técnico
        </a>.
    </p>
);
