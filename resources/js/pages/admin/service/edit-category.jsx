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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

export default function EditCategory({
    pageProps,
    isEditCategoryDialogOpened,
    setIsEditCategoryDialogOpened,
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
    const [openServiceCategoryPopover, setOpenServiceCategoryPopover] = useState(false);

    const isUpdate = useMemo(() => targets?.length > 0, [targets]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.services.update-batch-category') : route('admin.services.store'), {
        service: {
            ids: targets.map((target) => target.id),
            name: targets.map((target) => target.name).join('\r\n'),
            category: {
                id: '',
            },
        },
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            service: {
                ids: targets.map((target) => target.id),
                name: targets.map((target) => target.name).join('\r\n'),
                category: {
                    id: '',
                },
            },
        }),
        [targets],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.service || {};
        return u.ids !== initialData.ids || u.category?.id !== initialData.category.id;
    }, [form.data, initialData]);

    const handleRequestClose = useCallback(() => {
        if (hasUnsavedChanges()) {
            setIsRequestCloseDialogOpened(true);
        } else {
            form.setErrors([]);
            setTargets([]);
            setIsEditCategoryDialogOpened(false);
        }
    }, [hasUnsavedChanges, form, setTargets, setIsEditCategoryDialogOpened]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);

            const url = isUpdate ? route('admin.services.update-batch-category') : route('admin.services.store');

            axios[method](url, form.data)
                .then((response) => {
                    form.reset();
                    form.setErrors([]);
                    setTargets([]);
                    setIsEditCategoryDialogOpened(false);
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
        [isUpdate, targets?.length, method, form, setTargets, setIsEditCategoryDialogOpened, fetchData, tableStateRef],
    );

    useEffect(() => {
        form.setData((data) => ({
            service: {
                ids: targets.map((target) => target.id),
                name: targets.map((target) => target.name).join('\r\n'),
                category: {
                    id: '',
                },
            },
        }));
        form.setErrors([]);
    }, [isEditCategoryDialogOpened, targets?.length]);
    return (
        <>
            <Dialog open={isEditCategoryDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-4xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {targets?.length > 0
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.category'),
                                      })}` //   })} #${targets.map((target) => target.id).join(', ')}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.order'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label>{t('common:labels.id')}</Label>
                            <Input value={targets.map((target) => target.id).join(', ')} readOnly />
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
                                setIsEditCategoryDialogOpened(false);
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
