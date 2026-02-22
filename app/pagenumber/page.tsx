'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Add Page Numbers to PDF client-side using pdf-lib
const PageNumberClient = dynamic(() => import('./PageNumberClient'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    )
});

export default function PageNumberPage() {
    return <PageNumberClient />;
}
