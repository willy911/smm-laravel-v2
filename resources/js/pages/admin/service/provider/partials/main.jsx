import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Main({ form }) {
    const { t, i18n } = useTranslation();
    const { locales } = usePage().props;
    const [openLocalePopover, setOpenLocalePopover] = useState(false);
    const recommenderProviders = [
        {
            name: 'Medan Pedia',
            alias: 'MP',
            locale: 'id',
            is_refill_support: true,
            is_cancel_support: false,
            default_parameters: [
                { key: 'api_id', value: '' },
                { key: 'api_key', value: '' },
            ],
            configs: {
                account: {
                    endpoint: 'https://api.medanpedia.co.id/profile',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                    ],
                    parse_response: {
                        balance: 'data.balance',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                username: 'user',
                                full_name: 'user name',
                                email: 'user@domain.com',
                                whatsapp: '081234xxxxx',
                                balance: 0,
                                orders: 0,
                                deposits: 0,
                                joined_at: '2017-01-01',
                            },
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: 'https://api.medanpedia.co.id/services',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: 'data',
                        id: 'id',
                        category: 'category',
                        name: 'name',
                        price: 'price',
                        min: 'min',
                        max: 'max',
                        description: 'description',
                        is_refill_support: 'refill',
                        is_cancel_support: '',
                        refill_days: '',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'default',
                            package: 'package',
                            custom_comments: 'custom_comment',
                            custom_comments_package: 'custom_comments_package',
                            comment_likes: 'comment_likes',
                            comment_replies: 'comment_reply',
                            mentions_hashtag: 'mention_list',
                            mentions_with_hashtags: 'mentions_with_hashtags',
                            mentions_custom_list: 'mention_list',
                            mentions_user_followers: 'mention_follower',
                            mentions_media_likers: 'mention_media',
                            poll: 'poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            msg: 'OK',
                            data: [
                                {
                                    id: 1,
                                    name: 'Instagram Followers HQ',
                                    type: 'default',
                                    category: 'Instagram Followers',
                                    price: 55000,
                                    min: 100,
                                    max: 100000,
                                    refill: 1,
                                    average_time: 'Jumlah pesan rata-rata 1.683. Waktu proses rata-rata 29 menit 43 detik.',
                                    description: 'No drop',
                                },
                                {
                                    id: 3,
                                    name: 'Instagram Likes HQ',
                                    type: 'default',
                                    category: 'Instagram Likes',
                                    price: 15000,
                                    min: 10,
                                    max: 10000,
                                    refill: 0,
                                    average_time: 'Jumlah pesan rata-rata 1.683. Waktu proses rata-rata 29 menit 43 detik.',
                                    description: 'No drop',
                                },
                            ],
                        },
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: 'https://api.medanpedia.co.id/order',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'service', type: 'service_id' },
                        { key: 'target', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'data.id',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            msg: 'Pesanan dengan id #1107 berhasil dibuat.',
                            data: {
                                id: 1107,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: 'https://api.medanpedia.co.id/status',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'ref_id', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                        start_count: 'data.start_count',
                        remains: 'data.remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'in_progress',
                            completed: 'Success',
                            error: 'Error',
                            partial: 'Partial',
                            canceled: 'canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            msg: 'Pesanan ditemukan.',
                            data: {
                                id: 1107,
                                status: 'Processing',
                                charge: 10000,
                                start_count: 10,
                                remains: 90,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: 'https://api.medanpedia.co.id/refill',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'id_order', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'data.id_refill',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            msg: 'Permintaan refill dengan id #123 berhasil dibuat.',
                            data: {
                                id_refill: 123,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: 'https://api.medanpedia.co.id/refill_status',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'id_refill', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Proses',
                            in_progress: 'in_progress',
                            completed: 'Success',
                            error: 'Gagal',
                            rejected: 'rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            msg: 'Refill ditemukan.',
                            data: {
                                id: 1107,
                                status: 'Processing',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'ref_id', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'data.ref_id',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                ref_id: '1',
                            },
                        },
                        null,
                        4,
                    ),
                },
            },
        },
        {
            name: 'Indo Pedia',
            alias: 'IP',
            locale: 'id',
            is_refill_support: true,
            is_cancel_support: true,
            default_parameters: [
                { key: 'api_key', value: '' },
                { key: 'secret_key', value: '' },
            ],
            configs: {
                account: {
                    endpoint: 'https://api.indopedia-smm.net/account/profile',
                    method: 'post',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                    ],
                    parse_response: {
                        balance: 'data.balance',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                username: 'user',
                                full_name: 'user name',
                                email: 'user@domain.com',
                                whatsapp: '081234xxxxx',
                                balance: 0,
                                orders: 0,
                                deposits: 0,
                                joined_at: '2017-01-01',
                            },
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: 'https://api.indopedia-smm.net/services',
                    method: 'post',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: 'data',
                        id: 'id',
                        category: 'category',
                        name: 'name',
                        price: 'price',
                        min: 'min',
                        max: 'max',
                        description: 'description',
                        is_refill_support: 'refill',
                        is_cancel_support: 'cancel',
                        refill_days: 'refill_days',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'primary',
                            package: 'package',
                            custom_comments: 'custom_comments',
                            custom_comments_package: 'custom_comments_package',
                            comment_likes: 'comment_likes',
                            comment_replies: 'comment_replies',
                            mentions_hashtag: 'mentions_hashtag',
                            mentions_with_hashtags: 'mentions_with_hashtags',
                            mentions_custom_list: 'mentions_custom_list',
                            mentions_user_followers: 'mentions_user_followers',
                            mentions_media_likers: 'mentions_media_likers',
                            poll: 'poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: [
                                {
                                    id: 1,
                                    type: 'custom_comments',
                                    category: 'Instagram Custom Comments',
                                    name: 'Instagram Custom Comments S1',
                                    price: 10000,
                                    min: 100,
                                    max: 1000,
                                    refill: true,
                                    cancel: true,
                                    refill_days: 30,
                                    description: '-',
                                    avg_quantity: 100,
                                    avg_time_in_seconds: 13580,
                                    avg_time_in_human: '3 jam 46 menit 20 detik',
                                    created_at: '2024-01-01 00:00:01',
                                    updated_at: '2024-01-01 00:01:00',
                                },
                                {
                                    id: 2,
                                    type: 'primary',
                                    category: 'Instagram Followers',
                                    name: 'Instagram Followers S1',
                                    price: 5000,
                                    min: 100,
                                    max: 500,
                                    refill: true,
                                    cancel: false,
                                    refill_days: 30,
                                    description: '-',
                                    avg_quantity: 67,
                                    avg_time_in_seconds: 2407,
                                    avg_time_in_human: '40 menit 7 detik',
                                    created_at: '2024-01-01 00:00:01',
                                    updated_at: '2024-01-01 00:01:00',
                                },
                            ],
                        },
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: 'https://api.indopedia-smm.net/order/create',
                    method: 'post',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'service_id', type: 'service_id' },
                        { key: 'target', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'data.ref_id',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                ref_id: '1',
                                service_id: 1,
                                service_name: 'Service Name',
                                target: 'example_target',
                                quantity: 1000,
                                price: 100,
                                status: 'pending',
                                start_count: 0,
                                remains: 0,
                                initial_balance: 500,
                                final_balance: 400,
                                created_at: '2024-01-01 00:00:01',
                                updated_at: '2024-01-01 00:01:00',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: 'https://api.indopedia-smm.net/order/status',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'ref_id', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                        start_count: 'data.start_count',
                        remains: 'data.remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'pending',
                            processing: 'processing',
                            in_progress: 'in_progress',
                            completed: 'completed',
                            error: 'error',
                            partial: 'partial',
                            canceled: 'canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                success: 'pesanan ditemukan',
                                ref_id: '1',
                                service_id: 1,
                                service_name: 'Service Name',
                                target: 'example_target',
                                quantity: 1000,
                                price: 100,
                                status: 'pending',
                                start_count: 0,
                                remains: 0,
                                initial_balance: 500,
                                final_balance: 400,
                                created_at: '2024-01-01 00:00:01',
                                updated_at: '2024-01-01 00:01:00',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: 'https://api.indopedia-smm.net/order/refill/create',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'ref_id', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'data.ref_id',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                ref_id: '1',
                                status: 'pending',
                                created_at: '2024-04-14 09:15:23',
                                updated_at: '2024-04-14 09:15:23',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: 'https://api.indopedia-smm.net/order/refill/status',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'ref_id', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                    },
                    parse_text: {
                        status: {
                            pending: 'pending',
                            processing: 'processing',
                            in_progress: 'in_progress',
                            completed: 'completed',
                            error: 'error',
                            rejected: 'rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                ref_id: '1',
                                status: 'pending',
                                created_at: '2024-04-14 09:15:23',
                                updated_at: '2024-04-14 09:15:23',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: 'https://api.indopedia-smm.net/order/cancel/create',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'ref_id', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'data.ref_id',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                ref_id: '1',
                            },
                        },
                        null,
                        4,
                    ),
                },
            },
        },
        {
            name: 'Provider SMM',
            alias: 'PS',
            locale: 'id',
            is_refill_support: true,
            is_cancel_support: true,
            default_parameters: [{ key: 'key', value: '' }],
            configs: {
                account: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'balance' },
                    ],
                    parse_response: {
                        balance: 'balance',
                    },
                    example_response: JSON.stringify(
                        {
                            balance: '100.00',
                            currency: 'USD',
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'services' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: '',
                        id: 'service',
                        category: 'category',
                        name: 'name',
                        price: 'rate',
                        min: 'min',
                        max: 'max',
                        description: '',
                        is_refill_support: 'refill',
                        is_cancel_support: 'cancel',
                        refill_days: '',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'Default',
                            package: 'Package',
                            custom_comments: 'Custom Comments',
                            custom_comments_package: 'Custom Comments Package',
                            comment_likes: 'Comment Likes',
                            comment_replies: 'Comment Replies',
                            mentions_hashtag: 'Mentions Hashtag',
                            mentions_with_hashtags: 'Mentions With Hashtags',
                            mentions_custom_list: 'Mentions Custom List',
                            mentions_user_followers: 'Mentions User Followers',
                            mentions_media_likers: 'Mentions Media Likers',
                            poll: 'Poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                service: 1,
                                name: 'Followers',
                                type: 'Default',
                                category: 'First Category',
                                rate: '0.90',
                                min: '50',
                                max: '10000',
                                refill: true,
                                cancel: true,
                            },
                            {
                                service: 2,
                                name: 'Comments',
                                type: 'Custom Comments',
                                category: 'Second Category',
                                rate: '8',
                                min: '10',
                                max: '1500',
                                refill: false,
                                cancel: true,
                            },
                        ],
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'add' },
                        { key: 'service', type: 'service_id' },
                        { key: 'link', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'order',
                    },
                    example_response: JSON.stringify(
                        {
                            order: 123,
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'status' },
                        { key: 'order', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'status',
                        start_count: 'start_count',
                        remains: 'remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Completed',
                            error: 'Error',
                            partial: 'Partial',
                            canceled: 'Canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            start_count: '100',
                            status: 'Completed',
                            remains: '157',
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'refill' },
                        { key: 'order', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'refill',
                    },
                    example_response: JSON.stringify(
                        {
                            refill: '1',
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'refill_status' },
                        { key: 'refill', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'status',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Completed',
                            error: 'Error',
                            rejected: 'Rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: 'Completed',
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: 'https://providersmm.id/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'cancel' },
                        { key: 'orders', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'cancel',
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                order: 9,
                                cancel: {
                                    error: 'Incorrect order ID',
                                },
                            },
                            {
                                order: 2,
                                cancel: 1,
                            },
                        ],
                        null,
                        4,
                    ),
                },
            },
        },
        {
            name: 'Bisnis Panel',
            alias: 'BP',
            locale: 'id',
            is_refill_support: true,
            is_cancel_support: true,
            default_parameters: [
                { key: 'api_id', value: '' },
                { key: 'api_key', value: '' },
                { key: 'secret_key', value: '' },
            ],
            configs: {
                account: {
                    endpoint: '	https://bisnispanel.com/api/profile',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                    ],
                    parse_response: {
                        balance: 'data.balance',
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: {
                                username: 'aditdev.id',
                                balance: 109000,
                            },
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: 'https://bisnispanel.com/api/services',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: 'data',
                        id: 'id',
                        category: 'category_name',
                        name: 'service_name',
                        price: 'price',
                        min: 'min',
                        max: 'max',
                        description: 'description',
                        is_refill_support: 'refill',
                        is_cancel_support: 'cancel',
                        refill_days: '',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'Default',
                            package: 'Package',
                            custom_comments: 'Custom Comments',
                            custom_comments_package: 'Custom Comments Package',
                            comment_likes: 'Comment Likes',
                            comment_replies: 'Comment Replies',
                            mentions_hashtag: 'Mentions Hashtag',
                            mentions_with_hashtags: 'Mentions With Hashtags',
                            mentions_custom_list: 'Mentions Custom List',
                            mentions_user_followers: 'Mentions User Followers',
                            mentions_media_likers: 'Mentions Media Likers',
                            poll: 'Poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: [
                                {
                                    id: 1,
                                    type: 'Default',
                                    category_id: 1,
                                    category_name: 'Instagram Followers',
                                    service_name: 'Instagram Followers 123',
                                    price: 50000,
                                    rate: 1000,
                                    min: 100,
                                    max: 200000,
                                    refill: true,
                                    cancel: true,
                                    description: 'Refill 30 days - INSTANT',
                                },
                            ],
                        },
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: 'https://bisnispanel.com/api/order',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'service', type: 'service_id' },
                        { key: 'target', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'data.id',
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: {
                                id: 12345,
                                price: 23000,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: 'https://bisnispanel.com/api/status',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'id', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                        start_count: 'data.start_count',
                        remains: 'data.remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'pending',
                            processing: 'processing',
                            in_progress: 'in_progress',
                            completed: 'success',
                            error: 'error',
                            partial: 'partial',
                            canceled: 'canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: {
                                id: 12345,
                                price: 23000,
                                status: 'Pending',
                                start_count: 232,
                                remains: 50000,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: 'https://bisnispanel.com/api/refill',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'id', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'data.refill_id',
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: {
                                refill_id: 54321,
                                order_id: 12345,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: 'https://bisnispanel.com/api/status_refill',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'id', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                    },
                    parse_text: {
                        status: {
                            pending: 'pending',
                            processing: 'processing',
                            in_progress: 'in_progress',
                            completed: 'success',
                            error: 'error',
                            rejected: 'rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: {
                                refill_id: 54321,
                                order_id: 12345,
                                status: 'Pending',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: 'https://bisnispanel.com/api/cancel',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'secret_key', type: 'default_parameter' },
                        { key: 'id', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'data.cancel_id',
                    },
                    example_response: JSON.stringify(
                        {
                            response: true,
                            data: {
                                cancel_id: 54321,
                                order_id: 12345,
                            },
                        },
                        null,
                        4,
                    ),
                },
            },
        },
        {
            name: 'Flazpedia',
            alias: 'FP',
            locale: 'id',
            is_refill_support: true,
            is_cancel_support: true,
            default_parameters: [{ key: 'key', value: '' }],
            configs: {
                account: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'balance' },
                    ],
                    parse_response: {
                        balance: 'balance',
                    },
                    example_response: JSON.stringify(
                        {
                            balance: '100.00',
                            currency: 'IDR',
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'services' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: '',
                        id: 'service',
                        category: 'category',
                        name: 'name',
                        price: 'rate',
                        min: 'min',
                        max: 'max',
                        description: '',
                        is_refill_support: 'refill',
                        is_cancel_support: 'cancel',
                        refill_days: '',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'Default',
                            package: 'Package',
                            custom_comments: 'Custom Comments',
                            custom_comments_package: 'Custom Comments Package',
                            comment_likes: 'Comment Likes',
                            comment_replies: 'Comment Replies',
                            mentions_hashtag: 'Mentions Hashtag',
                            mentions_with_hashtags: 'Mentions With Hashtags',
                            mentions_custom_list: 'Mentions Custom List',
                            mentions_user_followers: 'Mentions User Followers',
                            mentions_media_likers: 'Mentions Media Likers',
                            poll: 'Poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                service: 1,
                                name: 'Followers',
                                type: 'Default',
                                category: 'First Category',
                                rate: '0.90',
                                min: '50',
                                max: '10000',
                                refill: true,
                                cancel: true,
                            },
                            {
                                service: 2,
                                name: 'Comments',
                                type: 'Custom Comments',
                                category: 'Second Category',
                                rate: '8',
                                min: '10',
                                max: '1500',
                                refill: false,
                                cancel: true,
                            },
                        ],
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'add' },
                        { key: 'service', type: 'service_id' },
                        { key: 'link', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'order',
                    },
                    example_response: JSON.stringify(
                        {
                            order: 123,
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'status' },
                        { key: 'order', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'status',
                        start_count: 'start_count',
                        remains: 'remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Completed',
                            error: 'Error',
                            partial: 'Partial',
                            canceled: 'Canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            start_count: '100',
                            status: 'Completed',
                            remains: '157',
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'refill' },
                        { key: 'order', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'refill',
                    },
                    example_response: JSON.stringify(
                        {
                            refill: '1',
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'refill_status' },
                        { key: 'refill', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'status',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Completed',
                            error: 'Error',
                            rejected: 'Rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: 'Completed',
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: 'https://flazpedia.com/api/v2',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'key', type: 'default_parameter' },
                        { key: 'action', type: 'custom', value: 'cancel' },
                        { key: 'orders', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'cancel',
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                order: 9,
                                cancel: {
                                    error: 'Incorrect order ID',
                                },
                            },
                            {
                                order: 2,
                                cancel: 1,
                            },
                        ],
                        null,
                        4,
                    ),
                },
            },
        },
    ];

    const quickSetup = (api) => {
        if (api !== form.data.service.provider.quick_setup) {
            const v2Configs = {
                account: {
                    endpoint: '',
                    method: 'post',
                    params: [
                        { key: 'action', type: 'custom', value: 'balance' },
                        { key: 'key', type: 'default_parameter' },
                    ],
                    parse_response: {
                        balance: 'balance',
                    },
                    example_response: JSON.stringify(
                        {
                            balance: '100.00',
                            currency: 'USD',
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: '',
                    method: 'post',
                    params: [
                        { key: 'action', type: 'custom', value: 'services' },
                        { key: 'key', type: 'default_parameter' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: '',
                        id: 'service',
                        category: 'category',
                        name: 'name',
                        price: 'rate',
                        min: 'min',
                        max: 'max',
                        description: '',
                        is_refill_support: 'refill',
                        is_cancel_support: 'cancel',
                        refill_days: '',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'Default',
                            package: 'Package',
                            custom_comments: 'Custom Comments',
                            custom_comments_package: 'Custom Comments Package',
                            comment_likes: 'Comment Likes',
                            comment_replies: 'Comment Replies',
                            mentions_hashtag: 'Mentions Hashtag',
                            mentions_with_hashtags: 'Mentions With Hashtags',
                            mentions_custom_list: 'Mentions Custom List',
                            mentions_user_followers: 'Mentions User Followers',
                            mentions_media_likers: 'Mentions Media Likers',
                            poll: 'Poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                service: 1,
                                name: 'Followers',
                                type: 'Default',
                                category: 'First Category',
                                rate: '0.90',
                                min: '50',
                                max: '10000',
                                refill: true,
                                cancel: true,
                            },
                            {
                                service: 2,
                                name: 'Comments',
                                type: 'Custom Comments',
                                category: 'Second Category',
                                rate: '8',
                                min: '10',
                                max: '1500',
                                refill: false,
                                cancel: true,
                            },
                        ],
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: '',
                    method: 'post',
                    params: [
                        { key: 'action', type: 'custom', value: 'add' },
                        { key: 'key', type: 'default_parameter' },
                        { key: 'service', type: 'service_id' },
                        { key: 'link', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'order',
                    },
                    example_response: JSON.stringify(
                        {
                            order: 123,
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'action', type: 'custom', value: 'status' },
                        { key: 'key', type: 'default_parameter' },
                        { key: 'order', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'status',
                        start_count: 'start_count',
                        remains: 'remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Completed',
                            error: 'Error',
                            partial: 'Partial',
                            canceled: 'Canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            start_count: '100',
                            status: 'Completed',
                            remains: '157',
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'action', type: 'custom', value: 'refill' },
                        { key: 'key', type: 'default_parameter' },
                        { key: 'order', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'refill',
                    },
                    example_response: JSON.stringify(
                        {
                            refill: '1',
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'action', type: 'custom', value: 'refill_status' },
                        { key: 'key', type: 'default_parameter' },
                        { key: 'refill', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'status',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Completed',
                            error: 'Error',
                            rejected: 'Rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: 'Completed',
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'action', type: 'custom', value: 'cancel' },
                        { key: 'key', type: 'default_parameter' },
                        { key: 'orders', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'cancel',
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                order: 9,
                                cancel: {
                                    error: 'Incorrect order ID',
                                },
                            },
                            {
                                order: 2,
                                cancel: 1,
                            },
                        ],
                        null,
                        4,
                    ),
                },
            };

            const smmIndoConfigs = {
                account: {
                    endpoint: '',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                    ],
                    parse_response: {
                        balance: 'data.balance',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                username: 'jhonroot',
                                full_name: 'Jhon Delton',
                                balance: 100000.0,
                            },
                        },
                        null,
                        4,
                    ),
                },
                services: {
                    endpoint: '',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                    ],
                    profit_configs: {
                        type: 'percentage',
                        value: 10,
                        display_value: 10,
                    },
                    parse_response: {
                        looping: 'data',
                        id: 'id',
                        category: 'category',
                        name: 'name',
                        price: 'price',
                        min: 'min',
                        max: 'max',
                        description: 'description',
                        is_refill_support: 'refill',
                        is_cancel_support: 'cancel',
                        refill_days: '',
                        refill_available_in_hours: '',
                        type: 'type',
                    },
                    parse_text: {
                        name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                        type: {
                            primary: 'default',
                            package: 'package',
                            custom_comments: 'custom_comment',
                            custom_comments_package: 'custom_comment_package',
                            comment_likes: 'comment_likes',
                            comment_replies: 'comment_reply',
                            mentions_hashtag: 'mention_hastag',
                            mentions_with_hashtags: 'mention_with_hastag',
                            mentions_custom_list: 'mention_list',
                            mentions_user_followers: 'mention_follower',
                            mentions_media_likers: 'mention_media',
                            poll: 'poll',
                            subscriptions: 'Subscriptions',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: [
                                {
                                    id: 1,
                                    name: 'Instagram Followers',
                                    type: 'default',
                                    category: 'Instagram Followers',
                                    price: 55000,
                                    min: 100,
                                    max: 100000,
                                    refill: true,
                                    description: 'Service Description',
                                },
                                {
                                    id: 3,
                                    name: 'Instagram Likes',
                                    type: 'default',
                                    category: 'Instagram Likes',
                                    price: 15000,
                                    min: 10,
                                    max: 10000,
                                    refill: true,
                                    description: 'Service Description',
                                },
                            ],
                        },
                        null,
                        4,
                    ),
                },
                order_create: {
                    endpoint: '',
                    method: 'post',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'service', type: 'service_id' },
                        { key: 'target', type: 'order_target' },
                        { key: 'quantity', type: 'order_quantity' },
                        { key: 'comments', type: 'order_comments' },
                        { key: 'usernames', type: 'order_usernames' },
                        { key: 'username', type: 'order_username' },
                        { key: 'hashtags', type: 'order_hashtags' },
                        { key: 'hashtag', type: 'order_hashtag' },
                        { key: 'media', type: 'order_media_url' },
                        { key: 'answer_number', type: 'order_answer_number' },
                    ],
                    parse_response: {
                        order_id: 'data.id',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                id: 1107,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_status: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'id', type: 'order_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                        start_count: 'data.start_count',
                        remains: 'data.remains',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Success',
                            error: 'Error',
                            partial: 'Partial',
                            canceled: 'Canceled',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                id: 1,
                                status: 'Success',
                                start_count: 1000,
                                remains: 90,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_create: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'id_order', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_refill_id: 'data.id_refill',
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                id_refill: 1,
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_refill_status: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'id_refill', type: 'order_refill_id' },
                    ],
                    parse_response: {
                        status: 'data.status',
                    },
                    parse_text: {
                        status: {
                            pending: 'Pending',
                            processing: 'Processing',
                            in_progress: 'In Progress',
                            completed: 'Success',
                            error: 'Error',
                            rejected: 'Rejected',
                        },
                    },
                    example_response: JSON.stringify(
                        {
                            status: true,
                            data: {
                                id: 1,
                                status: 'Success',
                            },
                        },
                        null,
                        4,
                    ),
                },
                order_cancel_create: {
                    endpoint: '',
                    method: 'post',
                    send_request_as_bulk: 0,
                    order_id_separator: ',',
                    params: [
                        { key: 'api_id', type: 'default_parameter' },
                        { key: 'api_key', type: 'default_parameter' },
                        { key: 'orders', type: 'order_id' },
                    ],
                    parse_response: {
                        looping: '',
                        order_cancel_id: 'cancel',
                    },
                    example_response: JSON.stringify(
                        [
                            {
                                order: 9,
                                cancel: {
                                    error: 'Incorrect order ID',
                                },
                            },
                            {
                                order: 2,
                                cancel: 1,
                            },
                        ],
                        null,
                        4,
                    ),
                },
            };

            const newProvider = {
                ...form.data.service.provider,
                quick_setup: api,
                ...(api === 'v2' && {
                    locale: 'en',
                    is_refill_support: true,
                    is_cancel_support: true,
                    default_parameters: [{ key: 'key', value: 'jhonroot.dev' }],
                }),
                ...(api === 'smmindo' && {
                    locale: 'id',
                    is_refill_support: true,
                    is_cancel_support: false,
                    default_parameters: [
                        { key: 'api_id', value: 'jhonroot.dev' },
                        { key: 'api_key', value: 'jhonroot.dev' },
                    ],
                }),
            };

            form.setData('service', {
                ...form.data.service,
                provider: newProvider,
                provider_configuration: {
                    ...form.data.service.provider_configuration,
                    account: api === 'v2' ? v2Configs.account : smmIndoConfigs.account,
                    services: api === 'v2' ? v2Configs.services : smmIndoConfigs.services,
                    order_create: api === 'v2' ? v2Configs.order_create : smmIndoConfigs.order_create,
                    order_status: api === 'v2' ? v2Configs.order_status : smmIndoConfigs.order_status,
                    order_refill_create: api === 'v2' ? v2Configs.order_refill_create : smmIndoConfigs.order_refill_create,
                    order_refill_status: api === 'v2' ? v2Configs.order_refill_status : smmIndoConfigs.order_refill_status,
                    order_cancel_create: api === 'v2' ? v2Configs.order_cancel_create : smmIndoConfigs.order_cancel_create,
                },
            }).setErrors([]);
        }
    };

    const setConfigs = (providerName) => {
        const provider = recommenderProviders.find((item) => item.name === providerName);
        const newProvider = {
            ...form.data.service.provider,
            name: provider.name,
            alias: provider.alias,
            locale: provider.locale,
            is_refill_support: provider.is_refill_support,
            is_cancel_support: provider.is_cancel_support,
            default_parameters: provider.default_parameters,
        };
        form.setData('service', {
            ...form.data.service,
            provider: newProvider,
            provider_configuration: provider.configs,
            // provider_configuration: {
            //     ...form.data.service.provider_configuration,
            //     account: api === 'v2' ? v2Configs.account : smmIndoConfigs.account,
            //     services: api === 'v2' ? v2Configs.services : smmIndoConfigs.services,
            //     order_create: api === 'v2' ? v2Configs.order_create : smmIndoConfigs.order_create,
            //     order_status: api === 'v2' ? v2Configs.order_status : smmIndoConfigs.order_status,
            //     order_refill_create: api === 'v2' ? v2Configs.order_refill_create : smmIndoConfigs.order_refill_create,
            //     order_refill_status: api === 'v2' ? v2Configs.order_refill_status : smmIndoConfigs.order_refill_status,
            //     order_cancel_create: api === 'v2' ? v2Configs.order_cancel_create : smmIndoConfigs.order_cancel_create,
            // },
        }).setErrors([]);
    };

    useEffect(() => {
        if (form.data.flazpedia) {
            setConfigs('Flazpedia');
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">1. Settings</h5>
                <div className={cn('grid items-start gap-4', form.data.service.provider.currency === 'USD' ? 'lg:grid-cols-4' : 'lg:grid-cols-4')}>
                    <div className="grid gap-2">
                        <Label isRequired>Name</Label>
                        <Input
                            value={form.data.service.provider.name}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider: {
                                        ...form.data.service.provider,
                                        name: e.target.value,
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider.name')}
                            aria-invalid={form.invalid('service.provider.name')}
                        />
                        {form.invalid('service.provider.name') && <InputError message={form.errors['service.provider.name']} />}
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>Alias</Label>
                        <Input
                            value={form.data.service.provider.alias}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider: {
                                        ...form.data.service.provider,
                                        alias: e.target.value,
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider.alias')}
                            aria-invalid={form.invalid('service.provider.alias')}
                        />
                        {form.invalid('service.provider.alias') && <InputError message={form.errors['service.provider.alias']} />}
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>Currency</Label>
                        <Popover open={openLocalePopover} onOpenChange={setOpenLocalePopover} className="p-0">
                            <PopoverTrigger className="overflow-hidden" aria-invalid={form.invalid('service.provider.locale')} asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        'justify-between',
                                        !form.data.service.provider.locale && 'text-muted-foreground',
                                        form.invalid('service.provider.locale') && 'text-destructive hover:text-destructive',
                                    )}
                                >
                                    <span className="flex max-w-[300px] items-center gap-2 truncate md:max-w-[400px] 2xl:max-w-[500px]">
                                        {form.data.service.provider.locale && (
                                            <img
                                                src={`https://react-circle-flags.pages.dev/language/${form.data.service.provider.locale}.svg`}
                                                className="size-3.5 rounded-xl"
                                                alt={`flag-${form.data.service.provider.locale}`}
                                            />
                                        )}
                                        {form.data.service.provider.locale
                                            ? `${locales.find((item) => item.locale === form.data.service.provider.locale)?.language_name} (${locales.find((item) => item.locale === form.data.service.provider.locale)?.currency_code})`
                                            : 'Select Currency...'}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="popover-content p-0">
                                <Command
                                    className="p-0"
                                    filter={(value, search, keywords) => {
                                        const extendValue = value + ' ' + keywords.join(' ');
                                        if (extendValue.toLowerCase().includes(search.toLowerCase())) return 1;
                                        return 0;
                                    }}
                                >
                                    <CommandInput placeholder="Search Currency..." className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                        {locales.map((locale, index) => (
                                            <CommandItem
                                                key={index}
                                                value={locale.locale}
                                                keywords={[locale.language_name, locale.currency_code]}
                                                className={form.data.service.provider.locale === locale.locale ? 'bg-muted' : ''}
                                                onSelect={(currentValue) => {
                                                    form.setData('service', {
                                                        ...form.data.service,
                                                        provider: {
                                                            ...form.data.service.provider,
                                                            locale: locale.locale,
                                                        },
                                                    });
                                                    form.forgetError('service.provider.locale');
                                                    setOpenLocalePopover(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={`https://react-circle-flags.pages.dev/language/${locale.locale}.svg`}
                                                        className="size-3.5 rounded-xl"
                                                        alt={`flag-${locale.locale}`}
                                                    />
                                                    {locale.language_name} ({locale.currency_code})
                                                </div>
                                                <CheckIcon
                                                    className={cn(
                                                        'ml-auto h-4 w-4',
                                                        form.data.service.provider.locale === locale.locale ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.invalid('service.provider.locale') && <InputError message={form.errors['service.provider.locale']} />}
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>Profit Configs</Label>
                        <div className="grid grid-cols-12">
                            <div className="col-span-6 grid w-full gap-2">
                                <Select
                                    defaultValue={form.data.service.provider_configuration.services.profit_configs.type}
                                    onValueChange={(value) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    profit_configs: {
                                                        ...form.data.service.provider_configuration.services.profit_configs,
                                                        type: value,
                                                    },
                                                },
                                            },
                                        }).validate('service.provider_configuration.services.profit_configs.type');
                                        form.forgetError('service.provider_configuration.services.profit_configs.type');
                                    }}
                                    onBlur={() => form.validate('service.provider_configuration.services.profit_configs.type')}
                                >
                                    <SelectTrigger
                                        className="w-full rounded-r-none"
                                        aria-invalid={form.invalid('service.provider_configuration.services.profit_configs.type')}
                                    >
                                        <SelectValue placeholder={t('common:placeholders.select')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">{t('admin/common:labels.profit-fixed')}</SelectItem>
                                        <SelectItem value="percentage">{t('admin/common:labels.profit-percentage')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid('service.provider_configuration.services.profit_configs.type') && (
                                    <InputError message={form.errors['service.provider_configuration.services.profit_configs.type']} />
                                )}
                            </div>
                            <div className="col-span-6 grid w-full gap-2">
                                <InputMask
                                    min={0}
                                    prefix={
                                        form.data.service.provider_configuration.services.profit_configs.type === 'fixed'
                                            ? locales.find((item) => item.locale === i18n.language).currency_symbol + ' '
                                            : ''
                                    }
                                    suffix={form.data.service.provider_configuration.services.profit_configs.type === 'percentage' ? ' %' : ''}
                                    value={form.data.service.provider_configuration.services.profit_configs.display_value}
                                    className="rounded-l-none border-l-0"
                                    onValueChange={(values) => {
                                        const value =
                                            form.data.service.provider_configuration.services.profit_configs.type === 'percentage'
                                                ? values.floatValue
                                                : values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    profit_configs: {
                                                        ...form.data.service.provider_configuration.services.profit_configs,
                                                        value,
                                                        display_value: values.floatValue,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate('service.provider_configuration.services.profit_configs.value')}
                                    aria-invalid={form.invalid('service.provider_configuration.services.profit_configs.value')}
                                />
                                {form.invalid('service.provider_configuration.services.profit_configs.value') && (
                                    <InputError message={form.errors['service.provider_configuration.services.profit_configs.value']} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid items-start gap-4 lg:grid-cols-4">
                    <div className={cn('grid gap-2', form.data.flazpedia && 'hidden')}>
                        <Label>Type</Label>
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="typeManual"
                                checked={form.data.service.provider.type === 'manual'}
                                onCheckedChange={() => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider: {
                                            ...form.data.service.provider,
                                            type: 'manual',
                                        },
                                    });
                                }}
                            />
                            <Label htmlFor="typeManual">Manual</Label>
                        </div>
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="typeAuto"
                                checked={form.data.service.provider.type === 'auto'}
                                onCheckedChange={() => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider: {
                                            ...form.data.service.provider,
                                            type: 'auto',
                                        },
                                    });
                                }}
                            />
                            <Label htmlFor="typeAuto">Auto</Label>
                        </div>
                        {form.invalid('service.provider.type') && <InputError message={form.errors['service.provider.type']} />}
                    </div>
                    <div className={cn('grid gap-2', form.data.flazpedia && 'hidden')}>
                        <Label>Support</Label>
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="isRefillSupport"
                                checked={form.data.service.provider.is_refill_support}
                                onCheckedChange={(checked) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider: {
                                            ...form.data.service.provider,
                                            is_refill_support: checked,
                                        },
                                    });
                                }}
                            />
                            <Label htmlFor="isRefillSupport">Order Refill</Label>
                        </div>
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="isCancelSupport"
                                checked={form.data.service.provider.is_cancel_support}
                                onCheckedChange={(checked) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider: {
                                            ...form.data.service.provider,
                                            is_cancel_support: checked,
                                        },
                                    });
                                }}
                            />
                            <Label htmlFor="isCancelSupport">Order Cancellation</Label>
                        </div>
                    </div>
                    <div className={cn('grid gap-2', form.data.flazpedia && 'hidden')}>
                        <Label>Quick API Setup</Label>
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="apiV2"
                                checked={form.data.service.provider.quick_setup === 'v2'}
                                onCheckedChange={(checked) => {
                                    quickSetup('v2');
                                }}
                            />
                            <Label htmlFor="apiV2">V2</Label>
                        </div>
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="smmIndo"
                                checked={form.data.service.provider.quick_setup === 'smmindo'}
                                onCheckedChange={(checked) => {
                                    quickSetup('smmindo');
                                }}
                            />
                            <Label htmlFor="smmIndo">Indonesian SMM</Label>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Recommended Providers</Label>
                        {/* <div className={cn("flex items-center space-x-2", form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="recommendedProvidersMedanPedia"
                                checked={form.data.service.provider.name === 'Medan Pedia'}
                                onCheckedChange={(checked) => {
                                    setConfigs('Medan Pedia');
                                }}
                            />
                            <Label htmlFor="recommendedProvidersMedanPedia">Medan Pedia</Label>
                        </div> */}
                        {/* <div className={cn("flex items-center space-x-2", form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="recommendedProvidersProviderSMM"
                                checked={form.data.service.provider.name === 'Provider SMM'}
                                onCheckedChange={(checked) => {
                                    setConfigs('Provider SMM');
                                }}
                            />
                            <Label htmlFor="recommendedProvidersProviderSMM">ProviderSMM.id</Label>
                        </div>
                        <div className={cn("flex items-center space-x-2", form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="recommendedProvidersIndoPedia"
                                checked={form.data.service.provider.name === 'Indo Pedia'}
                                onCheckedChange={(checked) => {
                                    setConfigs('Indo Pedia');
                                }}
                            />
                            <Label htmlFor="recommendedProvidersIndoPedia">Indo Pedia</Label>
                        </div>
                        <div className={cn("flex items-center space-x-2", form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="recommendedProvidersBisnisPanel"
                                checked={form.data.service.provider.name === 'Bisnis Panel'}
                                onCheckedChange={(checked) => {
                                    setConfigs('Bisnis Panel');
                                }}
                            />
                            <Label htmlFor="recommendedProvidersBisnisPanel">Bisnis Panel</Label>
                        </div> */}
                        <div className={cn('flex items-center space-x-2', form.data.flazpedia && 'hidden')}>
                            <Checkbox
                                id="recommendedProvidersflazpedia"
                                checked={form.data.service.provider.name === 'Flazpedia'}
                                onCheckedChange={(checked) => {
                                    setConfigs('Flazpedia');
                                }}
                            />
                            <Label htmlFor="recommendedProvidersflazpedia">Flazpedia</Label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">2. Default Parameters</h5>
                {form.data.service.provider.default_parameters.map((param, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>Key</Label>
                                <Input
                                    value={param.key}
                                    onChange={(e) => {
                                        const updatedDefaultParameters = [...form.data.service.provider.default_parameters];
                                        updatedDefaultParameters[index] = {
                                            ...updatedDefaultParameters[index],
                                            key: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider: {
                                                ...form.data.service.provider,
                                                default_parameters: updatedDefaultParameters,
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider.default_parameters.${index}.key`)}
                                    aria-invalid={form.invalid(`service.provider.default_parameters.${index}.key`)}
                                />
                                {form.invalid(`service.provider.default_parameters.${index}.key`) && (
                                    <InputError message={form.errors[`service.provider.default_parameters.${index}.key`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Value</Label>
                                <Input
                                    value={param.value}
                                    onChange={(e) => {
                                        const updatedDefaultParameters = [...form.data.service.provider.default_parameters];
                                        updatedDefaultParameters[index] = {
                                            ...updatedDefaultParameters[index],
                                            value: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider: {
                                                ...form.data.service.provider,
                                                default_parameters: updatedDefaultParameters,
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider.default_parameters.${index}.value`)}
                                    aria-invalid={form.invalid(`service.provider.default_parameters.${index}.value`)}
                                />
                                {form.invalid(`service.provider.default_parameters.${index}.value`) && (
                                    <InputError message={form.errors[`service.provider.default_parameters.${index}.value`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedDefaultParameters = form.data.service.provider.default_parameters.filter(
                                    (column) => column.key !== param.key,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider: {
                                        ...form.data.service.provider,
                                        default_parameters: updatedDefaultParameters,
                                    },
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                ))}
                <Button
                    className="w-40"
                    type="button"
                    size="sm"
                    onClick={() => {
                        form.setData('service', {
                            ...form.data.service,
                            provider: {
                                ...form.data.service.provider,
                                default_parameters: [...form.data.service.provider.default_parameters, { key: '', value: '' }],
                            },
                        });
                    }}
                >
                    Add Parameter
                </Button>
            </div>
        </div>
    );
}
