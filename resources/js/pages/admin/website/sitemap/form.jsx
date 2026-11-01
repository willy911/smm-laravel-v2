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
import { Label } from '@/components/ui/label';
import TextEditor from '@/components/ui/text-editor';
import { toast } from '@/hooks/use-toast';
import { cn, getFile, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { t } = useTranslation(['admin/common', 'admin/products']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.websites.sitemaps.update', { target: target.id }) : route('admin.websites.sitemaps.store'), {
        _method: method,
        website: {
            sitemap: {
                title: target.title ?? '',
                content: target.content ?? '',
                is_public: !!Number(target.is_public ?? 0),
            },
        },
    });

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            sitemap: {
                title: target.title ?? '',
                content: target.content ?? '',
                is_public: !!Number(target.is_public ?? 0),
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.website || {};
        return (
            u.sitemap.title !== initialData.sitemap.title ||
            u.sitemap.content !== initialData.sitemap.content ||
            u.sitemap.is_public !== initialData.sitemap.is_public
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

            const url = isUpdate ? route('admin.websites.sitemaps.update', { target: target.id }) : route('admin.websites.sitemaps.store');

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
            website: {
                sitemap: {
                    title: target.title ?? '',
                    content: target.content ?? '',
                    is_public: !!Number(target.is_public ?? 0),
                },
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
                                          item: t('common:labels.sitemap'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.sitemap'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        {target?.id !== undefined && target?.banner && (
                            <div className="rounded-lg border py-4">
                                <img src={getFile('website-sitemap', target.banner)} alt="" className="mx-auto h-32 w-80 rounded-md object-cover" />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.title')}</Label>
                            <Input
                                value={form.data.website.sitemap.title}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            sitemap: {
                                                ...data.website.sitemap,
                                                title: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('website.sitemap.title')}
                                aria-invalid={form.invalid('website.sitemap.title')}
                            />
                            {form.invalid('website.sitemap.title') && <InputError message={form.errors['website.sitemap.title']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.content')}</Label>
                            <TextEditor
                                value={form.data.website.sitemap.content}
                                onEditorChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            sitemap: {
                                                ...data.website.sitemap,
                                                content: e,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('website.sitemap.content')}
                                aria-invalid={form.invalid('website.sitemap.content')}
                            />
                            {form.invalid('website.sitemap.content') && <InputError message={form.errors['website.sitemap.content']} />}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPublic"
                                checked={form.data.website.sitemap.is_public}
                                onCheckedChange={(checked) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            sitemap: {
                                                ...data.website.sitemap,
                                                is_public: checked,
                                            },
                                        },
                                    }));
                                }}
                            />
                            <label
                                htmlFor="isPublic"
                                className="mt-[2px] text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show Sitemap to the Public
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
