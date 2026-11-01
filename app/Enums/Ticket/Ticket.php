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

declare(strict_types=1);

namespace App\Enums\Ticket;

use BenSampo\Enum\Enum;

final class Ticket extends Enum
{
    const ARRAY_ENABLED_COLUMN_NAME_SWITCH = ['status'];
    const ARRAY_ENABLED_COLUMN_VALUE_SWITCH = ['closed'];

    const STATUS_OPEN         = 'open';
    const STATUS_ANSWERED     = 'answered';
    const STATUS_USER_REPLIED = 'user_replied';
    const STATUS_CLOSED       = 'closed';

    const ARRAY_STATUS_KEYS = [
        SELF::STATUS_OPEN,
        SELF::STATUS_ANSWERED,
        SELF::STATUS_USER_REPLIED,
        SELF::STATUS_CLOSED
    ];

    const ARRAY_STATUS_LABELS = [
        SELF::STATUS_OPEN         => 'Open',
        SELF::STATUS_ANSWERED     => 'Answered',
        SELF::STATUS_USER_REPLIED => 'User Replied',
        SELF::STATUS_CLOSED       => 'Closed'
    ];

    const ARRAY_STATUS_CLASSES = [
        SELF::STATUS_OPEN   => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_OPEN],
            'icon'  => 'mdi mdi-information-outline',
            'color' => 'cyan-500'
        ],
        SELF::STATUS_ANSWERED   => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_ANSWERED],
            'icon'  => 'mdi mdi-check-circle-outline',
            'color' => 'green-500'
        ],
        SELF::STATUS_USER_REPLIED => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_USER_REPLIED],
            'icon'  => 'mdi mdi-check-circle-outline',
            'color' => 'blue-500'
        ],
        SELF::STATUS_CLOSED => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_CLOSED],
            'icon'  => 'mdi mdi-close-circle-outline',
            'color' => 'red-500'
        ],
    ];

    const DEPARTMENT_ORDER   = 'order';
    const DEPARTMENT_DEPOSIT = 'deposit';
    const DEPARTMENT_OTHER   = 'other';

    const ARRAY_DEPARTMENT_KEYS = [
        SELF::DEPARTMENT_ORDER,
        SELF::DEPARTMENT_DEPOSIT,
        SELF::DEPARTMENT_OTHER,
    ];

    const ARRAY_DEPARTMENT_LABELS = [
        SELF::DEPARTMENT_ORDER   => 'Pesanan',
        SELF::DEPARTMENT_DEPOSIT => 'Deposit',
        SELF::DEPARTMENT_OTHER   => 'Lainnya',
    ];
}
