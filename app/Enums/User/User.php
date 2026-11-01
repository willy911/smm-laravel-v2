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

namespace App\Enums\User;

use App\Models\User\UserGroup;
use BenSampo\Enum\Enum;

final class User extends Enum
{
    const ARRAY_ENABLED_COLUMN_NAME_SWITCH = ['status', 'user_group_id'];
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

    const LEVEL_MEMBER   = 'member';
    const LEVEL_RESELLER = 'reseller';

    const ARRAY_LEVEL_KEYS = [
        SELF::LEVEL_MEMBER,
        SELF::LEVEL_RESELLER
    ];

    const ARRAY_LEVEL_LABELS = [
        SELF::LEVEL_MEMBER   => 'Member',
        SELF::LEVEL_RESELLER => 'Reseller',
    ];

    const ARRAY_LEVEL_CLASSES = [
        SELF::LEVEL_MEMBER   => [
            'label' => SELF::ARRAY_LEVEL_LABELS[SELF::LEVEL_MEMBER],
            'icon'  => 'mdi mdi-check-circle-outline',
            'color' => 'yellow-500'
        ],
        SELF::LEVEL_RESELLER => [
            'label' => SELF::ARRAY_LEVEL_LABELS[SELF::LEVEL_RESELLER],
            'icon'  => 'mdi mdi-close-circle-outline',
            'color' => 'green-500'
        ],
    ];
}
