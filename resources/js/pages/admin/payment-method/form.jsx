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
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { paymentMethodPaymentGatewayOptions, paymentMethodTypeOptions } from '@/enums/payment-method';
import { toast } from '@/hooks/use-toast';
import { cn, getFile, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/payment-methods']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.payment-methods.update', { target: target.id }) : route('admin.payment-methods.store'), {
        _method: method,
        payment_method: {
            type: target.type ?? '',
            name: target.name ?? '',
            minimum: target.minimum ?? 0,
            display_minimum: (target.minimum ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            maximum: target.maximum ?? 0,
            display_maximum: (target.maximum ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            admin_fee_configs: target.admin_fee_configs ?? {
                type: 'fixed',
                display_value: 0,
                value: 0,
            },
            bonus_configs: target.bonus_configs ?? [
                {
                    min: 0.00006,
                    display_min: 0.00006 * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    max: 0.6,
                    display_max: 0.6 * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    bonus: 10,
                },
            ],
            payment_gateway: target.payment_gateway ?? '',
            payment_gateway_payment_code: target.payment_gateway_payment_code ?? '',
            payment_target: target.payment_target ?? '',
            logo: '',
        },
    });

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            type: target.type ?? '',
            name: target.name ?? '',
            minimum: target.minimum ?? 0,
            display_minimum: (target.minimum ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            maximum: target.maximum ?? 0,
            display_maximum: (target.maximum ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            admin_fee_configs: target.admin_fee_configs ?? {
                type: 'fixed',
                display_value: 0,
                value: 0,
            },
            bonus_configs: target.bonus_configs ?? [
                {
                    min: 0.00006,
                    display_min: 0.00006 * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    max: 0.6,
                    display_max: 0.6 * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    bonus: 10,
                },
            ],
            payment_gateway: target.payment_gateway ?? '',
            payment_gateway_payment_code: target.payment_gateway_payment_code ?? '',
            payment_target: target.payment_target ?? '',
            logo: '',
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.payment_method || {};
        return (
            u.type !== initialData.type ||
            u.name !== initialData.name ||
            u.minimum !== initialData.minimum ||
            u.maximum !== initialData.maximum ||
            JSON.stringify(u.admin_fee_configs) !== JSON.stringify(initialData.admin_fee_configs) ||
            JSON.stringify(u.bonus_configs) !== JSON.stringify(initialData.bonus_configs) ||
            u.payment_gateway !== initialData.payment_gateway ||
            u.payment_gateway_payment_code !== initialData.payment_gateway_payment_code ||
            u.payment_target !== initialData.payment_target ||
            u.logo !== initialData.logo
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

            const url = isUpdate ? route('admin.payment-methods.update', { target: target.id }) : route('admin.payment-methods.store');

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
        if (isCreateDialogOpened && target?.id !== undefined) {
            form.setData((data) => ({
                ...data,
                payment_method: {
                    ...data.payment_method,
                    display_minimum: (form.data.payment_method.minimum ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    display_maximum: (form.data.payment_method.maximum ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    admin_fee_configs: {
                        ...data.payment_method.admin_fee_configs,
                        display_value:
                            form.data.payment_method.admin_fee_configs.type === 'fixed'
                                ? form.data.payment_method.admin_fee_configs.value *
                                  (locales.find((item) => item.locale === i18n.language).usd_rate || 1)
                                : form.data.payment_method.admin_fee_configs.value,
                    },
                    bonus_configs: form.data.payment_method.bonus_configs.map((config) => ({
                        ...config,
                        display_min: config.min * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                        display_max: config.max * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    })),
                },
            }));
        }
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
                                          item: t('common:labels.payment-method'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.payment-method'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        {target?.id !== undefined && target?.logo && (
                            <div className="rounded-lg border py-4">
                                <img src={getFile('payment-methods', target.logo)} alt="" className="mx-auto h-32 w-32 rounded-md object-contain" />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label isRequired={target?.id ? false : true}>{t('common:labels.logo')}</Label>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-pointer" asChild>
                                        <Input
                                            type="file"
                                            accept=".png, .jpg, .jpeg, .svg, .webp, .avif"
                                            onChange={(e) => {
                                                form.setData('payment_method', {
                                                    ...form.data.payment_method,
                                                    logo: e.target.files[0],
                                                });
                                                form.forgetError('payment_method.logo');
                                            }}
                                            onBlur={() => form.validate('payment_method.logo')}
                                            aria-invalid={form.invalid('payment_method.logo')}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content tooltip-content">
                                        <span>
                                            <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                        </span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {form.invalid('payment_method.logo') && <InputError message={form.errors['payment_method.logo']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.type')}</Label>
                            <Select
                                defaultValue={form.data.payment_method.type}
                                onValueChange={(value) => {
                                    form.setData('payment_method', {
                                        ...form.data.payment_method,
                                        type: value,
                                    }).validate('payment_method.type');
                                    form.forgetError('payment_method.type');
                                }}
                                onBlur={() => form.validate('payment_method.type')}
                            >
                                <SelectTrigger className="w-full" aria-invalid={form.invalid('payment_method.type')}>
                                    <SelectValue placeholder={t('common:placeholders.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethodTypeOptions.map((option) => (
                                        <SelectItem value={option.value} key={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.invalid('payment_method.type') && <InputError message={form.errors['payment_method.type']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.name')}</Label>
                            <Input
                                value={form.data.payment_method.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        payment_method: {
                                            ...data.payment_method,
                                            name: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('payment_method.name')}
                                aria-invalid={form.invalid('payment_method.name')}
                            />
                            {form.invalid('payment_method.name') && <InputError message={form.errors['payment_method.name']} />}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label isRequired>{t('common:labels.minimum')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.payment_method.display_minimum}
                                    onValueChange={(values) => {
                                        const minimum = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                        form.setData((data) => ({
                                            ...data,
                                            payment_method: {
                                                ...data.payment_method,
                                                minimum,
                                                display_minimum: values.floatValue,
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate(`payment_method.minimum`)}
                                    aria-invalid={form.invalid(`payment_method.minimum`)}
                                />
                                {form.invalid('payment_method.minimum') && <InputError message={form.errors['payment_method.minimum']} />}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>{t('common:labels.maximum')}</Label>
                                <InputMask
                                    min={0}
                                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                    value={form.data.payment_method.display_maximum}
                                    onValueChange={(values) => {
                                        const maximum = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                        form.setData((data) => ({
                                            ...data,
                                            payment_method: {
                                                ...data.payment_method,
                                                maximum,
                                                display_maximum: values.floatValue,
                                            },
                                        }));
                                    }}
                                    onBlur={() => form.validate(`payment_method.maximum`)}
                                    aria-invalid={form.invalid(`payment_method.maximum`)}
                                />
                                {form.invalid('payment_method.maximum') && <InputError message={form.errors['payment_method.maximum']} />}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('admin/payment-methods:labels.bonus-configs')}</Label>
                            {form.data.payment_method.bonus_configs.map((config, index) => (
                                <div
                                    key={index}
                                    className="bg-card relative mb-3 rounded-2xl border border-dashed p-3 pt-2 shadow-sm transition hover:shadow-md"
                                >
                                    {/* Isi form */}
                                    <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {/* Dari */}
                                        <div className="grid gap-2">
                                            <Label isRequired>{t('common:labels.minimum')}</Label>
                                            <InputMask
                                                min={0}
                                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                                value={config.display_min}
                                                onValueChange={(values) => {
                                                    form.setData((data) => {
                                                        const updated = [...data.payment_method.bonus_configs];
                                                        updated[index].min =
                                                            values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                                        updated[index].display_min = values.floatValue;
                                                        return { ...data, payment_method: { ...data.payment_method, bonus_configs: updated } };
                                                    });
                                                }}
                                                onBlur={() => form.validate(`payment_method.bonus_configs.${index}.min`)}
                                                aria-invalid={form.invalid(`payment_method.bonus_configs.${index}.min`)}
                                            />
                                            {form.invalid(`payment_method.bonus_configs.${index}.min`) && (
                                                <InputError message={form.errors[`payment_method.bonus_configs.${index}.min`]} />
                                            )}
                                        </div>

                                        {/* Sampai */}
                                        <div className="grid gap-2">
                                            <Label isRequired>{t('common:labels.maximum')}</Label>
                                            <InputMask
                                                min={0}
                                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                                value={config.display_max}
                                                onValueChange={(values) => {
                                                    form.setData((data) => {
                                                        const updated = [...data.payment_method.bonus_configs];
                                                        updated[index].max =
                                                            values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                                        updated[index].display_max = values.floatValue;
                                                        return { ...data, payment_method: { ...data.payment_method, bonus_configs: updated } };
                                                    });
                                                }}
                                                onBlur={() => form.validate(`payment_method.bonus_configs.${index}.max`)}
                                                aria-invalid={form.invalid(`payment_method.bonus_configs.${index}.max`)}
                                            />
                                            {form.invalid(`payment_method.bonus_configs.${index}.max`) && (
                                                <InputError message={form.errors[`payment_method.bonus_configs.${index}.max`]} />
                                            )}
                                        </div>

                                        {/* Nilai Bonus */}
                                        <div className="grid gap-2">
                                            <Label>{t('admin/payment-methods:labels.bonus-value')}</Label>
                                            <InputMask
                                                min={0}
                                                suffix=" %"
                                                value={config.bonus}
                                                onValueChange={(values) =>
                                                    form.setData((data) => {
                                                        const updated = [...data.payment_method.bonus_configs];
                                                        updated[index].bonus = values.floatValue;
                                                        return { ...data, payment_method: { ...data.payment_method, bonus_configs: updated } };
                                                    })
                                                }
                                                onBlur={() => form.validate(`payment_method.bonus_configs.${index}.bonus`)}
                                                aria-invalid={form.invalid(`payment_method.bonus_configs.${index}.bonus`)}
                                            />
                                            {form.invalid(`payment_method.bonus_configs.${index}.bonus`) && (
                                                <InputError message={form.errors[`payment_method.bonus_configs.${index}.bonus`]} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Tombol Hapus di bawah */}
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="flex w-full items-center gap-1"
                                            onClick={() =>
                                                form.setData((data) => ({
                                                    ...data,
                                                    payment_method: {
                                                        ...data.payment_method,
                                                        bonus_configs: data.payment_method.bonus_configs.filter((_, i) => i !== index),
                                                    },
                                                }))
                                            }
                                            disabled={index === 0}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            {t('admin/common:actions.delete-item', {
                                                item: t('common:labels.bonus'),
                                            })}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Tombol Tambah */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    form.setData((data) => ({
                                        ...data,
                                        payment_method: {
                                            ...data.payment_method,
                                            bonus_configs: [...data.payment_method.bonus_configs, { min: 0, max: 0, bonus: 0 }],
                                        },
                                    }))
                                }
                            >
                                + Tambah Bonus
                            </Button>
                        </div>

                        {[{ key: 'general', label: t('admin/payment-methods:labels.admin-fee-configs') }].map((group) => (
                            <div className="grid gap-2" key={group.key}>
                                <Label isRequired>{group.label}</Label>
                                <div className="grid grid-cols-12">
                                    <div className="col-span-6 grid w-full gap-2">
                                        <Select
                                            defaultValue={form.data.payment_method.admin_fee_configs.type}
                                            onValueChange={(value) => {
                                                form.setData((data) => ({
                                                    ...data,
                                                    payment_method: {
                                                        ...data.payment_method,
                                                        admin_fee_configs: {
                                                            ...data.payment_method.admin_fee_configs,
                                                            type: value,
                                                        },
                                                    },
                                                })).validate(`payment_method.admin_fee_configs.type`);
                                                form.forgetError(`payment_method.admin_fee_configs.type`);
                                            }}
                                            onBlur={() => form.validate(`payment_method.admin_fee_configs.type`)}
                                        >
                                            <SelectTrigger
                                                className="w-full rounded-r-none"
                                                aria-invalid={form.invalid(`payment_method.admin_fee_configs.type`)}
                                            >
                                                <SelectValue placeholder={t('common:placeholders.select')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">{t('admin/common:labels.profit-fixed')}</SelectItem>
                                                <SelectItem value="percentage">{t('admin/common:labels.profit-percentage')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.invalid(`payment_method.admin_fee_configs.type`) && (
                                            <InputError message={form.errors[`payment_method.admin_fee_configs.type`]} />
                                        )}
                                    </div>
                                    <div className="col-span-6 grid w-full gap-2">
                                        <InputMask
                                            min={0}
                                            prefix={
                                                form.data.payment_method.admin_fee_configs.type === 'fixed'
                                                    ? locales.find((item) => item.locale === i18n.language).currency_symbol + ' '
                                                    : ''
                                            }
                                            suffix={form.data.payment_method.admin_fee_configs.type === 'percentage' ? ' %' : ''}
                                            value={form.data.payment_method.admin_fee_configs.display_value}
                                            className="rounded-l-none border-l-0"
                                            onValueChange={(values) => {
                                                form.setData((data) => ({
                                                    ...data,
                                                    payment_method: {
                                                        ...data.payment_method,
                                                        admin_fee_configs: {
                                                            ...data.payment_method.admin_fee_configs,
                                                            value:
                                                                form.data.payment_method.admin_fee_configs.type === 'fixed'
                                                                    ? values.floatValue /
                                                                      locales.find((item) => item.locale === i18n.language).usd_rate
                                                                    : values.floatValue,
                                                            display_value: values.floatValue,
                                                        },
                                                    },
                                                }));
                                            }}
                                            onBlur={() => form.validate(`payment_method.admin_fee_configs.value`)}
                                            aria-invalid={form.invalid(`payment_method.admin_fee_configs.value`)}
                                        />
                                        {form.invalid(`payment_method.admin_fee_configs.value`) && (
                                            <InputError message={form.errors[`payment_method.admin_fee_configs.value`]} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="grid gap-2">
                            <Label>{t('admin/payment-methods:labels.payment-target')}</Label>
                            <Input
                                placeholder="123XXXX AN WUZZ PANEL"
                                value={form.data.payment_method.payment_target}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        payment_method: {
                                            ...data.payment_method,
                                            payment_target: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('payment_method.payment_target')}
                                aria-invalid={form.invalid('payment_method.payment_target')}
                            />
                            {form.invalid('payment_method.payment_target') && <InputError message={form.errors['payment_method.payment_target']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin/payment-methods:labels.payment-gateway')}</Label>
                            <Select
                                defaultValue={form.data.payment_method.payment_gateway}
                                onValueChange={(value) => {
                                    form.setData('payment_method', {
                                        ...form.data.payment_method,
                                        payment_gateway: value,
                                    }).validate('payment_method.payment_gateway');
                                    form.forgetError('payment_method.payment_gateway');
                                }}
                                onBlur={() => form.validate('payment_method.payment_gateway')}
                            >
                                <SelectTrigger className="w-full" aria-invalid={form.invalid('payment_method.payment_gateway')}>
                                    <SelectValue placeholder={t('common:placeholders.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>{t('common:placeholders.select')}</SelectItem>
                                    {paymentMethodPaymentGatewayOptions.map((option) => (
                                        <SelectItem value={option.value} key={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.invalid('payment_method.payment_gateway') && <InputError message={form.errors['payment_method.payment_gateway']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin/payment-methods:labels.payment-gateway-payment-code')}</Label>
                            <Input
                                placeholder="QRIS"
                                value={form.data.payment_method.payment_gateway_payment_code}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        payment_method: {
                                            ...data.payment_method,
                                            payment_gateway_payment_code: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('payment_method.payment_gateway_payment_code')}
                                aria-invalid={form.invalid('payment_method.payment_gateway_payment_code')}
                            />
                            {form.invalid('payment_method.payment_gateway_payment_code') && (
                                <InputError message={form.errors['payment_method.payment_gateway_payment_code']} />
                            )}
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
