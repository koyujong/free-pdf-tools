'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from '../locales/en';
import { ko } from '../locales/ko';
import { ja } from '../locales/ja';
import { es } from '../locales/es';

type Language = 'en' | 'ko' | 'ja' | 'es';
type Translations = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en'); // Default is English

    // 로컬 스토리지에 사용자 지정 언어 설정이 있다면 복원 (없으면 무조건 기본값 en 유지)
    useEffect(() => {
        const savedLang = localStorage.getItem('user_language') as Language;
        if (savedLang && ['en', 'ko', 'ja', 'es'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('user_language', lang);
    };

    const t = language === 'en' ? en : language === 'ko' ? ko : language === 'ja' ? ja : es;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
