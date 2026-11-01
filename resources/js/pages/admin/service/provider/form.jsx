import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Balance from './partials/balance';
import Main from './partials/main';
import OrderCancel from './partials/order-cancel';
import OrderCreate from './partials/order-create';
import OrderRefillCreate from './partials/order-refill-create';
import OrderRefillStatus from './partials/order-refill-status';
import OrderStatus from './partials/order-status';
import Service from './partials/service';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/services']);
    const [openProductCategoryGroupPopover, setOpenProductCategoryGroupPopover] = useState(false);
    const [openProductCategoryPopover, setOpenProductCategoryPopover] = useState(false);
    const [productCategoryGroups, setProductCategoryGroups] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    // const form = useForm(
    //     method,
    //     isUpdate ? route('admin.services.providers.update', { target: target.id }) : route('admin.services.providers.store'),
    //     {
    //         _method: method,
    //         product: {
    //             provider: {
    //                 name: target.name ?? '',
    //                 alias: target.alias ?? '',
    //                 default_parameters: target.default_parameters ?? '',
    //                 profit_configs: target.profit_configs ?? {
    //                     type: 'fixed',
    //                     value: 0,
    //                 },
    //             },
    //         },
    //     },
    // );

    const form = useForm(
        method,
        isUpdate ? route('admin.services.providers.update', { target: target.id }) : route('admin.services.providers.store'),
        {
            _method: method,
            miraipedia: false,
            service: {
                provider: {
                    quick_setup: '',
                    type: target.type ?? 'auto',
                    name: target.name ?? '',
                    alias: target.alias ?? '',
                    locale: target && target.locale ? target.locale.locale : ('' ?? ''),
                    rate: target.rate ?? 0,
                    default_parameters: target.default_parameters ?? [{ key: 'api_key', value: 'jhonroot.dev' }],
                    is_refill_support: !!Number(target.is_refill_support),
                    is_cancel_support: !!Number(target.is_cancel_support),
                },
                provider_configuration: {
                    account:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.account_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      balance: '',
                                  },
                                  example_response: '',
                              },
                    services:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.services_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  profit_configs: target.profit_configs ?? {
                                      type: 'percentage',
                                      value: 10,
                                      display_value: 10,
                                  },
                                  parse_response: {
                                      looping: '',
                                      id: '',
                                      category: '',
                                      name: '',
                                      price: '',
                                      min: '',
                                      max: '',
                                      description: '',
                                      is_refill_support: '',
                                      is_cancel_support: '',
                                      refill_days: '',
                                      refill_available_in_hours: '',
                                      type: '',
                                  },
                                  parse_text: {
                                      name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                                      type: {
                                          primary: 'Primary',
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
                                  example_response: '',
                              },
                    order_create:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_create_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      order_id: '',
                                  },
                                  example_response: '',
                              },
                    order_status:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_status_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  send_request_as_bulk: 0,
                                  order_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      status: '',
                                      start_count: '',
                                      remains: '',
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
                                  example_response: '',
                              },
                    order_cancel_create:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_cancel_create_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  // send_request_as_bulk: !!Number(target.is_cancel_support),
                                  send_request_as_bulk: 0,
                                  order_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      looping: '',
                                      order_cancel_id: '',
                                  },
                                  example_response: '',
                              },
                    order_refill_create:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_refill_create_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  // send_request_as_bulk: !!Number(target.is_cancel_support),
                                  send_request_as_bulk: 0,
                                  order_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      looping: '',
                                      order_refill_id: '',
                                  },
                                  example_response: '',
                              },
                    order_refill_status:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_refill_status_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  send_request_as_bulk: 0,
                                  order_refill_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      status: '',
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
                                  example_response: '',
                              },
                },
            },
        },
    );

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            provider: {
                quick_setup: '',
                type: target.type ?? 'auto',
                name: target.name ?? '',
                alias: target.alias ?? '',
                locale: target && target.locale ? target.locale.locale : ('' ?? ''),
                rate: target.rate ?? 0,
                default_parameters: target.default_parameters ?? [{ key: 'api_key', value: 'jhonroot.dev' }],
                is_refill_support: !!Number(target.is_refill_support),
                is_cancel_support: !!Number(target.is_cancel_support),
            },
            provider_configuration: {
                account:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.account_configuration
                        : {
                              endpoint: '',
                              method: '',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              parse_response: {
                                  balance: '',
                              },
                              example_response: '',
                          },
                services:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.services_configuration
                        : {
                              endpoint: '',
                              method: '',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              profit_configs: target.profit_configs ?? {
                                  type: 'percentage',
                                  value: 10,
                                  display_value: 10,
                              },
                              parse_response: {
                                  looping: '',
                                  id: '',
                                  category: '',
                                  name: '',
                                  price: '',
                                  min: '',
                                  max: '',
                                  description: '',
                                  is_refill_support: '',
                                  is_cancel_support: '',
                                  refill_days: '',
                                  refill_available_in_hours: '',
                                  type: '',
                              },
                              parse_text: {
                                  name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                                  type: {
                                      primary: 'Primary',
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
                              example_response: '',
                          },
                order_create:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.order_create_configuration
                        : {
                              endpoint: '',
                              method: '',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              parse_response: {
                                  order_id: '',
                              },
                              example_response: '',
                          },
                order_status:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.order_status_configuration
                        : {
                              endpoint: '',
                              method: '',
                              send_request_as_bulk: 0,
                              order_id_separator: ',',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              parse_response: {
                                  status: '',
                                  start_count: '',
                                  remains: '',
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
                              example_response: '',
                          },
                order_cancel_create:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.order_cancel_create_configuration
                        : {
                              endpoint: '',
                              method: '',
                              // send_request_as_bulk: !!Number(target.is_cancel_support),
                              send_request_as_bulk: 0,
                              order_id_separator: ',',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              parse_response: {
                                  looping: '',
                                  order_cancel_id: '',
                              },
                              example_response: '',
                          },
                order_refill_create:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.order_refill_create_configuration
                        : {
                              endpoint: '',
                              method: '',
                              // send_request_as_bulk: !!Number(target.is_cancel_support),
                              send_request_as_bulk: 0,
                              order_id_separator: ',',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              parse_response: {
                                  looping: '',
                                  order_refill_id: '',
                              },
                              example_response: '',
                          },
                order_refill_status:
                    target.id && target.service_provider_configuration
                        ? target.service_provider_configuration.order_refill_status_configuration
                        : {
                              endpoint: '',
                              method: '',
                              send_request_as_bulk: 0,
                              order_refill_id_separator: ',',
                              params: [{ key: 'api_key', type: 'default_parameter' }],
                              parse_response: {
                                  status: '',
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
                              example_response: '',
                          },
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.service || {};

        const providerChanged =
            u.provider?.quick_setup !== initialData.provider.quick_setup ||
            u.provider?.type !== initialData.provider.type ||
            u.provider?.name !== initialData.provider.name ||
            u.provider?.alias !== initialData.provider.alias ||
            u.provider?.locale !== initialData.provider.locale ||
            u.provider?.rate !== initialData.provider.rate ||
            JSON.stringify(u.provider?.default_parameters) !== JSON.stringify(initialData.provider.default_parameters) ||
            u.provider?.is_refill_support !== initialData.provider.is_refill_support ||
            u.provider?.is_cancel_support !== initialData.provider.is_cancel_support;

        const servicesChanged =
            JSON.stringify(u.provider_configuration?.services?.params) !== JSON.stringify(initialData.provider_configuration.services.params) ||
            JSON.stringify(u.provider_configuration?.services?.profit_configs) !==
                JSON.stringify(initialData.provider_configuration.services.profit_configs) ||
            JSON.stringify(u.provider_configuration?.services?.parse_response) !==
                JSON.stringify(initialData.provider_configuration.services.parse_response) ||
            JSON.stringify(u.provider_configuration?.services?.parse_text) !== JSON.stringify(initialData.provider_configuration.services.parse_text);

        const accountChanged = JSON.stringify(u.provider_configuration?.account) !== JSON.stringify(initialData.provider_configuration.account);

        const orderCreateChanged =
            JSON.stringify(u.provider_configuration?.order_create) !== JSON.stringify(initialData.provider_configuration.order_create);

        const orderStatusChanged =
            JSON.stringify(u.provider_configuration?.order_status) !== JSON.stringify(initialData.provider_configuration.order_status);

        const orderCancelChanged =
            JSON.stringify(u.provider_configuration?.order_cancel_create) !== JSON.stringify(initialData.provider_configuration.order_cancel_create);

        const orderRefillChanged =
            JSON.stringify(u.provider_configuration?.order_refill_create) !== JSON.stringify(initialData.provider_configuration.order_refill_create);

        const orderRefillStatusChanged =
            JSON.stringify(u.provider_configuration?.order_refill_status) !== JSON.stringify(initialData.provider_configuration.order_refill_status);

        return (
            providerChanged ||
            servicesChanged ||
            accountChanged ||
            orderCreateChanged ||
            orderStatusChanged ||
            orderCancelChanged ||
            orderRefillChanged ||
            orderRefillStatusChanged
        );
    }, [form.data, initialData]);

    const handleRequestClose = useCallback(() => {
        if (hasUnsavedChanges()) {
            setIsRequestCloseDialogOpened(true);
        } else {
            form.setErrors([]);
            setTarget({});
            setIsCreateDialogOpened(false);
        }
    }, [hasUnsavedChanges, form, setTarget, setIsCreateDialogOpened]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);

            const url = isUpdate ? route('admin.services.providers.update', { target: target.id }) : route('admin.services.providers.store');
            const data = JSON.parse(JSON.stringify(form.data, (key, value) => (value === null ? '' : value)));

            axios
                .post(url, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((response) => {
                    form.reset();
                    form.setErrors([]);
                    setTarget({});
                    setIsCreateDialogOpened(false);
                    toast({
                        variant: 'success',
                        description: toHTML(response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                    fetchData(tableStateRef.current);
                })
                .catch((error) => {
                    form.setErrors(error.response.data.errors);
                    toast({
                        variant: 'error',
                        description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [isUpdate, target?.id, method, form, setTarget, setIsCreateDialogOpened, fetchData, tableStateRef],
    );

    useEffect(() => {
        form.setData((data) => ({
            _method: method,
            miraipedia: false,
            service: {
                provider: {
                    quick_setup: '',
                    type: target.type ?? 'auto',
                    name: target.name ?? '',
                    alias: target.alias ?? '',
                    locale: target && target.locale ? target.locale.locale : ('' ?? ''),
                    rate: target.rate ?? 0,
                    default_parameters: target.default_parameters ?? [{ key: 'api_key', value: 'jhonroot.dev' }],
                    is_refill_support: !!Number(target.is_refill_support),
                    is_cancel_support: !!Number(target.is_cancel_support),
                },
                provider_configuration: {
                    account:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.account_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      balance: '',
                                  },
                                  example_response: '',
                              },
                    services:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.services_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  profit_configs: target.profit_configs ?? {
                                      type: 'percentage',
                                      value: 10,
                                      display_value: 10,
                                  },
                                  parse_response: {
                                      looping: '',
                                      id: '',
                                      category: '',
                                      name: '',
                                      price: '',
                                      min: '',
                                      max: '',
                                      description: '',
                                      is_refill_support: '',
                                      is_cancel_support: '',
                                      refill_days: '',
                                      refill_available_in_hours: '',
                                      type: '',
                                  },
                                  parse_text: {
                                      name: [{ from: 'jhondelton', to: 'jhonroot.dev' }],
                                      type: {
                                          primary: 'Primary',
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
                                  example_response: '',
                              },
                    order_create:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_create_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      order_id: '',
                                  },
                                  example_response: '',
                              },
                    order_status:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_status_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  send_request_as_bulk: 0,
                                  order_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      status: '',
                                      start_count: '',
                                      remains: '',
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
                                  example_response: '',
                              },
                    order_cancel_create:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_cancel_create_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  // send_request_as_bulk: !!Number(target.is_cancel_support),
                                  send_request_as_bulk: 0,
                                  order_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      looping: '',
                                      order_cancel_id: '',
                                  },
                                  example_response: '',
                              },
                    order_refill_create:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_refill_create_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  // send_request_as_bulk: !!Number(target.is_cancel_support),
                                  send_request_as_bulk: 0,
                                  order_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      looping: '',
                                      order_refill_id: '',
                                  },
                                  example_response: '',
                              },
                    order_refill_status:
                        target.id && target.service_provider_configuration
                            ? target.service_provider_configuration.order_refill_status_configuration
                            : {
                                  endpoint: '',
                                  method: '',
                                  send_request_as_bulk: 0,
                                  order_refill_id_separator: ',',
                                  params: [{ key: 'api_key', type: 'default_parameter' }],
                                  parse_response: {
                                      status: '',
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
                                  example_response: '',
                              },
                },
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, target?.id]);

    useEffect(() => {
        if (isCreateDialogOpened && target?.id !== undefined && form.data.service.provider_configuration.services.profit_configs.type === 'fixed') {
            form.setData((data) => ({
                ...data,
                miraipedia: false,
                service: {
                    ...data.service,
                    provider_configuration: {
                        ...data.service.provider_configuration,
                        services: {
                            ...data.service.provider_configuration.services,
                            profit_configs: {
                                ...data.service.provider_configuration.services.profit_configs,
                                display_value:
                                    (form.data.service.provider_configuration.services.profit_configs.value ?? 0) *
                                    (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                            },
                        },
                    },
                },
            }));
        }
    }, [isCreateDialogOpened, target?.id]);

    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-5xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {target.id
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('admin/common:labels.provider'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('admin/common:labels.provider'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="">
                            <TabGroup>
                                <TabList className="">
                                    <div className="flex w-full items-center gap-2">
                                        <div className="hide-scrollbar -mb-px grid w-full transform grid-cols-2 items-center gap-2 overflow-auto duration-300 ease-in-out sm:grid-cols-3 md:gap-2 lg:grid-cols-4">
                                            {[
                                                'Main',
                                                'Balance',
                                                'Services',
                                                'Create Order',
                                                'Order Status',
                                                'Create Order Refill',
                                                'Order Refill Status',
                                                'Cancel Order',
                                            ].map((label) => (
                                                <Tab key={label} as={Fragment}>
                                                    {({ selected }) => (
                                                        <Button
                                                            size="sm"
                                                            variant={selected ? 'default' : 'outline'}
                                                            disabled={
                                                                form.data.service.provider.type === 'manual' ||
                                                                (['Create Order Refill', 'Order Refill Status'].includes(label) &&
                                                                    !form.data.service.provider.is_refill_support) ||
                                                                (label === 'Cancel Order' && !form.data.service.provider.is_cancel_support)
                                                            }
                                                        >
                                                            {label}
                                                        </Button>
                                                    )}
                                                </Tab>
                                            ))}
                                        </div>
                                    </div>
                                </TabList>
                                <TabPanels className="pt-4">
                                    <TabPanel>
                                        <Main form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <Balance form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <Service form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <OrderCreate form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <OrderStatus form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <OrderRefillCreate form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <OrderRefillStatus form={form} />
                                    </TabPanel>
                                    <TabPanel>
                                        <OrderCancel form={form} />
                                    </TabPanel>
                                </TabPanels>
                            </TabGroup>
                        </div>

                        {/* <div className="mt-12 grid gap-2">
                            <Label isRequired>{t('common:labels.name')}</Label>
                            <Input
                                value={form.data.product.provider.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        product: {
                                            ...data.product,
                                            provider: {
                                                ...data.product.provider,
                                                name: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('product.provider.name')}
                                aria-invalid={form.invalid('product.provider.name')}
                            />
                            {form.invalid('product.provider.name') && <InputError message={form.errors['product.provider.name']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.alias')}</Label>
                            <Input
                                value={form.data.product.provider.alias}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        product: {
                                            ...data.product,
                                            provider: {
                                                ...data.product.provider,
                                                alias: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('product.provider.alias')}
                                aria-invalid={form.invalid('product.provider.alias')}
                            />
                            {form.invalid('product.provider.alias') && <InputError message={form.errors['product.provider.alias']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('admin/common:labels.profit_configs')}</Label>
                            <div className="grid grid-cols-12">
                                <div className="col-span-6 grid w-full gap-2">
                                    <Select
                                        defaultValue={form.data.product.provider.profit_configs.type}
                                        onValueChange={(value) => {
                                            form.setData('product', {
                                                ...form.data.product,
                                                provider: {
                                                    ...form.data.product.provider,
                                                    profit_configs: {
                                                        ...form.data.product.provider.profit_configs,
                                                        type: value,
                                                    },
                                                },
                                            }).validate('product.provider.profit_configs.type');
                                            form.forgetError('product.provider.profit_configs.type');
                                        }}
                                        onBlur={() => form.validate('product.provider.profit_configs.type')}
                                    >
                                        <SelectTrigger
                                            className="w-full rounded-r-none"
                                            aria-invalid={form.invalid('product.provider.profit_configs.type')}
                                        >
                                            <SelectValue placeholder={t('common:placeholders.select')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">Angka Pasti</SelectItem>
                                            <SelectItem value="percentage">Persenan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.invalid('product.provider.profit_configs.type') && (
                                        <InputError message={form.errors['product.provider.profit_configs.type']} />
                                    )}
                                </div>
                                <div className="col-span-6 grid w-full gap-2">
                                    <InputMask
                                        min={0}
                                        prefix={form.data.product.provider.profit_configs.type == 'fixed' ? 'Rp ' : ''}
                                        suffix={form.data.product.provider.profit_configs.type == 'percentage' ? ' %' : ''}
                                        value={form.data.product.provider.profit_configs.value}
                                        className="rounded-l-none border-l-0"
                                        onValueChange={(values) => {
                                            form.setData('product', {
                                                ...form.data.product,
                                                provider: {
                                                    ...form.data.product.provider,
                                                    profit_configs: {
                                                        ...form.data.product.provider.profit_configs,
                                                        value: values.floatValue,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate('product.provider.profit_configs.value')}
                                        aria-invalid={form.invalid('product.provider.profit_configs.value')}
                                    />
                                    {form.invalid('product.provider.profit_configs.value') && (
                                        <InputError message={form.errors['product.provider.profit_configs.value']} />
                                    )}
                                </div>
                            </div>
                        </div> */}
                        {/* {Object.keys(form.data.service.provider.default_parameters).map((key, index) => {
                            return (
                                <div className="grid gap-2" key={index}>
                                    <Label>{key}</Label>
                                    <Input
                                        value={form.data.service.provider.default_parameters[key]}
                                        className={
                                            form.invalid(`service.provider.default_parameters.${key}`)
                                                ? 'border-red-500 focus-visible:ring-red-500/50'
                                                : ''
                                        }
                                        onChange={(e) => {
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider: {
                                                    ...form.data.service.provider,
                                                    default_parameters: {
                                                        ...form.data.service.provider.default_parameters,
                                                        [key]: e.target.value,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider.default_parameters.${key}`)}
                                    />
                                    {form.invalid(`service.provider.default_parameters.${key}`) && (
                                        <InputError message={form.errors[`service.provider.default_parameters.${key}`]} />
                                    )}
                                </div>
                            );
                        })} */}
                        <DialogFooter>
                            <Button type="submit" className={cn('w-full')} disabled={isLoading} onClick={handleSubmit}>
                                {!isLoading ? t('common:actions.submit') : t('common:loading.please-wait')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isRequestCloseDialogOpened} onOpenChange={setIsRequestCloseDialogOpened}>
                <AlertDialogContent className="sm:max-w-md" isBlur>
                    <AlertDialogHeader className="text-left">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-md bg-yellow-100 p-1.5 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-900/40">
                                <Alert01Icon />
                            </div>
                            <div className="space-y-1">
                                <AlertDialogTitle className="text-base">{t('admin/common:dialog.unsaved.title')}</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                                    {toHTML(t('admin/common:dialog.unsaved.description'))}
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel>{t('admin/common:dialog.unsaved.cancel-button')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                form.reset();
                                form.setErrors([]);
                                setIsRequestCloseDialogOpened(false);
                                setTarget({});
                                setIsCreateDialogOpened(false);
                            }}
                        >
                            {t('admin/common:dialog.unsaved.confirm-button')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
