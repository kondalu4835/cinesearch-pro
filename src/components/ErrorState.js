import React from 'react';

const ErrorState = ({ message = "Couldn't load content", onRetry }) => (
  <div className="text-center py-24">
    <p className="text-5xl mb-4">📡</p>
    <h3 className="text-white font-semibold text-lg mb-2">{message}</h3>
    <p className="text-dark-500 text-sm mb-6">Check your connection and try again</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        🔄 Retry
      </button>
    )}
  </div>
);

export default ErrorState;