<?php

use Inertia\Inertia;
use App\Models\Locale;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Service\Service;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use App\Models\Website\WebsiteSitemap;
use App\Models\Service\ServiceCategory;
use Illuminate\Support\Facades\Storage;
use App\Models\Service\ServiceCategoryGroup;
use App\Enums\Service\Service as ServiceEnum;
use App\Models\Order\Order;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceProviderConfiguration;
use App\Models\User\User;
use App\Models\Website\WebsiteBlog;
use App\Services\DokuService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Artisan;

Route::get('/', \App\Http\Controllers\Guest\DashboardController::class)->name('guest.dashboard');

Route::prefix('services')->name('guest.services.')->group(function () {
    Route::get('/', \App\Http\Controllers\Guest\Service\ServiceController::class)->name('index');
    Route::get('/updates', \App\Http\Controllers\Guest\Service\UpdateController::class)->name('updates');
    Route::get('/monitoring', \App\Http\Controllers\Guest\Service\MonitoringController::class)->name('monitoring');
});

Route::get('ranking', \App\Http\Controllers\Guest\RankingController::class)->name('guest.ranking');

Route::get('sitemaps/{target:slug}', function (WebsiteSitemap $target) {
    abort_if($target->is_public == '0' && !auth()->check(), 403);
    return inertia('guest/sitemap', [
        'pageProps' => [
            'target' => $target
        ],
    ]);
})->name('guest.sitemaps.show');

Route::get('blogs', function (Request $request) {
    $blogs = WebsiteBlog::query()
        ->when($request->input(), function ($query) use ($request) {
            if ($request->input('search')) {
                $query->where(function ($query) use ($request) {
                    $query->where('title', 'like', '%' . $request->input('search') . '%');
                    $query->orWhere('content', 'like', '%' . $request->input('search') . '%');
                });
            }
            if ($request->input('category')) {
                info($request->input('category'));
                info(Str::headline($request->input('category')));
                $query->whereRaw(
                    'LOWER(
                        REPLACE(
                            REPLACE(
                                REPLACE(category, " & ", "-"),
                                " ",
                                "-"
                            ),
                            "--",
                            "-"
                        )
                    ) = ?',
                    [$request->input('category')]
                );
            }
            if (!auth()->check()) {
                $query->where('is_public', 1);
            }
        })
        ->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
        ->paginate(10)
        ->onEachSide(10)
        ->withQueryString();
    return inertia('guest/blog/index', [
        'pageProps' => [
            'websiteBlogs' => $blogs,
            'websiteBlogCategories' => WebsiteBlog::when($request->input(), function ($query) use ($request) {
                if (!auth()->check()) {
                    $query->where('is_public', 1);
                }
            })->distinct()->get(['category'])
                ->map(function ($row) {
                    return [
                        'value' => Str::slug($row->category),
                        'label'   => $row->category,
                        'count' => WebsiteBlog::where('category', $row->category)->count(),
                    ];
                }),
            'filters' => $request->only(['search', 'category']),
        ],
    ]);
})->name('guest.blogs.index');

Route::get('blogs/{target:slug}', function (WebsiteBlog $target) {
    abort_if($target->is_public == '0' && !auth()->check(), 403);
    $target->category_slug = Str::slug($target->category);
    return inertia('guest/blog/detail', [
        'pageProps' => [
            'target' => $target,
            'relatedBlogs' => WebsiteBlog::where([
                'category' => $target->category,
                'is_public' => !auth()->check() ? '1' : '0',
            ])->where('id', '<>', $target->id)->get(),
            'websiteBlogCategories' => WebsiteBlog::where([
                'is_public' => !auth()->check() ? '1' : '0',
            ])->distinct()->get(['category'])
                ->map(function ($row) {
                    return [
                        'value' => Str::slug($row->category),
                        'label'   => $row->category,
                        'count' => WebsiteBlog::where('category', $row->category)->count(),
                    ];
                }),
        ],
    ]);
})->name('guest.blogs.show');

Route::get('api-docs', function () {
    abort_if(!auth()->check() || !auth()->user()->userGroup->is_api_access_enabled, 403);
    return inertia('user/api-docs/index', [
        'pageProps' => [
            'serviceTypes' => collect(ServiceEnum::ARRAY_TYPE_LABELS())->map(function ($label, $value) {
                $data[] = ['value' => $value, 'label' => $label];
                return $data;
            })->collapse(),
        ],
    ]);
})->middleware(['auth', 'user.account.verify'])->name('user.api_docs');

Route::post('switch-language', function (Request $request) {
    $locale = $request->input('locale');
    if (!in_array($locale, ['id', 'en', 'ru', 'hi', 'pt', 'tr', 'ar', 'es', 'de', 'it', 'fil'])) {
        return response()->json(['status' => false, 'message' => 'Invalid locale']);
    }
    App::setLocale($locale);
    if (auth('web')->check() && $locale !== auth('web')->user()->locale->locale) {
        $getLocale = Locale::where('locale', $locale)->first();
        auth('web')->user()->update([
            'locale_id' => $getLocale->id
        ]);
    }
    if (auth('admin')->check() && $locale !== auth('admin')->user()->locale->locale) {
        $getLocale = Locale::where('locale', $locale)->first();
        auth('admin')->user()->update(['locale_id' => $getLocale->id]);
    }
    return response()->json(['status' => true, 'locale' => $locale])->cookie('locale', $locale, 60 * 24 * 365 * 5);
});


Route::get('/analytics-data', function () {

    // Headers agar iframe bisa diakses
    header('X-Frame-Options: ALLOWALL');
    header('Access-Control-Allow-Origin: *');
    header('Content-Security-Policy: frame-ancestors *');

    // --- WINDOW & THRESHOLD ---
    $windowDays = 14;
    $fastThreshold = 7200;
    $slowThreshold = 86400;

    function formatDuration($seconds)
    {
        $days = floor($seconds / 86400);
        $hours = floor(($seconds % 86400) / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        $parts = [];

        if ($days > 0) {
            $parts[] = $days . 'h';
        }

        if ($hours > 0) {
            $parts[] = $hours . 'j';
        }

        if ($minutes > 0) {
            $parts[] = $minutes . 'm';
        }

        if (empty($parts)) {
            $parts[] = '<1m';
        }

        return implode(' ', $parts);
    }

    function buildStatsArray($total, $success, $failed, $process)
    {
        $total = (int) $total;
        $success = (int) $success;

        $rate = $total > 0
            ? round(($success / $total) * 100, 1)
            : 0;

        return [
            'total' => $total,
            'success' => $success,
            'failed' => (int) $failed,
            'process' => (int) $process,
            'rate' => $rate,
        ];
    }

    $interval = (int) $windowDays;
    $fastSec = (int) $fastThreshold;
    $slowSec = (int) $slowThreshold;

    $sqlTemplate = "
        SELECT
            o.service_id,
            s.name,
            AVG(CASE WHEN o.status = 'completed' THEN TIMESTAMPDIFF(SECOND, o.created_at, o.updated_at) END) as avg_seconds,
            COUNT(o.id) as total_orders,
            SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as cnt_success,
            SUM(CASE WHEN o.status IN ('partial', 'canceled') THEN 1 ELSE 0 END) as cnt_failed,
            SUM(CASE WHEN o.status IN ('pending', 'processing', 'in_progress') THEN 1 ELSE 0 END) as cnt_process
        FROM orders o
        JOIN services s ON o.service_id = s.id
        WHERE o.status IN ('completed', 'in_progress', 'processing', 'pending', 'partial', 'canceled')
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL {$interval} DAY)
        AND s.status = '1'
        AND s.deleted_at IS NULL
        GROUP BY o.service_id, s.name
        HAVING %CONDITION%
        ORDER BY avg_seconds %ORDER%
    ";

    $fastQuery = str_replace(
        ['%CONDITION%', '%ORDER%'],
        ["avg_seconds <= {$fastSec} AND COUNT(o.id) >= 1", 'ASC'],
        $sqlTemplate
    );

    $slowQuery = str_replace(
        ['%CONDITION%', '%ORDER%'],
        ["avg_seconds >= {$slowSec} AND COUNT(o.id) >= 1", 'DESC'],
        $sqlTemplate
    );

    $dataFast = [];

    foreach (DB::select($fastQuery) as $row) {
        $row = (array) $row;

        $row['stats'] = buildStatsArray(
            $row['total_orders'],
            $row['cnt_success'],
            $row['cnt_failed'],
            $row['cnt_process']
        );

        $row['fmt_time'] = formatDuration($row['avg_seconds']);

        $dataFast[] = $row;
    }

    $dataSlow = [];

    foreach (DB::select($slowQuery) as $row) {
        $row = (array) $row;

        $row['stats'] = buildStatsArray(
            $row['total_orders'],
            $row['cnt_success'],
            $row['cnt_failed'],
            $row['cnt_process']
        );

        $row['fmt_time'] = formatDuration($row['avg_seconds']);

        $dataSlow[] = $row;
    }

    $newQuery = "
        SELECT
            su.service_id,
            s.name,
            su.created_at as added_date
        FROM service_updates su
        JOIN services s ON su.service_id = s.id
        WHERE su.type = 'added'
        AND su.created_at >= DATE_SUB(NOW(), INTERVAL {$interval} DAY)
        AND s.status = '1'
        AND s.deleted_at IS NULL
        ORDER BY su.created_at DESC
    ";

    $tempNew = DB::select($newQuery);

    $serviceIds = collect($tempNew)
        ->pluck('service_id')
        ->unique()
        ->implode(',');

    $statsMap = [];

    if ($serviceIds) {
        $statsQuery = "
            SELECT
                service_id,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as success,
                SUM(CASE WHEN status IN ('partial', 'canceled') THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status IN ('pending', 'processing', 'in_progress') THEN 1 ELSE 0 END) as process
            FROM orders
            WHERE service_id IN ({$serviceIds})
            AND created_at >= DATE_SUB(NOW(), INTERVAL {$interval} DAY)
            GROUP BY service_id
        ";

        foreach (DB::select($statsQuery) as $s) {
            $statsMap[$s->service_id] = (array) $s;
        }
    }

    $dataNew = [];

    foreach ($tempNew as $row) {
        $row = (array) $row;

        $sid = $row['service_id'];

        $s = $statsMap[$sid] ?? [
            'total' => 0,
            'success' => 0,
            'failed' => 0,
            'process' => 0,
        ];

        $row['stats'] = buildStatsArray(
            $s['total'],
            $s['success'],
            $s['failed'],
            $s['process']
        );

        $row['fmt_date'] = date('d M', strtotime($row['added_date']));

        $dataNew[] = $row;
    }

    return response()->view('analytics-data', [
        'windowDays' => $windowDays,
        'dataFast' => $dataFast,
        'dataSlow' => $dataSlow,
        'dataNew' => $dataNew,
    ])->header('X-Frame-Options', 'ALLOWALL')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Content-Security-Policy', 'frame-ancestors *');
})->name('analytics-data');

// Route::get('language/{locale}.json', function ($locale) {
//     if (!in_array($locale, ['id', 'en'])) {
//         abort(404);
//     }
//     $cacheKey = "language_json_{$locale}";
//     // $translations = Cache::rememberForever($cacheKey, function () use ($locale) {
//     $langPath = resource_path("lang/{$locale}/messages.php");

//     if (!File::exists($langPath)) {
//         return [];
//     }
//     $raw = File::getRequire($langPath);
//     $flatten = function ($array, $prefix = '') use (&$flatten) {
//         $result = [];
//         foreach ($array as $key => $value) {
//             $newKey = $prefix === '' ? $key : $prefix . '.' . $key;
//             if (is_array($value)) {
//                 $result += $flatten($value, $newKey);
//             } else {
//                 $value = preg_replace('/\:([a-zA-Z_]+)/', '{{$1}}', $value);
//                 $result[$newKey] = $value;
//             }
//         }
//         return $result;
//     };
//     return $flatten($raw);
//     // });
//     return response()->json($translations);
// });

// Route::get('languages/{locale}/{namespace}.json', function ($locale, $namespace) {
//     if (!in_array($locale, ['id', 'en'])) {
//         abort(404);
//     }
//     App::setLocale($locale);
//     $langPath = resource_path("lang/{$locale}/{$namespace}.php");
//     if (!File::exists($langPath)) {
//         return response()->json([]);
//     }
//     $raw = File::getRequire($langPath);
//     $convertKeysToKebabCase = function (array $array) use (&$convertKeysToKebabCase) {
//         $converted = [];
//         foreach ($array as $key => $value) {
//             $newKey = Str::kebab(str_replace('_', '-', $key));
//             if (is_array($value)) {
//                 $converted[$newKey] = $convertKeysToKebabCase($value);
//             } else {
//                 $value = preg_replace('/\:([a-zA-Z_]+)/', '{{$1}}', $value);
//                 $converted[$newKey] = $value;
//             }
//         }
//         return $converted;
//     };
//     $translations = $convertKeysToKebabCase($raw);
//     return response()->json($translations);
// });

Route::get('export-translations', function () {
    $baseLangPath = resource_path('lang');
    $outputBasePath = public_path('language');
    $convertKeysToKebabCase = function (array $array) use (&$convertKeysToKebabCase) {
        $converted = [];
        foreach ($array as $key => $value) {
            $newKey = Str::kebab(str_replace('_', '-', $key));
            if (is_array($value)) {
                $converted[$newKey] = $convertKeysToKebabCase($value);
            } else {
                $value = preg_replace('/\:([a-zA-Z_]+)/', '{{$1}}', $value);
                $converted[$newKey] = $value;
            }
        }
        return $converted;
    };
    $languages = File::directories($baseLangPath);
    foreach ($languages as $langPath) {
        $locale = basename($langPath);
        App::setLocale($locale);
        $outputPath = $outputBasePath . '/' . $locale;
        if (!File::exists($outputPath)) {
            File::makeDirectory($outputPath, 0755, true);
        }
        foreach (
            [
                'account.php',
                'auth.php',
                'common.php',
                'dashboard.php',
                'orders.php',
                'deposits.php',
                'services.php',
                'tickets.php',
                'api.php',
                'landing.php',
                'affiliate.php',
                'blogs.php',
                'blog.php',
                'report.php',
                'ranking.php',
            ] as $filename
        ) {
            $filePath = $langPath . '/' . $filename;
            if (File::exists($filePath)) {
                $basename = pathinfo($filename, PATHINFO_FILENAME);
                $raw = File::getRequire($filePath);
                $translations = $convertKeysToKebabCase($raw);
                $jsonPath = $outputPath . '/' . $basename . '.json';
                File::put($jsonPath, json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }
        $adminPath = $langPath . '/admin';
        if (File::exists($adminPath)) {
            $adminOutputPath = $outputPath . '/admin';
            if (!File::exists($adminOutputPath)) {
                File::makeDirectory($adminOutputPath, 0755, true);
            }
            foreach (
                [
                    'common.php',
                    'services.php',
                    'orders.php',
                    'payment-methods.php',
                    'dashboard.php',
                    'profit-loss.php',
                    'report.php',
                    'account.php',
                    'provider-response.php',
                    'logs.php',
                    'products.php',
                    'users.php',
                ] as $filename
            ) {
                $filePath = $adminPath . '/' . $filename;
                if (File::exists($filePath)) {
                    $basename = pathinfo($filename, PATHINFO_FILENAME);
                    $raw = File::getRequire($filePath);
                    $translations = $convertKeysToKebabCase($raw);
                    $jsonPath = $adminOutputPath . '/' . $basename . '.json';
                    File::put($jsonPath, json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                }
            }
        }
    }
    return response()->json([
        'status' => 'success',
        'message' => 'Selected translations exported successfully.',
    ]);
});

/*
|--------------------------------------------------------------------------
| Cronjob HTTP (port admin-smm, stub config)
|--------------------------------------------------------------------------
| Dipanggil oleh scheduler/hosting via HTTP. Aman tanpa kredensial:
| controller melewati eksekusi + memberi log jelas bila config kosong.
*/
Route::prefix('cron')->name('cron.')->group(function () {
    Route::get('bca-mutation', \App\Http\Controllers\Cronjob\BCAMutationController::class)->name('bca-mutation');
    Route::get('update-mobile-notification', [\App\Http\Controllers\Cronjob\MobileNotificationController::class, 'update'])->name('update-mobile-notification');
    Route::get('check-status', [\App\Http\Controllers\Cronjob\OrderController::class, 'checkStatus'])->name('check-status');
    Route::get('check-status-refill', [\App\Http\Controllers\Cronjob\OrderController::class, 'checkStatusRefill'])->name('check-status-refill');
    Route::get('send-order', [\App\Http\Controllers\Cronjob\OrderController::class, 'sendOrder'])->name('send-order');
});

/*
|--------------------------------------------------------------------------
| Cronjob via HTTP (untuk panel yang cron-nya hanya bisa wget/curl)
|--------------------------------------------------------------------------
| Memicu `schedule:run` lewat HTTP. Dilindungi CRON_SECRET di .env.
| Tanpa secret (kosong) atau secret salah => 404, sama polanya dengan
| endpoint mutasi HP (NOTIF_FORWARDER_TOKEN).
*/
Route::get('cron/run/{secret?}', function (?string $secret = null) {
    $expected = trim((string) config('services.cron.secret', ''));
    if ($expected === '' || !is_string($secret) || $secret === '' || !hash_equals($expected, $secret)) {
        abort(404);
    }
    Artisan::call('schedule:run');
    return response()->json([
        'ok'      => true,
        'message' => 'schedule:run executed',
    ]);
})->where('secret', '[A-Za-z0-9]{10,128}');

/*
|--------------------------------------------------------------------------
| Queue drain via HTTP (pasangan /cron/run untuk setup wget-only)
|--------------------------------------------------------------------------
| Memproses job di queue (mis. hasil service:sync-service) dengan batas
| waktu ketat: berhenti saat queue kosong atau maks 55 detik, jadi aman
| dipanggil cron wget tiap menit. Tanpa secret valid => 404.
*/
Route::get('cron/queue/{secret?}', function (?string $secret = null) {
    $expected = trim((string) config('services.cron.secret', ''));
    if ($expected === '' || !is_string($secret) || $secret === '' || !hash_equals($expected, $secret)) {
        abort(404);
    }
    Artisan::call('queue:work', [
        '--queue'           => 'service-provider-fetch,default',
        '--stop-when-empty' => true,
        '--max-time'        => 55,
        '--tries'           => 3,
        '--sleep'           => 3,
    ]);
    return response()->json([
        'ok'      => true,
        'message' => 'queue drained',
    ]);
})->where('secret', '[A-Za-z0-9]{10,128}');
