import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export function getSupportedLanguages() {
    return ['id', 'en', 'ru', 'hi', 'pt', 'tr', 'ar', 'es', 'de', 'it', 'fil'];
}

i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'id',
        supportedLngs: getSupportedLanguages(),
        ns: ['common', 'auth'],
        defaultNS: 'common',
        detection: {
            order: ['localStorage', 'htmlTag', 'navigator'],
            caches: ['localStorage'],
        },
        preload: ['id'],
        backend: {
            loadPath: '/language/{{lng}}/{{ns}}.json',
        },
        react: {
            useSuspense: true,
        },
        interpolation: {
            escapeValue: false,
        },
        debug: import.meta.env.MODE === 'development',
    });

// Sinkronkan bahasa UI dengan locale server (cookie `locale` yang dipakai
// HandleLocale & format_currency). Frontend memakai i18n.language untuk
// mengonversi kurs, jadi keduanya HARUS menunjuk bahasa yang sama,
// kalau tidak validasi min/max deposit memakai kurs yang salah.
if (!localStorage.getItem('language')) {
    i18n.on('initialized', () => {
        if (!localStorage.getItem('language')) {
            try {
                const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
                if (match) {
                    const raw = decodeURIComponent(match[1]);
                    let serverLocale = raw;
                    try {
                        serverLocale = JSON.parse(atob(raw))?.value ?? raw;
                    } catch {
                        // cookie terenkripsi server / bukan base64 JSON -> pakai apa adanya
                    }
                    if (getSupportedLanguages().includes(serverLocale) && serverLocale !== i18n.language) {
                        localStorage.setItem('language', serverLocale);
                        i18n.changeLanguage(serverLocale);
                    }
                }
            } catch {
                // abaikan: fallback tetap 'id' (default i18n)
            }
        }
    });
}

i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

export default i18n;
