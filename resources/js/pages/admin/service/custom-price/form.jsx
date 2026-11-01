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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { Fragment, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/services']);
    const [openUserGroupPopover, setOpenUserGroupPopover] = useState(false);
    const [openServiceCategoryPopover, setOpenServiceCategoryPopover] = useState(false);
    const [openServicePopover, setOpenServicePopover] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [services, setServices] = useState([]);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const getDisplayPrice = (priceConfigs = {}) => {
        const rate = locales.find((item) => item.locale === i18n.language)?.usd_rate || 1;

        if (priceConfigs?.type === 'percentage') {
            return priceConfigs?.display_price ?? 0;
        }

        return (priceConfigs?.price ?? 0) * rate;
    };

    const roundTo8 = (value) => {
        return Number(parseFloat(value || 0).toFixed(8));
    };

    const form = useForm(
        method,
        isUpdate ? route('admin.services.custom-prices.update', { target: target.id }) : route('admin.services.custom-prices.store'),
        {
            _method: method,
            user: {
                group: {
                    id: target.user_group_id ?? '',
                },
            },
            service: {
                id: target.service_id ?? '',
                price_configs: {
                    original_price: target.service?.original_price ?? 0,
                    display_original_price:
                        (target.service?.original_price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    sell_price: target.service?.price ?? 0,
                    display_sell_price: (target.service?.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    type: target.price_configs?.type ?? 'fixed',
                    price: target.price_configs?.price ?? 0,
                    display_price: getDisplayPrice(target.price_configs),
                    profit: target.price_configs?.profit ?? 0,
                    display_profit: (target.price_configs?.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                },
                category: {
                    id: target.service_category_id ?? '',
                },
            },
        },
    );

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            user: {
                group: {
                    id: target.user_group_id ?? '',
                },
            },
            service: {
                id: target.service_id ?? '',
                price_configs: {
                    original_price: target.service?.original_price ?? 0,
                    display_original_price:
                        (target.service?.original_price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    sell_price: target.service?.price ?? 0,
                    display_sell_price: (target.service?.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    type: target.price_configs?.type ?? 'fixed',
                    price: target.price_configs?.price ?? 0,
                    display_price: getDisplayPrice(target.price_configs),
                    profit: target.price_configs?.profit ?? 0,
                    display_profit: (target.price_configs?.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                },
                category: {
                    id: target.service_category_id ?? '',
                },
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const { service, user } = form.data || {};
        return (
            user.group?.id !== initialData.user.group.id ||
            service.id !== initialData.service.id ||
            service.category?.id !== initialData.service.category.id ||
            JSON.stringify(service?.price_configs) !== JSON.stringify(initialData.service.price_configs)
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

            const url = isUpdate ? route('admin.services.custom-prices.update', { target: target.id }) : route('admin.services.custom-prices.store');

            axios
                .post(url, form.data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
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

    const getServiceCategories = async () => {
        setServiceCategories([]);
        setServices([]);
        setIsLoading(true);
        await axios
            .get(
                route('admin.services.categories.options', {
                    ...form.data,
                    ...{
                        onlyRelated: 'services',
                    },
                }),
            )
            .then((response) => {
                setServiceCategories(response.data.items);
            })
            .catch((error) => {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getServices = async () => {
        setServices([]);
        setIsLoading(true);
        await axios
            .get(
                route('admin.services.options', {
                    ...form.data,
                }),
            )
            .then((response) => {
                setServices(response.data.items);
            })
            .catch((error) => {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (isCreateDialogOpened) {
            getServiceCategories();
        }
        form.setData((data) => ({
            _method: method,
            user: {
                group: {
                    id: target.user_group_id ?? '',
                },
            },
            service: {
                id: target.service_id ?? '',
                price_configs: {
                    original_price: target.service?.original_price ?? 0,
                    display_original_price:
                        (target.service?.original_price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    sell_price: target.service?.price ?? 0,
                    display_sell_price: (target.service?.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    type: target.price_configs?.type ?? 'fixed',
                    price: target.price_configs?.price ?? 0,
                    display_price: getDisplayPrice(target.price_configs),
                    profit: target.price_configs?.profit ?? 0,
                    display_profit: (target.price_configs?.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                },
                category: {
                    id: target.service_category_id ?? '',
                },
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, target?.id]);

    useEffect(() => {
        if (form.data.service.category.id) {
            getServices();
        }
    }, [form.data.service.category.id]);

    useEffect(() => {
        if (form.data.service.id) {
            const getService = async () => {
                setIsLoading(true);
                await axios
                    .get(
                        route('admin.services.show', {
                            target: form.data.service.id,
                        }),
                    )
                    .then((response) => {
                        form.setData('service', {
                            ...form.data.service,
                            price_configs: {
                                ...form.data.service.price_configs,
                                original_price: response.data.service.original_price ?? 0,
                                display_original_price:
                                    (response.data.service.original_price ?? 0) *
                                    (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                                sell_price: response.data.service.price ?? 0,
                                display_sell_price:
                                    (response.data.service.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                                type: target.price_configs?.type ?? 'fixed',
                                price: target.price_configs?.price ?? 0,
                                display_price: getDisplayPrice(target.price_configs),
                                profit: target.price_configs?.profit ?? 0,
                                display_profit:
                                    (target.price_configs?.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                            },
                        });
                    })
                    .catch((error) => {
                        toast({
                            variant: 'error',
                            description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                        });
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            };
            getService();
        }
    }, [form.data.service.id]);

    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {target.id
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.custom-price'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.custom-price'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.group')}</Label>
                            <Popover open={openUserGroupPopover} onOpenChange={setOpenUserGroupPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('user.group.id')} asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.user.group.id && 'text-muted-foreground',
                                            form.invalid('user.group.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {form.data.user.group.id
                                            ? pageProps?.userGroups?.options.find((option) => option.value == form.data.user.group.id)?.label
                                            : t('common:placeholders.select')}
                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('user.group.id') || form.data.user.group.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder={t('common:placeholders.search-item', {
                                                item: t('common:labels.group'),
                                            })}
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                            <CommandGroup>
                                                {pageProps?.userGroups?.options.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData((data) => ({
                                                                ...data,
                                                                user: {
                                                                    ...data.user,
                                                                    group: {
                                                                        ...data.user.group,
                                                                        id: option.value,
                                                                    },
                                                                },
                                                            })).validate('user.group.id');
                                                            form.forgetError('user.group.id');
                                                            setOpenUserGroupPopover(false);
                                                        }}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span>{option.label}</span>
                                                        </div>
                                                        {/* {option.label} */}
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === form.data.user.group.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('user.group.id') && <InputError message={form.errors['user.group.id']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.category')}</Label>
                            <Popover open={openServiceCategoryPopover} onOpenChange={setOpenServiceCategoryPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('service.category.id')} asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.service.category.id && 'text-muted-foreground',
                                            form.invalid('service.category.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {(() => {
                                            const id = form.data.service.category.id;
                                            const options = serviceCategories ?? [];

                                            const result = options
                                                .flatMap((group) => group.items.map((item) => ({ group, item })))
                                                .find(({ item }) => item.value == id);

                                            if (result) {
                                                const { group, item } = result;
                                                return (
                                                    <div key={`${group.value}-${item.value}`} className="flex items-center space-x-2">
                                                        {group.type === 'icon' ? (
                                                            <DynamicIcon className="-mt-px h-4 w-4" iconName={group.icon?.trim() ?? ''} size={12} />
                                                        ) : (
                                                            <span className="-mt-px mr-1.5">{group.emoji}</span>
                                                        )}
                                                        <span className="max-w-[300px] truncate md:max-w-[400px] 2xl:max-w-[400px]">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return <span>{t('common:placeholders.select')}</span>;
                                        })()}

                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('service.category.id') || form.data.service.category.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder={`${t('common:labels.search')} ${t('common:labels.category')}...`}
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                            {serviceCategories.map((group, index) => (
                                                <Fragment key={index}>
                                                    <CommandGroup
                                                        heading={
                                                            <div className="flex items-center space-x-2">
                                                                {group.type === 'icon' ? (
                                                                    <DynamicIcon className="-mt-px h-4 w-4" iconName={group.icon.trim()} size={12} />
                                                                ) : (
                                                                    <span className="-mt-px mr-1.5">{group.emoji}</span>
                                                                )}
                                                                <span>{t(group.label)}</span>
                                                            </div>
                                                        }
                                                        key={group.value}
                                                    >
                                                        {group.items.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                value={option.label}
                                                                onSelect={() => {
                                                                    form.setData((data) => ({
                                                                        ...data,
                                                                        service: {
                                                                            ...data.service,
                                                                            id: '',
                                                                            category: {
                                                                                ...data.service.category,
                                                                                id: option.value,
                                                                            },
                                                                        },
                                                                    })).validate('service.category.id');
                                                                    form.forgetError('service.category.id');
                                                                    setOpenServiceCategoryPopover(false);
                                                                }}
                                                            >
                                                                {option.label}
                                                                <CheckIcon
                                                                    className={cn(
                                                                        'ml-auto h-4 w-4',
                                                                        option.value === form.data.service.category.id ? 'opacity-100' : 'opacity-0',
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                    {index !== serviceCategories.length - 1 && <CommandSeparator />}
                                                </Fragment>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('service.category.id') && <InputError message={form.errors['service.category.id']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.service')}</Label>
                            <Popover open={openServicePopover} onOpenChange={setOpenServicePopover}>
                                <PopoverTrigger aria-invalid={form.invalid('service.id')} asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.service.id && 'text-muted-foreground',
                                            form.invalid('service.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        <span className="max-w-[300px] truncate md:max-w-[400px] 2xl:max-w-[500px]">
                                            {form.data.service.id
                                                ? (services.find((option) => option.value == form.data.service.id)?.label ??
                                                  t('common:placeholders.select'))
                                                : t(
                                                      form.data.service.category.id
                                                          ? 'common:placeholders.select'
                                                          : 'common:placeholders.select-item',
                                                      {
                                                          item: t('common:labels.category'),
                                                      },
                                                  )}
                                        </span>
                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('service.id') || form.data.service.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput placeholder={`${t('common:labels.search')} ${t('common:labels.service')}...`} className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>{t('common:empty.no_data_found')}</CommandEmpty>
                                            <CommandGroup>
                                                {services.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData((data) => ({
                                                                ...data,
                                                                service: {
                                                                    ...data.service,
                                                                    id: option.value,
                                                                },
                                                            })).validate('service.id');
                                                            form.forgetError('service.id');
                                                            setOpenServicePopover(false);
                                                        }}
                                                    >
                                                        {option.label}
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === form.data.service.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('service.id') && <InputError message={form.errors['service.id']} />}
                        </div>
                        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>{t('admin/common:labels.original-price')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.service.price_configs.display_original_price}
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>{t('admin/common:labels.sell-price')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.service.price_configs.display_sell_price}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.type')}</Label>
                            <div className="grid w-full gap-2">
                                <Select
                                    defaultValue={form.data.service.price_configs.type}
                                    onValueChange={(value) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            price_configs: {
                                                ...form.data.service.price_configs,
                                                type: value,
                                            },
                                        }).validate('service.price_configs.type');

                                        form.forgetError('service.price_configs.type');
                                    }}
                                    onBlur={() => form.validate('service.price_configs.type')}
                                >
                                    <SelectTrigger className="w-full" aria-invalid={form.invalid('service.price_configs.type')}>
                                        <SelectValue placeholder={t('common:placeholders.select')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">{t('admin/common:labels.profit-fixed')}</SelectItem>
                                        <SelectItem value="percentage">{t('admin/common:labels.profit-percentage')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid('service.price_configs.type') && <InputError message={form.errors['service.price_configs.type']} />}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label isRequired>{t('common:labels.custom-price')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={
                                        form.data.service.price_configs.type === 'percentage'
                                            ? '% '
                                            : locales.find((item) => item.locale === i18n.language).currency_symbol + ' '
                                    }
                                    value={form.data.service.price_configs.display_price}
                                    onValueChange={(values) => {
                                        const currentLocale = locales.find((item) => item.locale === i18n.language);

                                        const rate = currentLocale.usd_rate || 1;

                                        const inputValue = values.floatValue || 0;

                                        const originalPrice = form.data.service.price_configs.original_price || 0;

                                        const sellPrice = form.data.service.price_configs.sell_price || 0;

                                        let price = 0;
                                        let profit = 0;
                                        let display_price = 0;
                                        let display_profit = 0;

                                        if (form.data.service.price_configs.type === 'percentage') {
                                            const discountValue = (sellPrice * inputValue) / 100;

                                            price = roundTo8(sellPrice - discountValue);

                                            profit = roundTo8(price - originalPrice);

                                            display_profit = roundTo8(profit * rate);

                                            display_price = inputValue;
                                        } else {
                                            price = roundTo8(inputValue / rate);

                                            profit = roundTo8(price - originalPrice);

                                            display_profit = roundTo8(profit * rate);

                                            display_price = inputValue;
                                        }

                                        form.setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                price_configs: {
                                                    ...data.service.price_configs,
                                                    price,
                                                    profit,
                                                    display_price,
                                                    display_profit,
                                                },
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate('service.price_configs.price')}
                                    aria-invalid={form.invalid('service.price_configs.price')}
                                />
                                {form.invalid('service.price_configs.price') && <InputError message={form.errors['service.price_configs.price']} />}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/common:labels.profit-value')}</Label>
                                <InputMask
                                    allowNegative={true}
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.service.price_configs.display_profit}
                                    aria-invalid={form.invalid('service.price_configs.profit')}
                                    readOnly
                                />
                                {form.invalid('service.price_configs.profit') && <InputError message={form.errors['service.price_configs.profit']} />}
                            </div>
                        </div>
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
