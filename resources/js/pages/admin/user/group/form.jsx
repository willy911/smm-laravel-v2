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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const [openUserGroupPopover, setOpenUserGroupPopover] = useState(false);
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.users.groups.update', { target: target.id }) : route('admin.users.groups.store'), {
        user: {
            group: {
                name: target.name ?? '',
                minimum_deposit: target.minimum_deposit ?? 0,
                display_minimum_deposit: (target.minimum_deposit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                is_api_access_enabled: target.is_api_access_enabled ?? false,
            },
        },
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            group: {
                name: target.name ?? '',
                minimum_deposit: target.minimum_deposit ?? 0,
                display_minimum_deposit: (target.minimum_deposit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                is_api_access_enabled: target.is_api_access_enabled ?? false,
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.user || {};
        return (
            u.group?.name !== initialData.group.name ||
            u.group?.minimum_deposit !== initialData.group.minimum_deposit ||
            u.group?.is_api_access_enabled !== initialData.group.is_api_access_enabled
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

            const url = isUpdate ? route('admin.users.groups.update', { target: target.id }) : route('admin.users.groups.store');

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
            user: {
                group: {
                    name: target.name ?? '',
                    minimum_deposit: target.minimum_deposit ?? 0,
                    display_minimum_deposit: (target.minimum_deposit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    is_api_access_enabled: target.is_api_access_enabled ?? false,
                },
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, target?.id]);

    useEffect(() => {
        if (isCreateDialogOpened && target?.id !== undefined) {
            form.setData((data) => ({
                ...data,
                user: {
                    ...data.user,
                    group: {
                        ...data.user.group,
                        display_minimum_deposit:
                            (form.data.user.group.minimum_deposit ?? 0) * (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                    },
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
                                          item: t('common:labels.group'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.group'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.name')}</Label>
                            <Input
                                value={form.data.user.group.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        user: {
                                            ...data.user,
                                            group: {
                                                ...data.user.group,
                                                name: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('user.group.name')}
                                aria-invalid={form.invalid('user.group.name')}
                            />
                            {form.invalid('user.group.name') && <InputError message={form.errors['user.group.name']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.min-deposit')}</Label>
                            <InputMask
                                min={0}
                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                value={form.data.user.group.display_minimum_deposit}
                                onValueChange={(values) => {
                                    const minimum_deposit = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                    form.setData((data) => ({
                                        ...data,
                                        user: {
                                            ...data.user,
                                            group: {
                                                ...data.user.group,
                                                minimum_deposit,
                                                display_minimum_deposit: values.floatValue,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('user.group.minimum_deposit')}
                                aria-invalid={form.invalid('user.group.minimum_deposit')}
                            />
                            {form.invalid('user.group.minimum_deposit') && <InputError message={form.errors['user.group.minimum_deposit']} />}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isAPIAccessEnabled"
                                checked={form.data.user.group.is_api_access_enabled}
                                onCheckedChange={(checked) => {
                                    form.setData((data) => ({
                                        user: {
                                            ...data.user,
                                            group: {
                                                ...data.user.group,
                                                is_api_access_enabled: checked,
                                            },
                                        },
                                    }));
                                }}
                            />
                            <label
                                htmlFor="isAPIAccessEnabled"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {t('admin/common:labels.is-api-access-enabled')}
                            </label>
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
