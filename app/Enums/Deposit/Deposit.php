<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot | v1.0
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

declare(strict_types=1);

namespace App\Enums\Deposit;

use BenSampo\Enum\Enum;

final class Deposit extends Enum
{
    const ARRAY_ENABLED_COLUMN_NAME_SWITCH = ['status'];
    const ARRAY_ENABLED_COLUMN_VALUE_SWITCH = ['canceled', 'success'];

    const STATUS_PENDING   = 'pending';
    const STATUS_SUCCESS = 'success';
    const STATUS_CANCELED = 'canceled';
    const STATUS_EXPIRED = 'expired';

    const ARRAY_STATUS_KEYS = [
        SELF::STATUS_PENDING,
        SELF::STATUS_SUCCESS,
        SELF::STATUS_CANCELED,
        SELF::STATUS_EXPIRED
    ];

    const ARRAY_STATUS_LABELS = [
        SELF::STATUS_PENDING  => 'Pending',
        SELF::STATUS_SUCCESS  => 'Success',
        SELF::STATUS_CANCELED => 'Canceled',
        SELF::STATUS_EXPIRED  => 'Expired'
    ];

    const ARRAY_STATUS_CLASSES = [
        SELF::STATUS_PENDING   => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_PENDING],
            'icon'  => 'mdi mdi-information-outline',
            'color' => 'yellow-500',
            'information' => 'Harap selesaikan pembayaran.'
        ],
        SELF::STATUS_SUCCESS   => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_SUCCESS],
            'icon'  => 'mdi mdi-check-circle-outline',
            'color' => 'green-500',
            'information' => 'Pembayaran berhasil.'
        ],
        SELF::STATUS_CANCELED => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_CANCELED],
            'icon'  => 'mdi mdi-close-circle-outline',
            'color' => 'red-500',
            'information' => 'Deposit dibatalkan.'
        ],
        SELF::STATUS_EXPIRED => [
            'label' => SELF::ARRAY_STATUS_LABELS[SELF::STATUS_EXPIRED],
            'icon'  => 'mdi mdi-close-circle-outline',
            'color' => 'red-500',
            'information' => 'Deposit kadaluwarsa.'
        ],
    ];
}
