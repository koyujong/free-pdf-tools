'use client';

import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
    slotId: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    style?: React.CSSProperties;
}

export default function AdUnit({ slotId, format = 'auto', className, style }: AdUnitProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error('AdSense parsing error', e);
        }
    }, []);

    return (
        <div className={`w-full overflow-hidden ${className || ''}`} style={style}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-3488637908196788"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
