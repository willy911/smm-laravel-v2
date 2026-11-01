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

declare(strict_types=1);

namespace App\Enums\Admin;

use BenSampo\Enum\Enum;

final class Admin extends Enum
{
    const ARRAY_ENABLED_COLUMN_NAME_SWITCH = ['status'];
    const ARRAY_ENABLED_COLUMN_VALUE_SWITCH = ['1', '0'];

    const STATUS_ACTIVE   = '1';
    const STATUS_INACTIVE = '0';

    const ARRAY_STATUS_KEYS = [
        SELF::STATUS_ACTIVE,
        SELF::STATUS_INACTIVE
    ];

    const ARRAY_STATUS_LABELS = [
        SELF::STATUS_ACTIVE   => 'Aktif',
        SELF::STATUS_INACTIVE => 'Nonaktif',
    ];

    const ARRAY_STATUS_CLASSES = [
        SELF::STATUS_ACTIVE   => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_ACTIVE],
            'icon'  => 'mdi mdi-check-circle-outline',
            'color' => 'green-500'
        ],
        SELF::STATUS_INACTIVE => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_INACTIVE],
            'icon'  => 'mdi mdi-close-circle-outline',
            'color' => 'red-500'
        ],
    ];
}
