import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }: CardProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }: CardProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}
