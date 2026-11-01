import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import DevToolsGuard from './components/dev-tools-guard';
import { initializeTheme } from './hooks/use-appearance';
import './lib/i18n';

createInertiaApp({
    title: (title) => title,
    resolve: (name) => resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <DevToolsGuard>
                <App {...props} />
            </DevToolsGuard>,
        );
    },
    progress: {
        color: 'var(--primary)',
    },
});

initializeTheme();
