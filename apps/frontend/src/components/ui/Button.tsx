import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md shadow-primary/20",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            outline: "border border-input bg-transparent hover:bg-muted text-foreground",
            ghost: "hover:bg-muted hover:text-foreground",
            danger: "bg-error text-white hover:bg-red-600",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-5 text-sm",
            lg: "h-14 px-8 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                )}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
