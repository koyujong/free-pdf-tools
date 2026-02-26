import React from 'react';
import AdUnit from './AdUnit';

interface AdPlaceholderProps {
  position?: 'top' | 'mid' | 'bottom';
  className?: string;
}

export default function AdPlaceholder({ position = 'bottom', className = '' }: AdPlaceholderProps) {
  // 위치별로 각기 다른 애드센스 슬롯 ID를 할당합니다.
  const slotIds = {
    top: '2692019896',
    mid: '5984397640',
    bottom: '4671315974'
  };

  const slotId = slotIds[position] || '4671315974';

  return (
    <div className={`w-full max-w-5xl mx-auto my-8 ${className}`}>
        <AdUnit slotId={slotId} />
    </div>
  );
}
