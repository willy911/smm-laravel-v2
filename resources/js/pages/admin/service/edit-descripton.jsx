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
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export default function EditDescription({
    pageProps,
    isEditDescriptionDialogOpened,
    setIsEditDescriptionDialogOpened,
    fetchData,
    tableStateRef,
    targets,
    setTargets,
}) {
    const [openUserGroupPopover, setOpenUserGroupPopover] = useState(false);
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/users']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);
    const [openServiceDescriptionPopover, setOpenServiceDescriptionPopover] = useState(false);

    const isUpdate = useMemo(() => targets?.length > 0, [targets]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.services.update-batch-description') : route('admin.services.store'), {
        services: targets,
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            services: targets,
        }),
        [targets],
    );

    const hasUnsavedChanges = useCallback(() => {
        return JSON.stringify(form.data.services) !== JSON.stringify(initialData.services);
    }, [form.data.services, initialData.services]);

    const handleRequestClose = useCallback(() => {
        if (hasUnsavedChanges()) {
            setIsRequestCloseDialogOpened(true);
        } else {
            form.setErrors([]);
            setTargets([]);
            setIsEditDescriptionDialogOpened(false);
        }
    }, [hasUnsavedChanges, form, setTargets, setIsEditDescriptionDialogOpened]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);

            const url = isUpdate ? route('admin.services.update-batch-description') : route('admin.services.store');

            axios[method](url, form.data)
                .then((response) => {
                    form.reset();
                    form.setErrors([]);
                    setTargets([]);
                    setIsEditDescriptionDialogOpened(false);
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
        [isUpdate, targets?.length, method, form, setTargets, setIsEditDescriptionDialogOpened, fetchData, tableStateRef],
    );

    useEffect(() => {
        form.setData((data) => ({
            services: targets,
        }));
        form.setErrors([]);
    }, [isEditDescriptionDialogOpened, targets?.length]);
    return (
        <>
            <Dialog open={isEditDescriptionDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-4xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {targets?.length > 0
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.description'),
                                      })}` //   })} #${targets.map((target) => target.id).join(', ')}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.order'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-4">
                            {form.data.services.map((item, index) => (
                                <div className="grid gap-3" key={index}>
                                    <div className="grid gap-2">
                                        <Label>{t('common:labels.id')}</Label>
                                        <Input value={item.id} readOnly />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t('common:labels.description')}</Label>
                                        <Textarea
                                            className="min-h-24"
                                            placeholder={t('common:labels.description')}
                                            value={item.description || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                form.setData((data) => ({
                                                    ...data,
                                                    services: data.services.map((service, serviceIndex) =>
                                                        serviceIndex === index
                                                            ? {
                                                                  ...service,
                                                                  description: value,
                                                              }
                                                            : service,
                                                    ),
                                                }));
                                            }}
                                            onBlur={() => form.validate(`services.${index}.description`)}
                                            aria-invalid={form.invalid(`services.${index}.description`)}
                                        />

                                        {form.invalid(`services.${index}.description`) && (
                                            <InputError message={form.errors[`services.${index}.description`]} />
                                        )}
                                    </div>
                                </div>
                            ))}
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
                                setIsEditDescriptionDialogOpened(false);
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
