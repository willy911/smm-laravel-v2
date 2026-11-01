<?php

namespace App\Http\Controllers\Admin\Website;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Config;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ConfigurationController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        return inertia('admin/website/configs/index', [
            'pageProps' => [
                'configs' => website_config('all')
            ]
        ]);
    }

    public function update(WebsiteConfigurationRequest $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);

        try {
            return $this->persistConfiguration($request);
        } catch (\RuntimeException $e) {
            report($e);

            return redirect()->back()->with('responseError', $e->getMessage());
        }
    }

    /**
     * Unggah file ke disk `r2` dan PASTIKAN benar-benar berhasil.
     *
     * Disk `r2` memakai 'throw' => false, sehingga kegagalan (kredensial salah,
     * bucket tidak ada, endpoint tidak bisa dihubungi) hanya mengembalikan `false`
     * tanpa exception. Tanpa pengecekan ini, nama file tetap tersimpan di database
     * dan admin melihat toast "berhasil" padahal gambarnya tidak pernah terunggah.
     */
    private function uploadToR2(string $directory, $file, string $filename): void
    {
        $uploaded = false;

        try {
            $uploaded = (bool) Storage::disk('r2')->putFileAs($directory, $file, $filename);
        } catch (\Throwable $e) {
            report($e);
        }

        if (! $uploaded) {
            throw new \RuntimeException(
                'Gagal mengunggah berkas ke storage. Periksa konfigurasi R2 pada .env '
                .'(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET, AWS_ENDPOINT).'
            );
        }
    }

    private function persistConfiguration(WebsiteConfigurationRequest $request)
    {
        $credentials = [
            'website'       => $request->input('website'),
            'smtp'          => $request->input('smtp', website_config('smtp')),
            'prefix'        => $request->input('prefix', website_config('prefix')),
            'affiliate'        => $request->input('affiliate', website_config('affiliate')),
            'third_party_plugin'        => $request->input('third_party_plugin', website_config('third_party_plugin')),
            'payment_gateway'        => $request->input('payment_gateway', website_config('payment_gateway')),
            'social'        => $request->input('social', website_config('social')),
            'menu'     => $request->input('menu'),
            'reviews'       => $request->input('reviews') ?: [],
            'order_info'    => $request->input('order_info'),
            'order_example_target'    => $request->input('order_example_target'),
            'banner'        => [],
            'theme'        => [
                'light' => [
                    'primary' =>  $request->input('theme.light.primary'),
                    'ring' =>  $request->input('theme.light.primary'),
                    'sidebar-ring' =>  $request->input('theme.light.primary'),
                ],
                'dark' => [
                    'primary' =>  $request->input('theme.light.primary'),
                    'ring' =>  $request->input('theme.light.primary'),
                    'sidebar-ring' =>  $request->input('theme.light.primary'),
                ]
            ],
        ];
        $bannerInputs = $request->input('banner', []);

        // 2. Loop melalui input yang ada dari frontend
        foreach ($bannerInputs as $key => $item) {
            // Ambil link yang dikirim (jika tidak ada, default ke string kosong)
            $link = isset($item['link']) ? $item['link'] : '';

            // Default nama file diambil dari data lama (jika item['file'] adalah string nama file)
            $filename = (isset($item['file']) && is_string($item['file'])) ? $item['file'] : null;

            // 3. Cek apakah di indeks ($key) ini, user mengupload FILE BARU
            // Seringkali di Laravel, struktur file array menjadi: $request->file('banner.0.file') atau $request->file('banner')[$key]['file']
            if ($request->hasFile("banner.{$key}.file")) {
                $file = $request->file("banner.{$key}.file");

                // Buat nama file unik baru (tambahkan $key atau microtime agar jika upload barengan nama file tidak tabrakan)
                $filename = 'banner-' . time() . '-' . $key . '.' . $file->getClientOriginalExtension();

                // Simpan file ke Cloud Storage / R2
                $this->uploadToR2('website-banner', $file, $filename);
            }

            // 4. Masukkan ke credentials HANYA JIKA ada file-nya (baik file lama maupun file baru)
            if ($filename) {
                $credentials['banner'][] = [
                    'file' => $filename,
                    'link' => $link
                ];
            }
        }
        if ($request->file('website.logo_lg_light')) {
            $file = $request->file('website.logo_lg_light');
            $filename = 'logo-lg-light-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website', $file, $filename);
            $credentials['website']['logo_lg_light'] = $filename;
        } else {
            $credentials['website']['logo_lg_light'] =  website_config()->logo_lg_light;
        }
        if ($request->file('website.logo_lg_dark')) {
            $file = $request->file('website.logo_lg_dark');
            $filename = 'logo-lg-dark-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website', $file, $filename);
            $credentials['website']['logo_lg_dark'] = $filename;
        } else {
            $credentials['website']['logo_lg_dark'] =  website_config()->logo_lg_dark;
        }
        if ($request->file('website.logo_sm_light')) {
            $file = $request->file('website.logo_sm_light');
            $filename = 'logo-sm-light-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website', $file, $filename);
            $credentials['website']['logo_sm_light'] = $filename;
        } else {
            $credentials['website']['logo_sm_light'] =  website_config()->logo_sm_light;
        }
        if ($request->file('website.logo_sm_dark')) {
            $file = $request->file('website.logo_sm_dark');
            $filename = 'logo-sm-dark-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website', $file, $filename);
            $credentials['website']['logo_sm_dark'] = $filename;
        } else {
            $credentials['website']['logo_sm_dark'] =  website_config()->logo_sm_dark;
        }
        if ($request->file('website.icon')) {
            $file = $request->file('website.icon');
            $filename = 'favicon-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website', $file, $filename);
            $credentials['website']['icon'] = $filename;
        } else {
            $credentials['website']['icon'] =  website_config()->icon;
        }
        if ($request->file('website.meta_image')) {
            $file = $request->file('website.meta_image');
            $filename = 'meta_image-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website', $file, $filename);
            $credentials['website']['meta_image'] = $filename;
        } else {
            $credentials['website']['meta_image'] =  website_config()->meta_image;
        }
        if ($request->file('website.default_news_banner')) {
            $file = $request->file('website.default_news_banner');
            $filename = 'default-news-banner-' . time() . '.' . $file->getClientOriginalExtension();
            $this->uploadToR2('website-news', $file, $filename);
            $credentials['website']['default_news_banner'] = $filename;
        } else {
            $credentials['website']['default_news_banner'] =  website_config()->default_news_banner;
        }
        foreach ($credentials as $key => $item) {
            if ($websiteConfig = Config::where('key', $key)->first()) $websiteConfig->update([
                'value' => json_encode($item)
            ]);
        }
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'        => auth('admin')->user()->id,
            'ip_address'      => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.update-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.configs',
                'id' => null,
            ],
        ]);
        return to_route('admin.websites.configs.index')->with('responseSuccess', 'Situs - Konfigurasi berhasil diperbarui.');
    }

    public function destroy($columnKey, $columnValue)
    {
        $websiteConfigurations = Config::where('key', $columnKey)->first();

        if (!$websiteConfigurations) {
            return response()->json([
                'status'  => false,
                'message' => 'Konfigurasi tidak ditemukan.'
            ], 404);
        }

        $rows = [];
        $currentData = json_decode($websiteConfigurations->value, true) ?: [];

        if ($columnKey == 'website') {
            foreach ($currentData as $key => $item) {
                $rows[$key] = $item;
                if ($key == $columnValue) {
                    $rows[$key] = '';
                    Storage::disk('r2')->delete('website/' . $item);
                }
            }
        }

        if (in_array($columnKey, ['banner'])) {
            $banners = [];

            foreach ($currentData as $key => $item) {
                $bannerItem = is_string($item) ? ['file' => $item, 'link' => ''] : $item;

                $filename = isset($bannerItem['file']) ? $bannerItem['file'] : '';

                if ($filename === $columnValue) {
                    Storage::disk('r2')->delete('website-banner/' . $filename);
                } else {
                    $banners[] = $bannerItem;
                }
            }

            $rows = array_values($banners);
        }

        $websiteConfigurations->update([
            'value' => json_encode($rows)
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Konfigurasi Website berhasil diperbarui.'
        ]);
    }
}

class WebsiteConfigurationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->user()->group->is_primary;
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'website.name' => 'required',
            'website.sub_name' => 'required',
            'website.about' => 'required',
            'website.meta_keywords' => 'required',
            'website.meta_description' => 'required',
            'website.logo_lg_light' => [
                ...$this->isPrecognitive() ? [] : ($request->file('website.logo_lg_light') ? ['mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'] : []),
            ],
            'website.logo_lg_dark' => [
                ...$this->isPrecognitive() ? [] : ($request->file('website.logo_lg_dark') ? ['mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'] : []),
            ],
            'website.logo_sm_light' => [
                ...$this->isPrecognitive() ? [] : ($request->file('website.logo_sm_light') ? ['mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'] : []),
            ],
            'website.logo_sm_dark' => [
                ...$this->isPrecognitive() ? [] : ($request->file('website.logo_sm_dark') ? ['mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'] : []),
            ],
            'website.icon' => [
                ...$this->isPrecognitive() ? [] : ($request->file('website.icon') ? ['mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'] : []),
            ],
            'website.meta_image' => [
                ...$this->isPrecognitive() ? [] : ($request->file('website.meta_image') ? ['mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'] : []),
            ],
            'payment_gateway.flazpay.merchant_id' => ['nullable', 'string', 'max:255'],
            'payment_gateway.flazpay.client_id' => ['nullable', 'string', 'max:255'],
            'payment_gateway.flazpay.client_secret' => ['nullable', 'string', 'max:255'],
            'payment_gateway.flazpay.prefix_callback_url' => ['nullable', 'string', 'max:255'],
            // 'prefix.admin_url' => 'required',
            // 'smtp.host' => 'required',
            // 'smtp.encryption' => ['required', 'in:SSL,TLS'],
            // 'smtp.port' => 'required',
            // 'smtp.from' => 'required',
            // 'smtp.username' => 'required',
            // 'smtp.password' => 'required',
            // 'tinymce.api_key' => 'required',
            // 'contact.address'     => ['nullable', 'url:https'],
            // 'contact.email'     => ['nullable', 'email:rfc,dns'],
            // 'reviews.*.full_name' => ['required'],
            // 'reviews.*.job'       => ['required'],
            // 'reviews.*.reviews'   => ['required'],
        ];
    }

    public function attributes()
    {
        return [
            'website.name'   => 'Nama',
            'website.sub_name'   => 'Sub Nama',
            'website.logo_light'   => 'Logo (Terang)',
            'website.logo_dark'   => 'Logo (Gelap)',
            'website.icon'   => 'Favicon',
            'website.about' => 'Tentang',
            'website.meta_keywords' => 'Meta Tag (Kata Kunci/Keyword)',
            'website.meta_description' => 'Meta Tag (Deskripsi/Description)',
            'website.meta_image' => 'Meta Tag (Gambar/Image)',
            'prefix.admin_url' => 'Admin',
            'smtp.host' => 'Host',
            'smtp.encryption' => 'Encryption',
            'smtp.port' => 'Port',
            'smtp.from' => 'From',
            'smtp.username' => 'Username',
            'smtp.password' => 'Password',
            'tinymce.api_key' => 'API Key',
            'contact.address'     => 'Alamat',
            'contact.email'     => 'Email',
            'reviews.*.full_name' => 'Nama Lengkap',
            'reviews.*.job'       => 'Pekerjaan',
            'reviews.*.reviews'   => 'Ulasan',
        ];
    }
}

