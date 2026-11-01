<?php

namespace App\Http\Middleware;

use App\Models\Deposit\Deposit;
use App\Models\Locale;
use App\Models\Order\Order;
use App\Models\Service\Service;
use App\Models\Ticket\Ticket;
use App\Models\User\User;
use App\Models\Website\WebsiteNews;
use App\Models\Website\WebsiteSitemap;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $pageProps = [
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user('web')?->append('group'),
                'admin' => $request->user('admin')?->append('group'),
            ],
            'configs' => website_config(array_merge(
                [
                    'website',
                    'banner',
                    'social',
                    'order_info',
                    'menu',
                    'api',
                    'theme',
                    'affiliate',
                    'reviews'
                ],
                request()->routeIs('admin.websites.*') ? ['payment_gateway', 'menu', 'prefix', 'smtp', 'third_party_plugin', 'order_example_target'] : [],
                request()->routeIs('user.orders.create') ? ['order_example_target'] : []
            )),
            // 'ziggy' => fn(): array => [
            //     ...(new Ziggy)->toArray(),
            //     'location' => $request->url(),
            // ],
            'websiteNews' => Cache::remember('website_news', now()->addHours(6), function () {
                return WebsiteNews::where('status', '1')->when(!auth()->check(), fn($query) => $query->where('is_public', '1'))->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->limit(5)->get();
            }),
            'websiteSitemaps' => Cache::remember('website_sitemaps', now()->addHours(6), function () {
                return WebsiteSitemap::where('status', '1')->when(!auth()->check(), fn($query) => $query->where('is_public', '1'))->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get();
            }),
            'locales' => Cache::remember('locales', now()->addHours(6), function () {
                return Locale::where('status', '1')->get();
            }),
            'cdnURL'  => config('app.cdn_url'),
            'theme' => [
                'light' => [
                    'primary' => 'hsl(199 100% 20.6%)',
                    'accent' => 'oklch(0.97 0 0)',
                    'background' => 'oklch(1 0 0)',
                    'foreground' => 'oklch(0.145 0 0)',
                ],
                'dark' => [
                    'primary' => 'hsl(199 100% 20.6%)',
                    'accent' => 'oklch(0.269 0 0)',
                    'background' => 'oklch(0.145 0 0)',
                    'foreground' => 'oklch(0.985 0 0)',
                ]
            ]
        ];
        if (auth()->check()) {
            $pageProps['unreadTicketsCount'] = Ticket::where([
                ['user_id', auth()->id()],
                ['is_read_user', '0'],
            ])->orWhere(function ($query) {
                $query->where('user_id', auth()->id())->where('status', 'answered');
            })->count();
        }
        if (auth('admin')->check()) {
            $pageProps['unreadTicketsCountAdmin'] = Ticket::where(function ($query) {
                $query->whereIn('status', ['user_reply', 'waiting']);
                $query->where('is_read_admin', '0');
            })->count();
        }
        if (Route::currentRouteName() === 'guest.dashboard' && website_config('menu')->guest->dashboard->summary->enabled == '1') {
            $pageProps['summary'] = [
                'users' => User::count(),
                'orders' => Order::count(),
                'services' => Service::count(),
            ];
        }
        foreach (['responseInfo', 'responseWarning', 'responseError', 'responseSuccess', 'orderData', 'orderDataMassal'] as $type) {
            if (session()->has($type)) {
                $pageProps[$type] = $request->session()->get($type);
                $pageProps['responseTime'] = date('YmdHis');
            }
        }
        return array_merge(parent::share($request), $pageProps);
    }
}
