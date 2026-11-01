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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, targets, setTargets }) {
    const [openUserGroupPopover, setOpenUserGroupPopover] = useState(false);
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/users']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => targets?.length > 0, [targets]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.orders.update-batch') : route('admin.orders.store'), {
        order: {
            ids: targets.map((target) => target.id),
            start_counts: targets.map((target) => target.start_count).join('\r\n'),
            remains: targets.map((target) => target.remains).join('\r\n'),
        },
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            order: {
                ids: targets.map((target) => target.id),
                start_counts: targets.map((target) => target.start_count).join('\r\n'),
                remains: targets.map((target) => target.remains).join('\r\n'),
            },
        }),
        [targets],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.order || {};
        return u.ids !== initialData.ids || u.start_counts !== initialData.start_counts;
    }, [form.data, initialData]);

    const handleRequestClose = useCallback(() => {
        if (hasUnsavedChanges()) {
            setIsRequestCloseDialogOpened(true);
        } else {
            form.setErrors([]);
            setTargets([]);
            setIsCreateDialogOpened(false);
        }
    }, [hasUnsavedChanges, form, setTargets, setIsCreateDialogOpened]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);

            const url = isUpdate ? route('admin.orders.update-batch') : route('admin.orders.store');

            axios[method](url, form.data)
                .then((response) => {
                    form.reset();
                    form.setErrors([]);
                    setTargets([]);
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
        [isUpdate, targets?.length, method, form, setTargets, setIsCreateDialogOpened, fetchData, tableStateRef],
    );

    useEffect(() => {
        form.setData((data) => ({
            order: {
                ids: targets.map((target) => target.id),
                start_counts: targets.map((target) => target.start_count).join('\r\n'),
                remains: targets.map((target) => target.remains).join('\r\n'),
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, targets?.length]);
    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-4xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {targets?.length > 0
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: `${t('common:labels.start-count')} & ${t('common:labels.remains')}`,
                                      })}` //   })} #${targets.map((target) => target.id).join(', ')}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.order'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label>{t('common:labels.order-id')}</Label>
                            <Input value={targets.map((target) => target.id).join(', ')} readOnly />
                        </div>
                        <div className="grid w-full gap-2">
                            <Label>{t('common:labels.start-count')}</Label>
                            <Textarea
                                className="min-h-72"
                                placeholder={'1000\n2000\n3000'}
                                value={form.data.order.start_counts}
                                onChange={(event) => {
                                    form.setData((data) => ({
                                        ...data,
                                        order: {
                                            ...data.order,
                                            start_counts: event.target.value,
                                        },
                                    })).validate('order.start_counts');
                                }}
                                onBlur={() => form.validate('order.start_counts')}
                                aria-invalid={form.invalid('order.start_counts')}
                            />
                            {form.invalid('order.start_counts') && <InputError message={form.errors['order.start_counts']} />}
                        </div>
                        <div className="grid w-full gap-2">
                            <Label>{t('common:labels.remains')}</Label>
                            <Textarea
                                className="min-h-72"
                                placeholder={'1000\n2000\n3000'}
                                value={form.data.order.remains}
                                onChange={(event) => {
                                    form.setData((data) => ({
                                        ...data,
                                        order: {
                                            ...data.order,
                                            remains: event.target.value,
                                        },
                                    })).validate('order.remains');
                                }}
                                onBlur={() => form.validate('order.remains')}
                                aria-invalid={form.invalid('order.remains')}
                            />
                            {form.invalid('order.remains') && <InputError message={form.errors['order.remains']} />}
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
                                setTargets([]);
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
