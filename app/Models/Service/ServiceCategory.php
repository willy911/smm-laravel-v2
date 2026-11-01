<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Models\Service;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCategory extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = [
        'status',
        'sort_number',
        'updated_at',
        'deleted_at',
    ];
    protected $casts = [
        'profit_configs' => 'object',
    ];

    /**
     * Kategori TANPA grup membuat endpoint kategori AJAX kosong
     * (halaman /orders/create jadi tidak bisa memuat kategori).
     * Pastikan setiap kategori baru selalu punya grup: bila dibuat
     * tanpa service_category_group_id (mis. auto-create dari fetch
     * layanan provider), tebak dari nama kategori.
     */
    protected static function booted(): void
    {
        static::creating(function (ServiceCategory $category) {
            if (empty($category->service_category_group_id)) {
                $category->service_category_group_id = self::inferGroupIdFromName($category->name);
            }
        });
    }

    /**
     * Tebak id grup dari nama kategori berdasarkan kata kunci platform.
     * Fallback: grup "Other". Return null bila grup tidak ditemukan.
     */
    public static function inferGroupIdFromName(?string $name): ?int
    {
        $name = mb_strtolower(trim((string) $name));
        if ($name === '') {
            return null;
        }

        $keywordToGroupName = [
            'instagram'      => 'Instagram',
            'facebook'       => 'Facebook',
            'youtube'        => 'YouTube',
            'twitter'        => 'X (Twitter)',
            'tiktok'         => 'Tiktok',
            'tik tok'        => 'Tiktok',
            'telegram'       => 'Telegram',
            'spotify'        => 'Spotify',
            'linkedin'       => 'Linkedin',
            'google'         => 'Google',
            'discord'        => 'Discord',
            'snapchat'       => 'Snapchat',
            'threads'        => 'Threads',
            'shopee'         => 'Shopee',
            'website traffic' => 'Website Traffic',
        ];

        static $groupIdCache = [];

        foreach ($keywordToGroupName as $keyword => $groupName) {
            if (str_contains($name, $keyword)) {
                if (!array_key_exists($groupName, $groupIdCache)) {
                    $groupIdCache[$groupName] = ServiceCategoryGroup::where('name', $groupName)->value('id');
                }
                return $groupIdCache[$groupName];
            }
        }

        // Tidak cocok platform manapun (mis. WhatsApp, Kick) → grup Other.
        if (!array_key_exists('Other', $groupIdCache)) {
            $groupIdCache['Other'] = ServiceCategoryGroup::where('name', 'Other')->value('id');
        }
        return $groupIdCache['Other'];
    }

    public function serviceCategoryGroup()
    {
        return $this->belongsTo('App\Models\Service\ServiceCategoryGroup');
    }

    public function services()
    {
        return $this->hasMany('App\Models\Service\Service');
    }
}
