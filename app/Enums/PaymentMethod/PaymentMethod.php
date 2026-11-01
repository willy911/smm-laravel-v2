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

namespace App\Enums\PaymentMethod;

use BenSampo\Enum\Enum;

final class PaymentMethod extends Enum
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

    const TYPE_TRANSFER_BANK = 'transfer_bank';
    const TYPE_VA            = 'virtual_account';
    const TYPE_EWALLET       = 'e_wallet';
    const TYPE_QRIS          = 'qris';
    const TYPE_CS            = 'convenience_store';
    const TYPE_CRYPTO        = 'crypto';
    const TYPE_OTHER         = 'other';

    const ARRAY_TYPE_KEYS = [
        SELF::TYPE_TRANSFER_BANK,
        SELF::TYPE_VA,
        SELF::TYPE_EWALLET,
        SELF::TYPE_QRIS,
        SELF::TYPE_CS,
        SELF::TYPE_CRYPTO,
        SELF::TYPE_OTHER,
    ];

    const ARRAY_TYPE_LABELS = [
        SELF::TYPE_TRANSFER_BANK   => 'Transfer Bank',
        SELF::TYPE_VA => 'Virtual Account',
        SELF::TYPE_EWALLET => 'E-Wallet',
        SELF::TYPE_QRIS => 'QRIS',
        SELF::TYPE_CS => 'Convenience Store',
        SELF::TYPE_CRYPTO => 'Crypto',
        SELF::TYPE_OTHER => 'Other',
    ];
}
