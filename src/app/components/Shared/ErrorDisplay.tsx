"use client";

interface ErrorProps {
  errorMessage?: string;
  retryMessage?: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ errorMessage = "Something went wrong", retryMessage = "Try Again", onRetry }: ErrorProps) => {
  return (
    <div className="error-container">
      <div className="error-icon" role="alert">
        !
      </div>
      <p className="error-message">{errorMessage}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-button">
          {retryMessage}
        </button>
      )}
    </div>
  );
};
