"use client";

interface LoadingProps {
  size: "small" | "medium" | "large";
  text?: string;
}

export const Loading = ({ size, text }: LoadingProps) => {
  const sizeClass = `loading-spinner-${size}`;

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClass}`} role="status" aria-label="Loading" />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};
