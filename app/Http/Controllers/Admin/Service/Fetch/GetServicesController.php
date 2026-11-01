<?php

namespace App\Http\Controllers\Admin\Service\Fetch;

use Exception;
use App\Http\Controllers\Controller;
use App\Enums\Service\Service as ServiceEnum;
use App\Models\Admin\AdminActivityLog;
use App\Models\Service\Service;
use App\Models\Service\ServiceCategory;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GetServicesController extends Controller
{
    public function index()
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        return inertia('admin/service/fetch/get-services', [
            'pageProps' => [
                'serviceProviders' => $this->serviceProviderOptions(),
                'serviceCategories' => ServiceCategory::orderBy('name')->get(['id AS value', 'name AS label']),
            ]
        ]);
    }

    /**
     * Step 1: Fetch services from provider and return them
     */
    public function fetchServices(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        abort_if(!request()->ajax(), 404);

        $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'currency'    => 'required|in:IDR,USD',
            'profit_type' => 'required|in:fixed,percentage',
            'profit'      => 'nullable|numeric|min:0',
        ]);

        $provider = ServiceProvider::findOrFail($request->input('provider_id'));
        $kurs = $this->resolveKurs($provider);

        try {
            $config = optional($provider->serviceProviderConfiguration->services_configuration);
            $formData = collect($config->params)->mapWithKeys(function ($param) use ($provider) {
                if ($param->type === 'custom') return [$param->key => $param->value];
                if ($param->type === 'default_parameter') {
                    return [$param->key => collect($provider->default_parameters)->pluck('value', 'key')->get($param->key)];
                }
                return [];
            })->toArray();

            $response = Http::asForm()->withoutVerifying()->send($config->method, $config->endpoint, ['form_params' => $formData]);
            if (!$response->successful()) return response()->json(['status' => false, 'message' => 'Gagal mendapatkan data.']);

            $services = data_get($response->json(), $config->parse_response->looping) ?? $response->json();
            $parseResponse = $config->parse_response;
            $parseTexts = isset($config->parse_text->name) ? collect($config->parse_text->name) : collect();
            $profitType = $request->input('profit_type');
            $profitValue = (float) ($request->input('profit') ?? 0);

            $result = [];
            $apiCategories = [];

            foreach ($services as $svc) {
                $category = data_get($svc, $parseResponse->category) ?? 'Uncategorized';
                $serviceId = data_get($svc, $parseResponse->id);
                $rawPrice = data_get($svc, $parseResponse->price);
                $price = ceil($rawPrice * $kurs);
                $profit = $profitType === 'percentage' ? ceil(($profitValue / 100) * $price) : ceil($profitValue);
                $name = data_get($svc, $parseResponse->name);
                $min = data_get($svc, $parseResponse->min);
                $max = data_get($svc, $parseResponse->max);
                $description = isset($parseResponse->description) ? data_get($svc, $parseResponse->description) : '';
                $type = isset($parseResponse->type) ? data_get($svc, $parseResponse->type) : 'primary';
                $isRefill = isset($parseResponse->is_refill_support) ? data_get($svc, $parseResponse->is_refill_support) : '0';
                $isCancel = isset($parseResponse->is_cancel_support) ? data_get($svc, $parseResponse->is_cancel_support) : '0';

                $parseTexts->each(function ($item) use (&$name, &$category, &$description) {
                    $name = str_replace($item->from, $item->to, $name);
                    $category = str_replace($item->from, $item->to, $category);
                    $description = str_replace($item->from, $item->to, $description ?? '');
                });

                if (isset($config->parse_text->type) && $type !== 'primary') {
                    $key = array_search($type, get_object_vars($config->parse_text->type));
                    if ($key) $type = $key;
                }

                if (!in_array($category, $apiCategories)) {
                    $apiCategories[] = $category;
                }

                // Check if already exists in local DB
                $existingService = Service::where('service_provider_id', $provider->id)
                    ->where('service_provider_service_id', $serviceId)->first();

                $result[] = [
                    'service_id'       => $serviceId,
                    'category'         => $category,
                    'name'             => $name,
                    'original_price'   => $price,
                    'price'            => $price + $profit,
                    'profit'           => $profit,
                    'min'              => $min,
                    'max'              => $max,
                    'description'      => $description ?? '',
                    'type'             => $this->normalizeType($type),
                    'is_refill'        => filter_var($isRefill, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                    'is_cancel'        => filter_var($isCancel, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                    'existing_id'      => $existingService?->id,
                    'is_existing'      => (bool) $existingService,
                ];
            }

            return response()->json([
                'status'         => true,
                'message'        => 'Berhasil mengambil ' . count($result) . ' layanan.',
                'services'       => $result,
                'api_categories' => $apiCategories,
                'provider_id'    => $provider->id,
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    /**
     * Step 2: Import selected services
     */
    public function importServices(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        abort_if(!request()->ajax(), 404);

        $request->validate([
            'provider_id'       => 'required|exists:service_providers,id',
            'items'             => 'required|array|min:1',
            'category_mapping'  => 'required|array',
        ]);

        $providerId = $request->input('provider_id');
        $items = $request->input('items');
        $categoryMapping = $request->input('category_mapping'); // { "api_cat_name": local_cat_id }

        $inserted = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($items as $item) {
            $serviceId = $item['service_id'] ?? '';
            $apiCategory = $item['category'] ?? '';
            $localCategoryId = $categoryMapping[$apiCategory] ?? null;

            // If no local category mapped, auto-create
            if (!$localCategoryId) {
                $cat = ServiceCategory::firstOrCreate(
                    ['name' => $apiCategory ?: 'Uncategorized'],
                    ['slug' => Str::slug($apiCategory ?: 'uncategorized')]
                );
                $localCategoryId = $cat->id;
            }

            $existing = Service::where('service_provider_id', $providerId)
                ->where('service_provider_service_id', $serviceId)->first();

            if ($existing) {
                $hasChanges =
                    $existing->min != ($item['min'] ?? 0) ||
                    $existing->max != ($item['max'] ?? 0) ||
                    $existing->price != ($item['price'] ?? 0);

                if ($hasChanges) {
                    $previous = [
                        'min'   => (float) $existing->min,
                        'max'   => (float) $existing->max,
                        'price' => (float) $existing->price,
                    ];
                    $existing->update([
                        'service_category_id' => $localCategoryId,
                        'original_price' => $item['original_price'] ?? 0,
                        'price'          => $item['price'] ?? 0,
                        'profit'         => $item['profit'] ?? 0,
                        'min'            => $item['min'] ?? 0,
                        'max'            => $item['max'] ?? 0,
                        'is_auto_update_price' => '1',
                    ]);
                    if ($previous['price'] != (float) ($item['price'] ?? 0)) {
                        ServiceUpdate::create([
                            'service_id'     => $existing->id,
                            'type'           => (float) ($item['price'] ?? 0) > $previous['price'] ? 'price_increased' : 'price_decreased',
                            'content_key'    => (float) ($item['price'] ?? 0) > $previous['price']
                                ? 'services:updates.description.price-increased'
                                : 'services:updates.description.price-decreased',
                            'content_params' => (object) [
                                'from' => $previous['price'],
                                'to'   => (float) ($item['price'] ?? 0),
                                'type' => 'currency',
                            ],
                        ]);
                    }
                    if ($previous['min'] != (float) ($item['min'] ?? 0)) {
                        ServiceUpdate::create([
                            'service_id'     => $existing->id,
                            'type'           => 'updated',
                            'content_key'    => 'services:updates.description.min-updated',
                            'content_params' => (object) [
                                'from' => $previous['min'],
                                'to'   => (float) ($item['min'] ?? 0),
                                'type' => 'amount',
                            ],
                        ]);
                    }
                    if ($previous['max'] != (float) ($item['max'] ?? 0)) {
                        ServiceUpdate::create([
                            'service_id'     => $existing->id,
                            'type'           => 'updated',
                            'content_key'    => 'services:updates.description.max-updated',
                            'content_params' => (object) [
                                'from' => $previous['max'],
                                'to'   => (float) ($item['max'] ?? 0),
                                'type' => 'amount',
                            ],
                        ]);
                    }
                    $updated++;
                } else {
                    $skipped++;
                }
            } else {
                $newService = Service::create([
                    'service_category_id'         => $localCategoryId,
                    'service_provider_id'         => $providerId,
                    'service_provider_service_id' => $serviceId,
                    'name'                        => $item['name'] ?? '',
                    'original_price'              => $item['original_price'] ?? 0,
                    'price'                       => $item['price'] ?? 0,
                    'profit'                      => $item['profit'] ?? 0,
                    'min'                         => $item['min'] ?? 0,
                    'max'                         => $item['max'] ?? 0,
                    'description'                 => $item['description'] ?? '',
                    'type'                        => $this->normalizeType($item['type'] ?? null),
                    'is_refill_support'           => !empty($item['is_refill']) ? '1' : '0',
                    'is_cancel_support'           => !empty($item['is_cancel']) ? '1' : '0',
                    'is_auto_update_price'        => '1',
                ]);
                ServiceUpdate::create([
                    'service_id'     => $newService->id,
                    'type'           => 'added',
                    'content_key'    => 'services:updates.description.added',
                    'content_params' => (object) [],
                ]);
                $inserted++;
            }
        }

        AdminActivityLog::create([
            'admin_id'       => auth('admin')->user()->id,
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'content_key'    => 'admin/common:log.create-successful',
            'content_params' => (object) [
                'item' => 'common:labels.services',
                'id'   => "Get Services: {$inserted} ditambahkan, {$updated} diupdate, {$skipped} dilewati",
            ],
        ]);

        return response()->json([
            'status'  => true,
            'message' => "Selesai: {$inserted} ditambahkan, {$updated} diupdate, {$skipped} dilewati.",
        ]);
    }

    /**
     * Opsi provider untuk halaman fetch (mata uang & kurs diambil dari locale provider).
     */
    private function serviceProviderOptions()
    {
        return ServiceProvider::with('locale')->where([
            ['type', 'auto'],
            ['status', '1'],
        ])->latest()->get(['id', 'alias', 'locale_id'])->map(fn($provider) => [
            'value'    => $provider->id,
            'label'    => $provider->alias,
            'currency' => $provider->locale?->currency_code ?? 'IDR',
            'rate'     => (float) ($provider->locale?->usd_rate ?? 1),
        ]);
    }

    /**
     * Kurs konversi mengikuti perilaku admin-smm (currency USD memakai rate provider).
     * Provider wuzzuser menyimpan mata uang & kurs pada relasi locale.
     */
    private function resolveKurs(ServiceProvider $provider): float
    {
        $currency = $provider->currency ?? $provider->locale?->currency_code ?? 'IDR';
        $rate = (float) ($provider->rate ?? $provider->locale?->usd_rate ?? 1);
        return strtoupper($currency) === 'USD' ? $rate : 1;
    }

    /**
     * Provider API dapat mengirim string type mentah yang tidak dikenal (mis.
     * "Invites from Groups"), baik sebagai kunci enum ("custom_comments") maupun
     * sebagai label enum ("Custom Comments" — pola yang dikirim provider GOP).
     * Nilai tidak dikenal membuat pemetaan label enum di halaman daftar layanan
     * meledak (undefined array key), jadi paksa selalu menjadi salah satu tipe
     * yang dikenal enum; yang tidak dikenal jatuh ke 'primary'.
     */
    private function normalizeType(?string $type): string
    {
        if ($type === null || $type === '') {
            return 'primary';
        }

        $labels = ServiceEnum::getValue('ARRAY_TYPE_LABELS');

        // Sudah berupa kunci enum ("custom_comments").
        if (array_key_exists($type, $labels)) {
            return $type;
        }

        // Berupa label enum ("Custom Comments") -> petakan balik ke kunci.
        $key = array_search($type, $labels, true);

        return $key !== false ? $key : 'primary';
    }
}
