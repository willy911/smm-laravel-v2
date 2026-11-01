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
import { Input } from '@/components/ui/input';
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
    const [openUserGroupPopover, setOpenUserGroupPopover] = useState(false);
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/users']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.users.update', { target: target.id }) : route('admin.users.store'), {
        user: {
            group: {
                id: target.user_group_id ?? '',
            },
            full_name: target.full_name ?? '',
            email: target.email ?? '',
            whatsapp: target.whatsapp ?? '',
            username: target.username ?? '',
            service_discount: target.service_discount ?? '',
            password: '',
        },
    });

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            group: {
                id: target.user_group_id ?? '',
            },
            full_name: target.full_name ?? '',
            email: target.email ?? '',
            whatsapp: target.whatsapp ?? '',
            username: target.username ?? '',
            service_discount: target.service_discount ?? '',
            password: '',
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.user || {};
        return (
            u.group?.id !== initialData.group.id ||
            u.full_name !== initialData.full_name ||
            u.email !== initialData.email ||
            u.whatsapp !== initialData.whatsapp ||
            u.username !== initialData.username ||
            u.service_discount !== initialData.service_discount ||
            u.password !== initialData.password
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

            const url = isUpdate ? route('admin.users.update', { target: target.id }) : route('admin.users.store');

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
                    id: target.user_group_id ?? '',
                },
                full_name: target.full_name ?? '',
                email: target.email ?? '',
                whatsapp: target.whatsapp ?? '',
                username: target.username ?? '',
                service_discount: target.service_discount ?? '',
                password: '',
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
                                          item: t('common:labels.user'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.user'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.group')}</Label>
                            <Popover open={openUserGroupPopover} onOpenChange={setOpenUserGroupPopover}>
                                <PopoverTrigger className="overflow-hidden" aria-invalid={form.invalid('user.group.id')} asChild>
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
                                                        {option.label}
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
                            <Label isRequired>{t('common:labels.full-name')}</Label>
                            <Input
                                value={form.data.user.full_name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        user: {
                                            ...data.user,
                                            full_name: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('user.full_name')}
                                aria-invalid={form.invalid('user.full_name')}
                            />
                            {form.invalid('user.full_name') && <InputError message={form.errors['user.full_name']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.whatsapp')}</Label>
                            <Input
                                type="number"
                                value={form.data.user.whatsapp}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        user: {
                                            ...data.user,
                                            whatsapp: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('user.whatsapp')}
                                aria-invalid={form.invalid('user.whatsapp')}
                            />
                            {form.invalid('user.whatsapp') && <InputError message={form.errors['user.whatsapp']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.email')}</Label>
                            <Input
                                type="email"
                                value={form.data.user.email}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        user: {
                                            ...data.user,
                                            email: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('user.email')}
                                aria-invalid={form.invalid('user.email')}
                            />
                            {form.invalid('user.email') && <InputError message={form.errors['user.email']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.username')}</Label>
                            <Input
                                value={form.data.user.username}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        user: {
                                            ...data.user,
                                            username: e.target.value,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('user.username')}
                                aria-invalid={form.invalid('user.username')}
                            />
                            {form.invalid('user.username') && <InputError message={form.errors['user.username']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.password')}</Label>
                            <Input
                                type="password"
                                value={form.data.user.password}
                                onChange={(e) => {
                                    form.setData('user', {
                                        ...form.data.user,
                                        password: e.target.value,
                                    });
                                }}
                                onBlur={() => form.validate('user.password')}
                                aria-invalid={form.invalid('user.password')}
                            />
                            {form.invalid('user.password') && <InputError message={form.errors['user.password']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.service-discount')}</Label>
                            <InputMask
                                suffix=" %"
                                min={0}
                                value={form.data.user.service_discount}
                                onValueChange={(values) => {
                                    form.setData('user', {
                                        ...form.data.user,
                                        service_discount: values.floatValue,
                                    });
                                }}
                                onBlur={() => form.validate('user.service_discount')}
                                aria-invalid={form.invalid('user.service_discount')}
                            />
                            {form.invalid('user.service_discount') && <InputError message={form.errors['user.service_discount']} />}
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
