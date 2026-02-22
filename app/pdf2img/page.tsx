'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Render PDF to Image extracting client-side using pdf.js
const Pdf2ImgClient = dynamic(() => import('./Pdf2ImgClient'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
    )
});

export default function Pdf2ImgPage() {
    return <Pdf2ImgClient />;
}
