'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Add Watermark to PDF client-side using pdf-lib
const WatermarkClient = dynamic(() => import('./WatermarkClient'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
    )
});

export default function WatermarkPage() {
    return <WatermarkClient />;
}
