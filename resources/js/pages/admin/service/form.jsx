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
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
    const [openServiceCategoryGroupPopover, setOpenServiceCategoryGroupPopover] = useState(false);
    const [openServiceCategoryPopover, setOpenServiceCategoryPopover] = useState(false);
    const [openServiceBrandPopover, setOpenServiceBrandPopover] = useState(false);
    const [openServiceTypePopover, setOpenServiceTypePopover] = useState(false);
    const [openServiceProviderPopover, setOpenServiceProviderPopover] = useState(false);
    const [serviceCategoryGroups, setServiceCategoryGroups] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [serviceBrands, setServiceBrands] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [serviceProviders, setServiceProviders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.services.update', { target: target.id }) : route('admin.services.store'), {
        _method: method,
        service: {
            provider: {
                id: target.service_provider_id ?? '',
                service_id: target.service_provider_service_id ?? '',
            },
            category: {
                id: target.service_category_id ?? '',
            },
            type: target.type ?? '',
            name: target.name ?? '',
            min: target.min ?? 0,
            max: target.max ?? 0,
            price_configs: {
                original_price: target.original_price ?? 0,
                display_original_price: (target.original_price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                price: target.price ?? 0,
                display_price: (target.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                profit: target.profit ?? 0,
                display_profit: (target.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            },
            other_configs: {
                is_auto_update_price: !!Number(target.is_auto_update_price),
                is_manual_profit: !!Number(target.is_manual_profit),
                is_refill_support: !!Number(target.is_refill_support),
                is_cancel_support: !!Number(target.is_cancel_support),
                refill_days: target.refill_days ?? '',
                refill_available_in_hours: target.refill_available_in_hours ?? '',
            },
            description: target.description ?? '',
        },
    });

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            provider: {
                id: target.service_provider_id ?? '',
                service_id: target.service_provider_service_id ?? '',
            },
            category: {
                id: target.service_category_id ?? '',
            },
            type: target.type ?? '',
            name: target.name ?? '',
            min: target.min ?? '',
            max: target.max ?? '',
            price_configs: {
                original_price: target.original_price ?? 0,
                display_original_price: (target.original_price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                price: target.price ?? 0,
                display_price: (target.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                profit: target.profit ?? 0,
                display_profit: (target.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            },
            other_configs: {
                is_auto_update_price: !!Number(target.is_auto_update_price),
                is_manual_profit: !!Number(target.is_manual_profit),
                is_refill_support: !!Number(target.is_refill_support),
                is_cancel_support: !!Number(target.is_cancel_support),
                refill_days: target.refill_days ?? '',
                refill_available_in_hours: target.refill_available_in_hours ?? '',
            },
            description: target.description ?? '',
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.service || {};
        return (
            u?.type !== initialData.type ||
            u.provider?.id !== initialData.provider.id ||
            u.provider?.service_id !== initialData.provider.service_id ||
            u.category?.id !== initialData.category.id ||
            u?.name !== initialData.name ||
            u?.min !== initialData.min ||
            u?.max !== initialData.max ||
            JSON.stringify(u.price_configs) !== JSON.stringify(initialData.price_configs) ||
            JSON.stringify(u.other_configs) !== JSON.stringify(initialData.other_configs) ||
            u?.description !== initialData.description
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

            const url = isUpdate ? route('admin.services.update', { target: target.id }) : route('admin.services.store');
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

    useEffect(() => {
        form.setData((data) => ({
            _method: method,
            service: {
                provider: {
                    id: target.service_provider_id ?? '',
                    service_id: target.service_provider_service_id ?? '',
                },
                category: {
                    id: target.service_category_id ?? '',
                },
                type: target.type ?? '',
                name: target.name ?? '',
                min: target.min ?? '',
                max: target.max ?? '',
                price_configs: {
                    original_price: target.original_price ?? 0,
                    display_original_price: (target.original_price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    price: target.price ?? 0,
                    display_price: (target.price ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    profit: target.profit ?? 0,
                    display_profit: (target.profit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                },
                other_configs: {
                    is_auto_update_price: !!Number(target.is_auto_update_price),
                    is_manual_profit: !!Number(target.is_manual_profit),
                    is_refill_support: !!Number(target.is_refill_support),
                    is_cancel_support: !!Number(target.is_cancel_support),
                    refill_days: target.refill_days ?? '',
                    refill_available_in_hours: target.refill_available_in_hours ?? '',
                },
                description: target.description ?? '',
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, target?.id]);

    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {target.id
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.service'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.service'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.type')}</Label>
                            <Select
                                defaultValue={form.data.service.type}
                                onValueChange={(value) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        type: value,
                                    });
                                }}
                                onBlur={() => form.validate('service.type')}
                            >
                                <SelectTrigger className="w-full" aria-invalid={form.invalid('service.type')}>
                                    <SelectValue placeholder={t('common:placeholders.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageProps?.serviceTypes?.options.map((item) => (
                                        <SelectItem value={item.value} key={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.invalid('service.type') && <InputError message={form.errors['service.type']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.category')}</Label>
                            <Popover open={openServiceCategoryPopover} onOpenChange={setOpenServiceCategoryPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('service.category.id')} asChild>
                                    {/* <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.service.category.id && 'text-muted-foreground',
                                            form.invalid('service.category.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {form.data.service.category.id ? (
                                            <div className="flex items-center space-x-2">
                                                {selectedCategory.group?.type === 'icon' ? (
                                                    <DynamicIcon className="h-4 w-4" iconName={selectedCategory.group?.icon?.trim()} size={12} />
                                                ) : (
                                                    <span className="-mt-px mr-1.5">{selectedCategory.group?.emoji}</span>
                                                )}
                                                <span>{selectedCategory.label}</span>
                                            </div>
                                        ) : (
                                            t('common:placeholders.select')
                                        )}

                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('service.category.id') || form.data.service.category.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button> */}
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
                                            const options = pageProps?.serviceCategories?.options ?? [];

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
                                            {pageProps?.serviceCategories?.options.map((group, index) => (
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
                                                    {index !== pageProps?.serviceCategories?.options.length - 1 && <CommandSeparator />}
                                                </Fragment>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('service.category.id') && <InputError message={form.errors['service.category.id']} />}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/common:labels.provider')}</Label>
                                <Popover open={openServiceProviderPopover} onOpenChange={setOpenServiceProviderPopover}>
                                    <PopoverTrigger aria-invalid={form.invalid('service.provider.id')} asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                'justify-between',
                                                !form.data.service.provider.id && 'text-muted-foreground',
                                                form.invalid('service.provider.id') && 'text-destructive hover:text-destructive',
                                            )}
                                        >
                                            {form.data.service.provider.id
                                                ? (pageProps?.serviceProviders?.options.find(
                                                      (option) => option.value == form.data.service.provider.id,
                                                  )?.label ?? t('common:placeholders.select'))
                                                : t('common:placeholders.select')}
                                            <ChevronsUpDown
                                                className={cn(
                                                    '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                    (form.invalid('service.provider.id') || form.data.service.provider.id) && 'opacity-100',
                                                )}
                                            />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="popover-content p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder={`${t('common:labels.search')} ${t('admin/common:labels.provider')}...`}
                                                className="h-9"
                                            />
                                            <CommandList>
                                                <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                                <CommandGroup>
                                                    {pageProps?.serviceProviders?.options.map((option) => (
                                                        <CommandItem
                                                            value={option.label}
                                                            key={option.value}
                                                            onSelect={() => {
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    service: {
                                                                        ...data.service,
                                                                        provider: {
                                                                            ...data.service.provider,
                                                                            id: option.value,
                                                                        },
                                                                    },
                                                                })).validate('service.provider.id');
                                                                form.forgetError('service.provider.id');
                                                                setOpenServiceProviderPopover(false);
                                                            }}
                                                        >
                                                            {option.label}
                                                            <CheckIcon
                                                                className={cn(
                                                                    'ml-auto h-4 w-4',
                                                                    option.value === form.data.service.provider.id ? 'opacity-100' : 'opacity-0',
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {form.invalid('service.provider.id') && <InputError message={form.errors['service.provider.id']} />}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/services:labels.service-provider-service-id')}</Label>
                                <Input
                                    value={form.data.service.provider.service_id}
                                    onChange={(e) => {
                                        form.setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                provider: {
                                                    ...data.service.provider,
                                                    service_id: e.target.value,
                                                },
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate('service.provider.service_id')}
                                    aria-invalid={form.invalid('service.provider.service_id')}
                                />
                                {form.invalid('service.provider.service_id') && <InputError message={form.errors['service.provider.service_id']} />}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('common:labels.name')}</Label>
                            <Textarea
                                value={form.data.service.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        service: {
                                            ...data.service,
                                            name: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('service.name')}
                                aria-invalid={form.invalid('service.name')}
                            />
                            {form.invalid('service.name') && <InputError message={form.errors['service.name']} />}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label isRequired>{t('common:labels.minimum')}</Label>
                                <InputMask
                                    min={0}
                                    prefix="# "
                                    value={form.data.service.min}
                                    onValueChange={(values) => {
                                        form.setData((data) => {
                                            return {
                                                ...data,
                                                service: {
                                                    ...data.service,
                                                    min: values.floatValue,
                                                },
                                            };
                                        });
                                    }}
                                    onBlur={() => form.validate('service.min')}
                                    aria-invalid={form.invalid('service.min')}
                                />
                                {form.invalid('service.min') && <InputError message={form.errors['service.min']} />}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t('common:labels.maximum')}</Label>
                                <InputMask
                                    min={0}
                                    prefix="# "
                                    value={form.data.service.max}
                                    onValueChange={(values) => {
                                        form.setData((data) => {
                                            return {
                                                ...data,
                                                service: {
                                                    ...data.service,
                                                    max: values.floatValue,
                                                },
                                            };
                                        });
                                    }}
                                    onBlur={() => form.validate('service.max')}
                                    aria-invalid={form.invalid('service.max')}
                                />
                                {form.invalid('service.max') && <InputError message={form.errors['service.max']} />}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/common:labels.original-price')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.service.price_configs.display_original_price}
                                    onValueChange={(values) => {
                                        const currentLocale = locales.find((item) => item.locale === i18n.language);
                                        const rate = currentLocale.usd_rate || 1;
                                        const displayOriginal = values.floatValue || 0;
                                        const original_price = displayOriginal / rate;

                                        const profitUsd = form.data.service.price_configs.profit || 0;
                                        const priceUsd = original_price + profitUsd;

                                        const display_profit = profitUsd * rate;
                                        const display_price = priceUsd * rate;

                                        form.setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                price_configs: {
                                                    ...data.service.price_configs,
                                                    original_price,
                                                    price: priceUsd,
                                                    profit: profitUsd,
                                                    display_original_price: displayOriginal,
                                                    display_price,
                                                    display_profit,
                                                },
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate('service.price_configs.original_price')}
                                    aria-invalid={form.invalid('service.price_configs.original_price')}
                                />
                                {form.invalid('service.price_configs.original_price') && (
                                    <InputError message={form.errors['service.price_configs.original_price']} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/common:labels.profit-value')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.service.price_configs.display_profit}
                                    onValueChange={(values) => {
                                        const currentLocale = locales.find((item) => item.locale === i18n.language);
                                        const rate = Number(currentLocale?.usd_rate) || 1;

                                        const displayProfit = Number(values.floatValue) || 0;
                                        const profit = displayProfit / rate;

                                        const originalUsd = Number(form.data.service.price_configs.original_price) || 0;
                                        const priceUsd = originalUsd + profit;

                                        const display_original_price = originalUsd * rate;
                                        const display_price = priceUsd * rate;

                                        form.setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                price_configs: {
                                                    ...data.service.price_configs,
                                                    profit,
                                                    price: priceUsd,
                                                    display_profit: displayProfit,
                                                    display_original_price,
                                                    display_price,
                                                },
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate('service.price_configs.original_price')}
                                    aria-invalid={form.invalid('service.price_configs.original_price')}
                                />
                                {form.invalid('service.price_configs.original_price') && (
                                    <InputError message={form.errors['service.price_configs.original_price']} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/common:labels.sell-price')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.service.price_configs.display_price}
                                    aria-invalid={form.invalid('service.price_configs.price')}
                                    readOnly
                                />
                                {form.invalid('service.price_configs.price') && <InputError message={form.errors['service.price_configs.price']} />}
                            </div>
                        </div>
                        {/* <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label isRequired>{t(`admin/common:labels.${group.key}_price`)}</Label>
                                <InputMask
                                    min={0}
                                    prefix="Rp "
                                    value={form.data.service.price_configs[group.key].price}
                                    onValueChange={(values) => {
                                        form.setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                price_configs: {
                                                    ...data.service.price_configs,
                                                    [group.key]: {
                                                        ...data.service.price_configs[group.key],
                                                        price: values.floatValue,
                                                        profit: values.floatValue - (form.data.service.original_price ?? 0),
                                                    },
                                                },
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate(`service.price_configs.${group.key}.price`)}
                                    aria-invalid={form.invalid(`service.price_configs.${group.key}.price`)}
                                />
                                {form.invalid(`service.price_configs.${group.key}.price`) && (
                                    <InputError message={form.errors[`service.price_configs.${group.key}.price`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t(`admin/common:labels.${group.key}_profit`)}</Label>
                                <InputMask
                                    min={0}
                                    prefix="Rp "
                                    value={form.data.service.price_configs[group.key].profit}
                                    aria-invalid={form.invalid(`service.price_configs.${group.key}.profit`)}
                                    allowNegative
                                    readOnly
                                />
                                {form.invalid(`service.price_configs.${group.key}.profit`) && (
                                    <InputError message={form.errors[`service.price_configs.${group.key}.profit`]} />
                                )}
                            </div>
                        </div> */}
                        <div className="grid gap-2">
                            <Label>{t('common:labels.description')}</Label>
                            <Textarea
                                value={form.data.service.description}
                                className="min-h-[200px]"
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        service: {
                                            ...data.service,
                                            description: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('service.description')}
                                aria-invalid={form.invalid('service.description')}
                            />
                            {form.invalid('service.description') && <InputError message={form.errors['service.description']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label>Support</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isRefillSupport"
                                    checked={form.data.service.other_configs.is_refill_support}
                                    onCheckedChange={(checked) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            other_configs: {
                                                ...form.data.service.other_configs,
                                                is_refill_support: checked,
                                            },
                                        });
                                    }}
                                />
                                <Label htmlFor="isRefillSupport">Order Refill</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isCancelSupport"
                                    checked={form.data.service.other_configs.is_cancel_support}
                                    onCheckedChange={(checked) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            other_configs: {
                                                ...form.data.service.other_configs,
                                                is_cancel_support: checked,
                                            },
                                        });
                                    }}
                                />
                                <Label htmlFor="isCancelSupport">Order Cancellation</Label>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Auto Update Price</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="profitAuto"
                                    checked={form.data.service.other_configs.is_auto_update_price}
                                    onCheckedChange={(checked) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            other_configs: {
                                                ...form.data.service.other_configs,
                                                is_auto_update_price: checked,
                                                is_manual_profit: checked ? false : form.data.service.other_configs.is_manual_profit,
                                            },
                                        });
                                    }}
                                />
                                <Label htmlFor="profitAuto">Auto / Sell Price = Buy Price + Provider Profit</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="profitManual"
                                    checked={form.data.service.other_configs.is_manual_profit}
                                    onCheckedChange={(checked) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            other_configs: {
                                                ...form.data.service.other_configs,
                                                is_manual_profit: checked,
                                                is_auto_update_price: checked ? false : form.data.service.other_configs.is_auto_update_price,
                                            },
                                        });
                                    }}
                                />
                                <Label htmlFor="profitManual">Manual / Sell Price = Buy Price + Service Profit</Label>
                            </div>
                        </div>
                        {form.data.service.other_configs.is_refill_support && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label isRequired>Support Duration</Label>
                                    <InputMask
                                        suffix=" Days"
                                        value={form.data.service.other_configs.refill_days}
                                        onValueChange={(values) => {
                                            form.setData('service', {
                                                ...form.data.service,
                                                other_configs: {
                                                    ...form.data.service.other_configs,
                                                    refill_days: values.floatValue,
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate('service.other_configs.refill_days')}
                                        aria-invalid={form.invalid('service.other_configs.refill_days')}
                                    />
                                    {form.invalid('service.other_configs.refill_days') && (
                                        <InputError message={form.errors['service.other_configs.refill_days']} />
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label isRequired>Support Available In</Label>
                                    <InputMask
                                        suffix=" Hours"
                                        value={form.data.service.other_configs.refill_available_in_hours}
                                        onValueChange={(values) => {
                                            form.setData('service', {
                                                ...form.data.service,
                                                other_configs: {
                                                    ...form.data.service.other_configs,
                                                    refill_available_in_hours: values.floatValue,
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate('service.other_configs.refill_available_in_hours')}
                                        aria-invalid={form.invalid('service.other_configs.refill_available_in_hours')}
                                    />
                                    {form.invalid('service.other_configs.refill_available_in_hours') && (
                                        <InputError message={form.errors['service.other_configs.refill_available_in_hours']} />
                                    )}
                                </div>
                            </div>
                        )}
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
