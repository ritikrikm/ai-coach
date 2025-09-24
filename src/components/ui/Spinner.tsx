import React from "react";

type SpinnerProps = {
    size?: number; // Tailwind size, e.g., 5 for h-5 w-5
};

const Spinner: React.FC<SpinnerProps> = ({ size = 5 }) => {
    const sizeClass = `h-${size} w-${size}`;
    return (
        <div
            className={`animate-spin border-4 border-blue-600 border-t-transparent rounded-full ${sizeClass}`}
            role="status"
            aria-label="Loading"
        />
    );
};

export default Spinner;
