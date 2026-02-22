'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ko' | 'ja' | 'es')}
                className="bg-transparent border-none outline-none font-medium cursor-pointer text-gray-700 hover:text-blue-600 transition-colors"
            >
                <option value="en">English (EN)</option>
                <option value="ko">한국어 (KO)</option>
                <option value="ja">日本語 (JA)</option>
                <option value="es">Español (ES)</option>
            </select>
        </div>
    );
}
