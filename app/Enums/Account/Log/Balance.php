<?php

declare(strict_types=1);

namespace App\Enums\Account\Log;

use BenSampo\Enum\Enum;

final class Balance extends Enum
{
    const TYPE_CREDIT = 'credit';
    const TYPE_DEBIT  = 'debit';

    const ARRAY_TYPE_KEYS = [
        SELF::TYPE_CREDIT,
        SELF::TYPE_DEBIT
    ];

    const ARRAY_TYPE_LABELS = [
        SELF::TYPE_CREDIT => 'labels.credit',
        SELF::TYPE_DEBIT  => 'labels.debit',
    ];

    const ARRAY_TYPE_CLASSES = [
        SELF::TYPE_CREDIT   => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_CREDIT],
            'icon'  => 'mdi mdi-plus-circle-outline',
            'color' => 'green-500'
        ],
        SELF::TYPE_DEBIT => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_DEBIT],
            'icon'  => 'mdi mdi-minus-circle-outline',
            'color' => 'red-500'
        ],
    ];

    const CATEGORY_ORDER   = 'order';
    const CATEGORY_DEPOSIT = 'deposit';
    const CATEGORY_COMMISSION = 'commission';
    const CATEGORY_OTHER   = 'other';

    const ARRAY_CATEGORY_KEYS = [
        SELF::CATEGORY_ORDER,
        SELF::CATEGORY_DEPOSIT,
        SELF::CATEGORY_COMMISSION,
        SELF::CATEGORY_OTHER,
    ];

    const ARRAY_CATEGORY_LABELS = [
        SELF::CATEGORY_ORDER    => 'labels.order',
        SELF::CATEGORY_DEPOSIT  => 'labels.deposit',
        SELF::CATEGORY_COMMISSION  => 'labels.commission',
        SELF::CATEGORY_OTHER    => 'labels.other',
    ];
}
