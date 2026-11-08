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
use App\Services\General\Service\ProviderServicesFetcher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FetchServiceSingleController extends Controller
{
    public function index()
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        return inertia('admin/service/fetch/single', [
            'pageProps' => [
                'serviceProviders' => $this->serviceProviderOptions(),
                'serviceCategories' => ServiceCategory::orderBy('name')->get(['id AS value', 'name AS label']),
            ]
        ]);
    }

    /**
     * AJAX: List categories dari provider API
     */
    public function listCategory(ServiceProvider $provider)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        abort_if(!request()->ajax(), 404);

        try {
            $config = optional($provider->serviceProviderConfiguration->services_configuration);
            $formData = collect($config->params)->mapWithKeys(function ($param) use ($provider) {
                if ($param->type === 'custom') return [$param->key => $param->value];
                if ($param->type === 'default_parameter') {
                    return [$param->key => collect($provider->default_parameters)->pluck('value', 'key')->get($param->key)];
                }
                return [];
            })->toArray();

            $response = Http::asForm()->withoutVerifying()->send($config->method, $config->endpoint, [
                'form_params' => $formData
            ]);

            if (!$response->successful()) {
                return response()->json(['status' => false, 'message' => 'Gagal mendapatkan data dari provider.']);
            }

            $services = data_get($response->json(), $config->parse_response->looping) ?? $response->json();
            if (!is_array($services)) {
                return response()->json(['status' => false, 'message' => 'Format data tidak valid.']);
            }

            $categoryKey = $config->parse_response->category ?? 'category';
            $categories = collect($services)
                ->pluck($categoryKey)
                ->filter()
                ->unique()
                ->values()
                ->map(fn($cat) => ['value' => $cat, 'label' => $cat])
                ->all();

            return response()->json(['status' => true, 'categories' => $categories]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    /**
     * AJAX: Fetch all services dari provider (dengan filter kategori opsional)
     */
    public function fetchServices(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        abort_if(!request()->ajax(), 404);

        $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'currency'    => 'required|in:IDR,USD',
            'profit'      => 'nullable|numeric|min:0',
        ]);

        $provider = ServiceProvider::findOrFail($request->input('provider_id'));
        $kurs = ProviderServicesFetcher::resolveKurs($provider);
        $profitInput = (float) ($request->input('profit') ?? 0);

        try {
            $config = optional($provider->serviceProviderConfiguration->services_configuration);
            $formData = collect($config->params)->mapWithKeys(function ($param) use ($provider) {
                if ($param->type === 'custom') return [$param->key => $param->value];
                if ($param->type === 'default_parameter') {
                    return [$param->key => collect($provider->default_parameters)->pluck('value', 'key')->get($param->key)];
                }
                return [];
            })->toArray();

            $response = Http::asForm()->withoutVerifying()->send($config->method, $config->endpoint, [
                'form_params' => $formData
            ]);

            if (!$response->successful()) {
                return response()->json(['status' => false, 'message' => 'Gagal mendapatkan data dari provider.']);
            }

            $services = data_get($response->json(), $config->parse_response->looping) ?? $response->json();
            if (!is_array($services)) {
                return response()->json(['status' => false, 'message' => 'Format data tidak valid.']);
            }

            $parseResponse = $config->parse_response;
            $profitSettings = $config->profit_settings ?? null;
            $parseTexts = isset($config->parse_text->name) ? collect($config->parse_text->name) : collect();

            $result = [];
            foreach ($services as $svc) {
                $serviceId = data_get($svc, $parseResponse->id);
                $category = data_get($svc, $parseResponse->category);
                $name = data_get($svc, $parseResponse->name);
                $rawPrice = data_get($svc, $parseResponse->price);
                // Kontrak sync (ProviderServicesFetcher::fetch): original = raw / usd_rate locale provider, tanpa pembulatan.
                $originalPrice = $rawPrice / $kurs;
                $min = data_get($svc, $parseResponse->min);
                $max = data_get($svc, $parseResponse->max);
                $description = isset($parseResponse->description) ? data_get($svc, $parseResponse->description) : '';
                $type = isset($parseResponse->type) ? data_get($svc, $parseResponse->type) : 'primary';
                $isRefill = isset($parseResponse->is_refill_support) ? data_get($svc, $parseResponse->is_refill_support) : '0';
                $isCancel = isset($parseResponse->is_cancel_support) ? data_get($svc, $parseResponse->is_cancel_support) : '0';

                // Apply parse text replacements
                $parseTexts->each(function ($item) use (&$name, &$category, &$description) {
                    $name = str_replace($item->from, $item->to, $name);
                    $category = str_replace($item->from, $item->to, $category);
                    $description = str_replace($item->from, $item->to, $description);
                });

                // Calculate profit — kontrak sync: percentage dihitung dari original, fixed apa adanya, tanpa pembulatan.
                $profit = 0;
                if ($profitSettings) {
                    $profit = $profitSettings->type === 'fixed' ? $profitSettings->amount : ($profitSettings->amount / 100) * $originalPrice;
                }

                $result[] = [
                    'service_id'     => $serviceId,
                    'category'       => $category,
                    'name'           => $name,
                    'original_price' => $originalPrice,
                    'price'          => $originalPrice + $profit,
                    'profit'         => $profit,
                    'min'            => $min,
                    'max'            => $max,
                    'description'    => $description ?? '',
                    'type'           => $this->normalizeType($type),
                    'is_refill'      => filter_var($isRefill, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                    'is_cancel'      => filter_var($isCancel, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                ];
            }

            // Filter by category if provided
            $filterCategory = $request->input('category');
            if ($filterCategory) {
                $result = array_values(array_filter($result, fn($s) => $s['category'] === $filterCategory));
            }

            return response()->json([
                'status'   => true,
                'message'  => 'Berhasil mengambil ' . count($result) . ' layanan.',
                'services' => $result,
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    /**
     * AJAX: Simpan single service
     */
    public function storeService(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        abort_if(!request()->ajax(), 404);

        $request->validate([
            'provider_id'         => 'required|exists:service_providers,id',
            'service_category_id' => 'required|exists:service_categories,id',
            'service_id'          => 'required',
            'name'                => 'required|string|max:255',
            'price'               => 'required|numeric|min:0',
            'original_price'      => 'required|numeric|min:0',
            'profit'              => 'required|numeric|min:0',
            'min'                 => 'required|numeric|min:0',
            'max'                 => 'required|numeric|min:1',
            'description'         => 'nullable|string',
            'type'                => 'nullable|string',
            'is_refill'           => 'nullable',
            'is_cancel'           => 'nullable',
        ]);

        // Check duplicate
        $exists = Service::where('service_provider_id', $request->input('provider_id'))
            ->where('service_provider_service_id', $request->input('service_id'))
            ->exists();

        if ($exists) {
            return response()->json([
                'status'  => false,
                'message' => 'Layanan dengan ID provider ini sudah ada di database.',
            ]);
        }

        $service = Service::create([
            'service_category_id'         => $request->input('service_category_id'),
            'service_provider_id'         => $request->input('provider_id'),
            'service_provider_service_id' => $request->input('service_id'),
            'name'                        => $request->input('name'),
            'original_price'              => $request->input('original_price'),
            'price'                       => $request->input('price'),
            'profit'                      => $request->input('profit'),
            'min'                         => $request->input('min'),
            'max'                         => $request->input('max'),
            'description'                 => $request->input('description', ''),
            'type'                        => $this->normalizeType($request->input('type')),
            'is_refill_support'           => $request->input('is_refill') ? '1' : '0',
            'is_cancel_support'           => $request->input('is_cancel') ? '1' : '0',
            'is_auto_update_price'        => '1',
        ]);

        ServiceUpdate::create([
            'service_id'     => $service->id,
            'type'           => 'added',
            'content_key'    => 'services:updates.description.added',
            'content_params' => (object) [],
        ]);

        AdminActivityLog::create([
            'admin_id'       => auth('admin')->user()->id,
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'content_key'    => 'admin/common:log.create-successful',
            'content_params' => (object) [
                'item' => 'common:labels.service',
                'id'   => $service->id,
            ],
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Layanan #' . $service->id . ' berhasil ditambahkan.',
        ]);
    }

    /**
     * AJAX: Bulk store services
     */
    public function storeBulk(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        abort_if(!request()->ajax(), 404);

        $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'items'       => 'required|array|min:1',
        ]);

        $providerId = $request->input('provider_id');
        $items = $request->input('items');
        $success = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($items as $item) {
            $serviceProviderId = $item['service_id'] ?? '';
            $serviceCategoryId = $item['service_category_id'] ?? 0;
            $name = $item['name'] ?? '';

            // Auto-create category if provider_category provided
            if (!$serviceCategoryId && !empty($item['provider_category'])) {
                $cat = ServiceCategory::firstOrCreate(
                    ['name' => $item['provider_category']],
                    ['slug' => Str::slug($item['provider_category'])]
                );
                $serviceCategoryId = $cat->id;
            }

            if (!$serviceCategoryId || !$serviceProviderId || !$name) {
                $errors++;
                continue;
            }

            // Check duplicate
            if (Service::where('service_provider_id', $providerId)
                ->where('service_provider_service_id', $serviceProviderId)->exists()) {
                $skipped++;
                continue;
            }

            $service = Service::create([
                'service_category_id'         => $serviceCategoryId,
                'service_provider_id'         => $providerId,
                'service_provider_service_id' => $serviceProviderId,
                'name'                        => $name,
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

            if ($service) {
                ServiceUpdate::create([
                    'service_id'     => $service->id,
                    'type'           => 'added',
                    'content_key'    => 'services:updates.description.added',
                    'content_params' => (object) [],
                ]);
                $success++;
            } else {
                $errors++;
            }
        }

        return response()->json([
            'status'  => true,
            'message' => "Bulk selesai: {$success} ditambahkan, {$skipped} dilewati (duplikat), {$errors} gagal.",
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
