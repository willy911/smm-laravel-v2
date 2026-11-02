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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn, formatDate, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const [openAdminGroupPopover, setOpenAdminGroupPopover] = useState(false);
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/users']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.locales.update', { target: target.id }) : route('admin.locales.store'), {
        locale: {
            currency_code: target.currency_code ?? '',
            currency_symbol: target.currency_symbol ?? '',
            language_name: target.language_name ?? '',
            usd_rate: target.usd_rate ?? '',
            usd_rate_buy: target.usd_rate_buy ?? '',
            kurs_auto: Boolean(Number(target.kurs_auto ?? 1)),
        },
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            currency_code: target.currency_code ?? '',
            currency_symbol: target.currency_symbol ?? '',
            language_name: target.language_name ?? '',
            usd_rate: target.usd_rate ?? '',
            usd_rate_buy: target.usd_rate_buy ?? '',
            kurs_auto: Boolean(Number(target.kurs_auto ?? 1)),
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.locale || {};
        return (
            u.currency_code !== initialData.currency_code ||
            u.currency_symbol !== initialData.currency_symbol ||
            u.language_name !== initialData.language_name ||
            u.usd_rate !== initialData.usd_rate ||
            u.usd_rate_buy !== initialData.usd_rate_buy ||
            u.kurs_auto !== initialData.kurs_auto
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

            const url = isUpdate ? route('admin.locales.update', { target: target.id }) : route('admin.locales.store');

            axios[method](url, form.data)
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
            locale: {
                currency_code: target.currency_code ?? '',
                currency_symbol: target.currency_symbol ?? '',
                language_name: target.language_name ?? '',
                usd_rate: target.usd_rate ?? '',
                usd_rate_buy: target.usd_rate_buy ?? '',
                kurs_auto: Boolean(Number(target.kurs_auto ?? 1)),
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
                                          item: t('common:labels.currency'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.currency'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.currency')}</Label>
                            <Input
                                value={`${form.data.locale.language_name} - ${form.data.locale.currency_code} - ${form.data.locale.currency_symbol}`}
                                readOnly
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>USD Rate</Label>
                            <NumericFormat
                                data-slot="input"
                                className={cn(
                                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                                    'focus-visible:border-ring focus-visible:ring-ring/50 dark:focus-visible:ring-ring/70 aria-invalid:ring-destructive/50 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/50 focus-visible:ring-[3px] aria-invalid:border-2',
                                )}
                                decimalSeparator={','}
                                decimalScale={8}
                                prefix={`${form.data.locale.currency_symbol} `}
                                thousandSeparator={'.'}
                                value={form.data.locale.usd_rate}
                                onValueChange={(values) => {
                                    form.setData((data) => ({
                                        ...data,
                                        locale: {
                                            ...data.locale,
                                            usd_rate: values.floatValue,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate(`locale.usd_rate`)}
                                aria-invalid={form.invalid(`locale.usd_rate`)}
                            />
                            {form.invalid('locale.usd_rate') && <InputError message={form.errors['locale.usd_rate']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin/common:labels.usd-buy-rate')}</Label>
                            <NumericFormat
                                data-slot="input"
                                className={cn(
                                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                                    'focus-visible:border-ring focus-visible:ring-ring/50 dark:focus-visible:ring-ring/70 aria-invalid:ring-destructive/50 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/50 focus-visible:ring-[3px] aria-invalid:border-2',
                                )}
                                decimalSeparator={','}
                                decimalScale={8}
                                prefix={`${form.data.locale.currency_symbol} `}
                                thousandSeparator={'.'}
                                value={form.data.locale.usd_rate_buy}
                                onValueChange={(values) => {
                                    form.setData((data) => ({
                                        ...data,
                                        locale: {
                                            ...data.locale,
                                            usd_rate_buy: values.floatValue,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate(`locale.usd_rate_buy`)}
                                aria-invalid={form.invalid(`locale.usd_rate_buy`)}
                            />
                            {form.invalid('locale.usd_rate_buy') && <InputError message={form.errors['locale.usd_rate_buy']} />}
                        </div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-1.5">
                                <Label htmlFor="localeKursAuto">{t('admin/common:labels.kurs-auto-sync')}</Label>
                                <p className="text-muted-foreground text-xs">{t('admin/common:labels.kurs-auto-sync-description')}</p>
                            </div>
                            <Switch
                                id="localeKursAuto"
                                checked={form.data.locale.kurs_auto}
                                onCheckedChange={(checked) => {
                                    form.setData((data) => ({
                                        ...data,
                                        locale: {
                                            ...data.locale,
                                            kurs_auto: checked,
                                        },
                                    }));
                                }}
                            />
                        </div>
                        {isUpdate && target.kurs_synced_at && (
                            <p className="text-muted-foreground text-xs">
                                {t('admin/common:labels.kurs-last-sync')}: {formatDate({ date: target.kurs_synced_at })}
                                {target.kurs_source ? ` — ${target.kurs_source}` : ''}
                            </p>
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
