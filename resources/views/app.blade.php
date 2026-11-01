<!DOCTYPE html>
<html class="scroll-smooth" lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="robots" content="index, follow" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="title" content="{{ website_config()->name }}">
    <meta name="keywords" content="{{ website_config()->meta_keywords }}" />
    <meta name="description" content="{{ website_config()->meta_description }}" />
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ website_config()->name }}">
    <meta property="og:description" content="{{ website_config()->meta_description }}">
    <meta property="og:image" content="{{ config('app.cdn_url') . '/website/' . website_config()->meta_image }}">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="{{ website_config()->name }}">
    <meta property="twitter:description" content="{{ website_config()->meta_description }}">
    <meta property="twitter:image" content="{{ config('app.cdn_url') . '/website/' . website_config()->meta_image }}">
    {{-- <link rel="canonical" href="{{ url()->current() }}" /> --}}

    <link rel="icon" href="{{ config('app.cdn_url') . '/website/' . website_config()->icon }}" />
    <link rel="apple-touch-icon" href="{{ config('app.cdn_url') . '/website/' . website_config()->icon }}">
    <title inertia>{{ website_config()->sub_name }} - {{ website_config()->name }}</title>

    <script>
        (function() {
            window.appearance = '{{ $appearance ?? 'light' }}';
            if (window.appearance === 'system') {
                const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                if (prefersLight) {
                    document.documentElement.classList.add('light');
                }
            }
        })();
    </script>

    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=outfit:400,500,600" rel="stylesheet" />

    @php
        $prefix = website_config('prefix')->admin_url;
    @endphp
    @if (request()->is([$prefix, $prefix . '/*']))
        @routes(['admin', 'guest', 'ajax'])
    @else
        @routes(['user', 'guest', 'ajax'])
        @if (website_config('third_party_plugin')->google->tags)
            {!! website_config('third_party_plugin')->google->tags !!}
        @endif
        @if (website_config('third_party_plugin')->google->token)
            <meta name="google-site-verification" content="{!! website_config('third_party_plugin')->google->token !!}" />
        @endif
    @endif

    <script src="/assets/js/analytics-widget.js" defer></script>
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/pages/{$page['component']}.jsx"])
    @inertiaHead
    <style>
        #analysis-widget-button {
            background: linear-gradient(135deg,
                    {{ website_config('theme')->light->primary ?? '#6879ef' }},
                    {{ website_config('theme')->light->primary ?? '#6879ef' }}) !important;

            box-shadow: rgba(34, 197, 94, 0.35) -2px 2px 15px !important;
        }
    </style>
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
