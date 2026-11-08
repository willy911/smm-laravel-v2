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

class FetchServiceMassalController extends Controller
{
    public function index()
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        return inertia('admin/service/fetch/massal', [
            'pageProps' => [
                'serviceProviders' => $this->serviceProviderOptions(),
            ]
        ]);
    }

    /**
     * Import ALL services from provider, auto-create categories
     */
    public function processImport(Request $request)
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
        $kurs = ProviderServicesFetcher::resolveKurs($provider);

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

            $inserted = 0;
            $updated = 0;

            foreach ($services as $svc) {
                $category = data_get($svc, $parseResponse->category);

                // Auto-create category
                $localCategory = ServiceCategory::firstOrCreate(
                    ['name' => $category ?? 'Uncategorized'],
                    ['slug' => Str::slug($category ?? 'uncategorized')]
                );

                $serviceId = data_get($svc, $parseResponse->id);
                $rawPrice = data_get($svc, $parseResponse->price);
                // Kontrak sync (ProviderServicesFetcher::fetch): original = raw / usd_rate locale provider, tanpa pembulatan.
                $originalPrice = $rawPrice / $kurs;
                $profit = $profitType === 'percentage' ? ($profitValue / 100) * $originalPrice : $profitValue;
                $name = data_get($svc, $parseResponse->name);
                $min = data_get($svc, $parseResponse->min);
                $max = data_get($svc, $parseResponse->max);
                $description = isset($parseResponse->description) ? data_get($svc, $parseResponse->description) : '';
                $type = isset($parseResponse->type) ? data_get($svc, $parseResponse->type) : 'primary';
                $isRefill = isset($parseResponse->is_refill_support) ? data_get($svc, $parseResponse->is_refill_support) : '0';
                $isCancel = isset($parseResponse->is_cancel_support) ? data_get($svc, $parseResponse->is_cancel_support) : '0';

                $parseTexts->each(function ($item) use (&$name, &$description) {
                    $name = str_replace($item->from, $item->to, $name);
                    $description = str_replace($item->from, $item->to, $description ?? '');
                });

                if (isset($config->parse_text->type) && $type !== 'primary') {
                    $key = array_search($type, get_object_vars($config->parse_text->type));
                    if ($key) $type = $key;
                }

                $existing = Service::where('service_provider_id', $provider->id)
                    ->where('service_provider_service_id', $serviceId)->first();

                if ($existing) {
                    $previousPrice = (float) $existing->price;
                    $newPrice = $originalPrice + $profit;
                    $existing->update([
                        'original_price' => $originalPrice, 'price' => $newPrice,
                        'profit' => $profit, 'min' => $min, 'max' => $max,
                        'is_auto_update_price' => '1',
                    ]);
                    if ($previousPrice != $newPrice) {
                        ServiceUpdate::create([
                            'service_id'     => $existing->id,
                            'type'           => $newPrice > $previousPrice ? 'price_increased' : 'price_decreased',
                            'content_key'    => $newPrice > $previousPrice
                                ? 'services:updates.description.price-increased'
                                : 'services:updates.description.price-decreased',
                            'content_params' => (object) [
                                'from' => $previousPrice,
                                'to'   => $newPrice,
                                'type' => 'currency',
                            ],
                        ]);
                    }
                    $updated++;
                } else {
                    $newService = Service::create([
                        'service_category_id'         => $localCategory->id,
                        'service_provider_id'         => $provider->id,
                        'service_provider_service_id' => $serviceId,
                        'name'                        => $name,
                        'original_price'              => $originalPrice,
                        'price'                       => $originalPrice + $profit,
                        'profit'                      => $profit,
                        'min'                         => $min,
                        'max'                         => $max,
                        'description'                 => $description ?? '',
                        'type'                        => $this->normalizeType($type),
                        'is_refill_support'           => filter_var($isRefill, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                        'is_cancel_support'           => filter_var($isCancel, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
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
                    'item' => 'common:labels.service',
                    'id'   => "Massal: {$inserted} ditambahkan, {$updated} diupdate",
                ],
            ]);

            return response()->json([
                'status'  => true,
                'message' => "Selesai: {$inserted} ditambahkan, {$updated} diupdate.",
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Gagal: ' . $e->getMessage()]);
        }
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
