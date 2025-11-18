import { React } from "react";

export function Container({ children, className = "", ...props }) {
    const baseClasses = "w-full h-full p-4 bg-(--bg-transparent) border border-(--border-color) text-(--text-primary)";
    const finalClasses = `${baseClasses} ${className}`;

    return (
        <div className={finalClasses} {...props}>
            {children}
        </div>
    );
}