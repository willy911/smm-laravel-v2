import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { route } from 'ziggy-js';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => title,
        resolve: (name) => resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
        setup: ({ App, props }) => (
            <>
                {(() => {
                    global.route = (name, params, absolute) =>
                        route(name, params, absolute, {
                            ...page.props.ziggy,
                            location: new URL(page.props.ziggy.location),
                        });
                })()}
                <App {...props} />
            </>
        ),
    }),
);
