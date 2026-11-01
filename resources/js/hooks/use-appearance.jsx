import { useCallback, useEffect, useState } from 'react';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name, value, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance');
    applyTheme(currentAppearance || (window.appearance ?? 'system'));
};

export function initializeTheme() {
    const savedAppearance = localStorage.getItem('appearance') || (window.appearance ?? 'system');
    applyTheme(savedAppearance);
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState(window.appearance ?? 'system');

    const updateAppearance = useCallback((mode) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);
        applyTheme(mode);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') || (window.appearance ?? 'system');
        updateAppearance(savedAppearance);

        const handleStorageChange = (event) => {
            if (event.key === 'appearance') {
                updateAppearance(event.newValue || (window.appearance ?? 'system'));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [updateAppearance]);

    return { appearance, updateAppearance };
}
