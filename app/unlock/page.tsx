'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Unlock PDF client-side using pdf-lib
const UnlockClient = dynamic(() => import('./UnlockClient'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    )
});

export default function UnlockPage() {
    return <UnlockClient />;
}
