<?php

declare(strict_types=1);

namespace App\Enums\Service;

use BenSampo\Enum\Enum;

final class ServiceUpdate extends Enum
{
    const ARRAY_ENABLED_COLUMN_NAME_SWITCH = ['status'];
    const ARRAY_ENABLED_COLUMN_VALUE_SWITCH = ['active', 'disabled'];

    const TYPE_PRICE_INCREASED = 'price_increased';
    const TYPE_PRICE_DECREASED = 'price_decreased';
    const TYPE_ENABLED         = 'enabled';
    const TYPE_DISABLED        = 'disabled';
    const TYPE_ADDED           = 'added';
    const TYPE_DELETED         = 'deleted';
    const TYPE_UPDATED         = 'updated';

    const ARRAY_TYPE_KEYS = [
        SELF::TYPE_PRICE_INCREASED,
        SELF::TYPE_PRICE_DECREASED,
        SELF::TYPE_ENABLED,
        SELF::TYPE_DISABLED,
        SELF::TYPE_ADDED,
        SELF::TYPE_DELETED,
        SELF::TYPE_UPDATED,
    ];

    const ARRAY_TYPE_LABELS = [
        SELF::TYPE_PRICE_INCREASED  => 'Harga Naik',
        SELF::TYPE_PRICE_DECREASED  => 'Harga Turun',
        SELF::TYPE_ENABLED          => 'Diaktifkan',
        SELF::TYPE_DISABLED         => 'Dinonaktifkan',
        SELF::TYPE_ADDED            => 'Ditambahkan',
        SELF::TYPE_DELETED          => 'Dihapus',
        SELF::TYPE_UPDATED          => 'Diperbarui',
    ];

    const ARRAY_TYPE_CLASSES = [
        SELF::TYPE_PRICE_INCREASED   => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_PRICE_INCREASED],
            'icon'  => 'CircleArrowUp02Icon',
            'color' => 'yellow-500'
        ],
        SELF::TYPE_PRICE_DECREASED   => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_PRICE_DECREASED],
            'icon'  => 'CircleArrowDown02Icon',
            'color' => 'primary'
        ],
        SELF::TYPE_ENABLED => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_ENABLED],
            'icon'  => 'CheckmarkCircle02Icon',
            'color' => 'green-500'
        ],
        SELF::TYPE_DISABLED => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_DISABLED],
            'icon'  => 'UnavailableIcon',
            'color' => 'red-500'
        ],
        SELF::TYPE_ADDED => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_ADDED],
            'icon'  => 'AddCircleIcon',
            'color' => 'green-500'
        ],
        SELF::TYPE_DELETED => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_DELETED],
            'icon'  => 'CancelCircleIcon',
            'color' => 'red-500'
        ],
        SELF::TYPE_UPDATED => [
            'label' => SELF::ARRAY_TYPE_LABELS[SELF::TYPE_UPDATED],
            'icon'  => 'InformationCircleIcon',
            'color' => 'green-500'
        ],
    ];
}
