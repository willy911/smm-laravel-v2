<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott
| * Whatsapp : https://wa.me/6285349680016
| * Telegram : https://t.me/jhonroott
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Cronjob;

use App\Http\Controllers\Controller;
use App\Models\MobileNotification;

class MobileNotificationController extends Controller
{
    public function update()
    {
        // Skema DB `smm` (wuzzuser) tidak punya kolom is_expired ->
        // semantik kedaluwarsa: hapus notifikasi is_used=0 yang dibuat sebelum hari ini.
        $deleted = MobileNotification::whereDate('created_at', '<', date('Y-m-d'))
            ->where('is_used', '0')
            ->delete();

        if ($deleted == 0) {
            return response('Tidak ada mutasi.', 200)->header('Content-Type', 'text/plain');
        }

        return response($deleted . ' mutasi kedaluwarsa dihapus.', 200)->header('Content-Type', 'text/plain');
    }
}
