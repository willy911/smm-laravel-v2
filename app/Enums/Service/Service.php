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

namespace App\Enums\Service;

use BenSampo\Enum\Enum;

final class Service extends Enum
{
    const ARRAY_ENABLED_COLUMN_NAME_SWITCH = ['status'];
    const ARRAY_ENABLED_COLUMN_VALUE_SWITCH = ['1', '0'];

    const TYPE_PRIMARY                 = 'primary';
    const TYPE_PACKAGE                 = 'package';
    const TYPE_CUSTOM_COMMENTS         = 'custom_comments';
    const TYPE_CUSTOM_COMMENTS_PACKAGE = 'custom_comments_package';
    const TYPE_COMMENT_LIKES           = 'comment_likes';
    const TYPE_COMMENT_REPLIES         = 'comment_replies';
    const TYPE_MENTIONS_HASHTAG        = 'mentions_hashtag';
    const TYPE_MENTIONS_WITH_HASHTAGS  = 'mentions_with_hashtags';
    const TYPE_MENTIONS_CUSTOM_LIST    = 'mentions_custom_list';
    const TYPE_MENTIONS_USER_FOLLOWERS = 'mentions_user_followers';
    const TYPE_MENTIONS_MEDIA_LIKERS   = 'mentions_media_likers';
    const TYPE_POLL                    = 'poll';
    const TYPE_SUBSCRIPTIONS           = 'subscriptions';

    const ARRAY_TYPE_KEYS = [
        SELF::TYPE_PRIMARY,
        SELF::TYPE_PACKAGE,
        SELF::TYPE_CUSTOM_COMMENTS,
        SELF::TYPE_CUSTOM_COMMENTS_PACKAGE,
        SELF::TYPE_COMMENT_LIKES,
        SELF::TYPE_COMMENT_REPLIES,
        SELF::TYPE_MENTIONS_HASHTAG,
        SELF::TYPE_MENTIONS_WITH_HASHTAGS,
        SELF::TYPE_MENTIONS_CUSTOM_LIST,
        SELF::TYPE_MENTIONS_USER_FOLLOWERS,
        SELF::TYPE_MENTIONS_MEDIA_LIKERS,
        SELF::TYPE_POLL,
        SELF::TYPE_SUBSCRIPTIONS
    ];

    const ARRAY_TYPE_LABELS = [
        SELF::TYPE_PRIMARY                 => 'Primary',
        SELF::TYPE_PACKAGE                 => 'Package',
        SELF::TYPE_CUSTOM_COMMENTS         => 'Custom Comments',
        SELF::TYPE_CUSTOM_COMMENTS_PACKAGE => 'Custom Comments Package',
        SELF::TYPE_COMMENT_LIKES           => 'Comment Likes',
        SELF::TYPE_COMMENT_REPLIES         => 'Comment Replies',
        SELF::TYPE_MENTIONS_HASHTAG        => 'Mentions Hashtag',
        SELF::TYPE_MENTIONS_WITH_HASHTAGS  => 'Mentions With Hashtags',
        SELF::TYPE_MENTIONS_CUSTOM_LIST    => 'Mentions Custom List',
        SELF::TYPE_MENTIONS_USER_FOLLOWERS => 'Mentions User Followers',
        SELF::TYPE_MENTIONS_MEDIA_LIKERS   => 'Mentions Media Likers',
        SELF::TYPE_POLL                    => 'Poll',
        SELF::TYPE_SUBSCRIPTIONS           => 'Subscriptions',
    ];

    const IS_REFILL_SUPPORT_ACTIVE   = '1';
    const IS_REFILL_SUPPORT_INACTIVE = '0';

    const ARRAY_IS_REFILL_SUPPORT_KEYS = [
        SELF::IS_REFILL_SUPPORT_ACTIVE,
        SELF::IS_REFILL_SUPPORT_INACTIVE
    ];

    const ARRAY_IS_REFILL_SUPPORT_LABELS = [
        SELF::IS_REFILL_SUPPORT_ACTIVE   => 'Ya',
        SELF::IS_REFILL_SUPPORT_INACTIVE => 'Tidak',
    ];

    const IS_CANCEL_SUPPORT_ACTIVE   = '1';
    const IS_CANCEL_SUPPORT_INACTIVE = '0';

    const ARRAY_IS_CANCEL_SUPPORT_KEYS = [
        SELF::IS_CANCEL_SUPPORT_ACTIVE,
        SELF::IS_CANCEL_SUPPORT_INACTIVE
    ];

    const ARRAY_IS_CANCEL_SUPPORT_LABELS = [
        SELF::IS_CANCEL_SUPPORT_ACTIVE   => 'Ya',
        SELF::IS_CANCEL_SUPPORT_INACTIVE => 'Tidak',
    ];

    const IS_FAVORITE_ACTIVE   = '1';

    const ARRAY_IS_FAVORITE_KEYS = [
        SELF::IS_FAVORITE_ACTIVE,
    ];

    const ARRAY_IS_FAVORITE_LABELS = [
        SELF::IS_FAVORITE_ACTIVE   => 'Ya',
    ];
}
