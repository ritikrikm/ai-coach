import React, { forwardRef, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

const baseStyles =
    "w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, className = "", id, ...props }, ref) => {
        const inputId = id || (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

        return (
            <div>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`${baseStyles} ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
