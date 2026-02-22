'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// SSR을 완전히 끄고 Browser 환경에서만 Client Component를 동적으로 임포트함
const OrganizeClient = dynamic(() => import('./OrganizeClient'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
    )
});

export default function OrganizePage() {
    return <OrganizeClient />;
}
