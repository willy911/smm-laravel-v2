import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/app/**', '**/routes/**', '**/database/**', '**/resources/lang/**', '**/public/sitemap.xml'],
        },
    },
    build: {
        // chunkSizeWarningLimit: 10000,
        rollupOptions: {
            output: {
                manualChunks: {
                    // hugeicons: ['hugeicons-react'],
                    // vendor: ['react', 'react-dom'],
                },
            },
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),
        },
    },
});
