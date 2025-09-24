import React, { forwardRef, ReactNode, ButtonHTMLAttributes } from "react";

type ButtonProps = {
    children: ReactNode;
    variant?: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = "primary", className = "", ...props }, ref) => {
        const styles = [
            baseStyles,
            variantStyles[variant] || variantStyles.primary,
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <button ref={ref} className={styles} {...props}>
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
