import React from 'react';

interface AdPlaceholderProps {
  position?: 'top' | 'mid' | 'bottom';
  className?: string;
}

export default function AdPlaceholder({ position = 'bottom', className = '' }: AdPlaceholderProps) {
  const positionLabel = {
    top: 'Top Ad Space (상단 광고)',
    mid: 'Middle Ad Space (중단 광고)',
    bottom: 'Bottom Ad Space (하단 광고)'
  };

  return (
    <div className={`w-full max-w-5xl mx-auto my-8 p-12 border border-dashed border-gray-200 rounded-[2rem] bg-gray-50/30 flex flex-col items-center justify-center text-center transition-opacity hover:opacity-80 group ${className}`}>
      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <p className="text-[15px] font-bold tracking-tight text-gray-500 leading-none">
          {positionLabel[position]}
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      </div>
      <p className="text-[12px] font-semibold text-gray-400/70 tracking-wide">
        Google AdSense / Sponsorship Area
      </p>
    </div>
  );
}
