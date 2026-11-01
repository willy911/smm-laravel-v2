import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
    const [language, setLang] = useState(() => {
        return localStorage.getItem('language') || 'id';
    });

    const { i18n } = useTranslation();

    const setLanguage = (lang) => {
        if (lang !== language) {
            localStorage.setItem('language', lang);
            setLang(lang);
            axios.post('/switch-language', { locale: lang }).catch(() => {});
        }
    };

    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key === 'language' && event.newValue && event.newValue !== language) {
                setLang(event.newValue);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
        };
    }, [language]);

    return {
        language,
        setLanguage,
    };
}
