import React, { forwardRef, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
};

const baseStyles =
    "w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, className = "", id, ...props }, ref) => {
        const textareaId =
            id || (label ? `textarea-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

        return (
            <div>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`${baseStyles} ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export default Textarea;
