import React from 'react';

export const LoadingSpinner = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4'
  };

  const containerClasses = fullPage 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center" 
    : "flex flex-col items-center justify-center p-12";

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} border-[#660000]/20 border-t-[#660000] rounded-full animate-spin mb-4`} />
      <p className="text-[#660000] font-bold animate-pulse">Memuat data...</p>
    </div>
  );
};