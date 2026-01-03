
import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    provider: 'kakao' | 'naver';
    onClick?: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, className, onClick, ...props }) => {
    const isKakao = provider === 'kakao';

    const baseStyles = "w-full h-12 rounded-xl flex items-center justify-center gap-3 font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md";

    const providerStyles = isKakao
        ? "bg-[#FEE500] text-[#391B1B] hover:bg-[#FDD835]"
        : "bg-[#03C75A] text-white hover:bg-[#02B150]";

    return (
        <button
            className={`${baseStyles} ${providerStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {/* 아이콘 자리 (SVG 삽입 권장) */}
            <span className="text-lg font-bold">{isKakao ? 'K' : 'N'}</span>
            <span>{isKakao ? '카카오로 시작하기' : '네이버로 시작하기'}</span>
        </button>
    );
};
