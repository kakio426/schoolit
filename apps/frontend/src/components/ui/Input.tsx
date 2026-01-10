import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, helperText, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={`
            flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50
            ${error
                            ? 'border-error focus-visible:ring-error/50'
                            : ''}
            ${className}
          `}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 font-medium ml-1">⚠️ {error}</p>}
                {!error && helperText && <p className="text-xs text-slate-500 ml-1">{helperText}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";
