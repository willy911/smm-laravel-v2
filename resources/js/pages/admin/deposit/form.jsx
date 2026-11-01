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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/payment-methods']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);
    const [openUserPopover, setOpenUserPopover] = useState(false);
    const [openPaymentMethodPopover, setOpenPaymentMethodPopover] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.deposits.update', { target: target.id }) : route('admin.deposits.store'), {
        _method: method,
        user: {
            id: target.user_id ?? '',
        },
        payment_method: {
            id: target.payment_method_id ?? '',
        },
        deposit: {
            amount: target.amount ?? 0,
            display_amount: (target.amount ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            bonus: target.bonus ?? 0,
            display_bonus: (target.bonus ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
        },
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            user: {
                id: target.user_id ?? '',
            },
            payment_method: {
                id: target.payment_method_id ?? '',
            },
            deposit: {
                amount: target.amount ?? 0,
                display_amount: (target.amount ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                bonus: target.bonus ?? 0,
                display_bonus: (target.bonus ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data || {};
        return (
            u.user.id !== initialData.user.id ||
            u.payment_method.id !== initialData.payment_method.id ||
            u.deposit.amount !== initialData.deposit.amount ||
            u.deposit.bonus !== initialData.deposit.bonus
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

            const url = isUpdate ? route('admin.deposits.update', { target: target.id }) : route('admin.deposits.store');

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
                user: {
                    id: target.user_id ?? '',
                },
                payment_method: {
                    id: target.payment_method_id ?? '',
                },
                deposit: {
                    amount: target.amount ?? 0,
                    display_amount: (target.amount ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    bonus: target.bonus ?? 0,
                    display_bonus: (target.bonus ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
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
                                          item: t('common:labels.deposit'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.deposit'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="hidden gap-2">
                            <Label isRequired>{t('common:labels.payment-method')}</Label>
                            <Popover open={openPaymentMethodPopover} onOpenChange={setOpenPaymentMethodPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('payment_method.id')} asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.payment_method.id && 'text-muted-foreground',
                                            form.invalid('payment_method.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {form.data.payment_method.id
                                            ? (pageProps?.paymentMethods?.options.find((option) => option.value == form.data.payment_method.id)
                                                  ?.label ?? t('common:placeholders.select'))
                                            : t('common:placeholders.select')}
                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('payment_method.id') || form.data.payment_method.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder={`${t('common:labels.search')} ${t('common:labels.payment-method')}...`}
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                            <CommandGroup>
                                                {pageProps?.paymentMethods?.options.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData((data) => ({
                                                                ...data,
                                                                payment_method: {
                                                                    ...data.payment_method,
                                                                    id: option.value,
                                                                },
                                                            })).validate('payment_method.id');
                                                            form.forgetError('payment_method.id');
                                                            setOpenPaymentMethodPopover(false);
                                                        }}
                                                    >
                                                        {option.label}
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === form.data.payment_method.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('payment_method.id') && <InputError message={form.errors['payment_method.id']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.user')}</Label>
                            <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('user.id')} asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.user.id && 'text-muted-foreground',
                                            form.invalid('user.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {form.data.user.id
                                            ? (pageProps?.users?.options.find((option) => option.value == form.data.user.id)?.label ??
                                              t('common:placeholders.select'))
                                            : t('common:placeholders.select')}
                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('user.id') || form.data.user.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput placeholder={`${t('common:labels.search')} ${t('common:labels.user')}...`} className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                            <CommandGroup>
                                                {pageProps?.users?.options.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData((data) => ({
                                                                ...data,
                                                                user: {
                                                                    ...data.user,
                                                                    id: option.value,
                                                                },
                                                            })).validate('user.id');
                                                            form.forgetError('user.id');
                                                            setOpenUserPopover(false);
                                                        }}
                                                    >
                                                        {option.label}
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === form.data.user.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('user.id') && <InputError message={form.errors['user.id']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.amount')}</Label>
                            <InputMask
                                min={0}
                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                value={form.data.deposit.display_amount}
                                onValueChange={(values) => {
                                    const amount = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                    form.setData((data) => ({
                                        ...data,
                                        deposit: {
                                            ...data.deposit,
                                            amount,
                                            display_amount: values.floatValue,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate(`deposit.amount`)}
                                aria-invalid={form.invalid(`deposit.display_amount`)}
                            />
                            {form.invalid('deposit.display_amount') && <InputError message={form.errors['deposit.display_amount']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.bonus')}</Label>
                            <InputMask
                                min={0}
                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                value={form.data.deposit.display_bonus}
                                onValueChange={(values) => {
                                    const bonus = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                    form.setData((data) => ({
                                        ...data,
                                        deposit: {
                                            ...data.deposit,
                                            bonus,
                                            display_bonus: values.floatValue,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate(`deposit.bonus`)}
                                aria-invalid={form.invalid(`deposit.display_bonus`)}
                            />
                            {form.invalid('deposit.display_bonus') && <InputError message={form.errors['deposit.display_bonus']} />}
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
