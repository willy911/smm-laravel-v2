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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn, getFile, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/services']);
    const [openServiceCategoryGroupPopover, setOpenServiceCategoryGroupPopover] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(
        method,
        isUpdate ? route('admin.services.categories.update', { target: target.id }) : route('admin.services.categories.store'),
        {
            _method: method,
            service: {
                category: {
                    group: {
                        id: target.service_category_group_id ?? '',
                    },
                    type: target.type ?? '',
                    name: target.name ?? '',
                    profit_configs: target.profit_configs ?? {
                        type: 'fixed',
                        value: 0,
                        display_value: 0,
                    },
                },
            },
        },
    );

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            category: {
                group: {
                    id: target.service_category_group_id ?? '',
                },
                type: target.type ?? '',
                name: target.name ?? '',
                profit_configs: target.profit_configs ?? {
                    type: 'fixed',
                    value: 0,
                    display_value: 0,
                },
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.service || {};
        return (
            u.category?.group?.id !== initialData.category.group.id ||
            u.category?.type !== initialData.category.type ||
            u.category?.name !== initialData.category.name ||
            JSON.stringify(u.category?.profit_configs) !== JSON.stringify(initialData.category.profit_configs)
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

            const url = isUpdate ? route('admin.services.categories.update', { target: target.id }) : route('admin.services.categories.store');

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
                category: {
                    group: {
                        id: target.service_category_group_id ?? '',
                    },
                    type: target.type ?? '',
                    name: target.name ?? '',
                    profit_configs: target.profit_configs ?? {
                        type: 'fixed',
                        value: 0,
                        display_value: 0,
                    },
                },
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, target?.id]);

    useEffect(() => {
        if (isCreateDialogOpened && target?.id !== undefined && form.data.service.category.profit_configs.type === 'fixed') {
            form.setData((data) => ({
                ...data,
                service: {
                    ...data.service,
                    category: {
                        ...data.service.category,
                        profit_configs: {
                            ...data.service.category.profit_configs,
                            display_value:
                                (form.data.service.category.profit_configs.value ?? 0) *
                                (locales.find((item) => item.locale === i18n.language).usd_rate || 1),
                        },
                    },
                },
            }));
        }
    }, [isCreateDialogOpened, target?.id]);

    const selectedGroup = pageProps?.serviceCategoryGroups?.options.find((option) => option.value == form.data.service.category.group.id);

    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {target.id
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.category'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.category'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.group')}</Label>
                            <Popover open={openServiceCategoryGroupPopover} onOpenChange={setOpenServiceCategoryGroupPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('service.category.group.id')} asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.service.category.group.id && 'text-muted-foreground',
                                            form.invalid('service.category.group.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {/* {form.data.service.category.group.id
                                            ? pageProps?.serviceCategoryGroups?.options.find(
                                                  (option) => option.value == form.data.service.category.group.id,
                                              )?.label
                                            : t('common:placeholders.select')} */}
                                        {form.data.service.category.group.id ? (
                                            <div className={cn('flex items-center', selectedGroup?.type === 'image' ? 'space-x-1' : 'space-x-2')}>
                                                {selectedGroup?.type === 'icon' && (
                                                    <DynamicIcon
                                                        key={selectedGroup?.icon}
                                                        className="h-4 w-4"
                                                        iconName={selectedGroup?.icon?.trim()}
                                                        size={12}
                                                    />
                                                )}
                                                {selectedGroup?.type === 'emoji' && <span className="-mt-px mr-1.5">{selectedGroup?.emoji}</span>}
                                                {selectedGroup?.type === 'image' && (
                                                    <img
                                                        alt={selectedGroup?.image}
                                                        decoding="async"
                                                        className="max-w-20 object-contain md:max-h-5"
                                                        src={getFile('service-category-groups', selectedGroup?.image)}
                                                    />
                                                )}
                                                <span>{selectedGroup?.label}</span>
                                            </div>
                                        ) : (
                                            t('common:placeholders.select')
                                        )}
                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('service.category.group.id') || form.data.service.category.group.id) && 'opacity-100',
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
                                                {pageProps?.serviceCategoryGroups?.options.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData((data) => ({
                                                                ...data,
                                                                service: {
                                                                    ...data.service,
                                                                    category: {
                                                                        ...data.service.category,
                                                                        group: {
                                                                            ...data.service.category.group,
                                                                            id: option.value,
                                                                        },
                                                                    },
                                                                },
                                                            })).validate('service.category.group.id');
                                                            form.forgetError('service.category.group.id');
                                                            setOpenServiceCategoryGroupPopover(false);
                                                        }}
                                                    >
                                                        <div className={cn('flex items-center', option.type === 'image' ? 'space-x-1' : 'space-x-2')}>
                                                            {option.type === 'icon' && (
                                                                <DynamicIcon className="h-4 w-4" iconName={option.icon.trim()} size={12} />
                                                            )}
                                                            {option.type === 'emoji' && <span className="-mt-px mr-1.5">{option.emoji}</span>}
                                                            {option.type === 'image' && (
                                                                <img
                                                                    alt={option.image}
                                                                    decoding="async"
                                                                    className="-mt-px max-w-20 object-contain md:max-h-5"
                                                                    src={getFile('service-category-groups', option.image)}
                                                                />
                                                            )}
                                                            <span>{option.label}</span>
                                                        </div>
                                                        {/* {option.label} */}
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === form.data.service.category.group.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('service.category.group.id') && <InputError message={form.errors['service.category.group.id']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.name')}</Label>
                            <Input
                                value={form.data.service.category.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        service: {
                                            ...data.service,
                                            category: {
                                                ...data.service.category,
                                                name: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('service.category.name')}
                                aria-invalid={form.invalid('service.category.name')}
                            />
                            {form.invalid('service.category.name') && <InputError message={form.errors['service.category.name']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('admin/common:labels.profit-configs')}</Label>
                            <div className="grid grid-cols-12">
                                <div className="col-span-6 grid w-full gap-2">
                                    <Select
                                        defaultValue={form.data.service.category.profit_configs.type}
                                        onValueChange={(value) => {
                                            form.setData('service', {
                                                ...form.data.service,
                                                category: {
                                                    ...form.data.service.category,
                                                    profit_configs: {
                                                        ...form.data.service.category.profit_configs,
                                                        type: value,
                                                    },
                                                },
                                            }).validate('service.category.profit_configs.type');
                                            form.forgetError('service.category.profit_configs.type');
                                        }}
                                        onBlur={() => form.validate('service.category.profit_configs.type')}
                                    >
                                        <SelectTrigger
                                            className="w-full rounded-r-none"
                                            aria-invalid={form.invalid('service.category.profit_configs.type')}
                                        >
                                            <SelectValue placeholder={t('common:placeholders.select')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">{t('admin/common:labels.profit-fixed')}</SelectItem>
                                            <SelectItem value="percentage">{t('admin/common:labels.profit-percentage')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.invalid('service.category.profit_configs.type') && (
                                        <InputError message={form.errors['service.category.profit_configs.type']} />
                                    )}
                                </div>
                                <div className="col-span-6 grid w-full gap-2">
                                    <InputMask
                                        min={0}
                                        prefix={
                                            form.data.service.category.profit_configs.type === 'fixed'
                                                ? locales.find((item) => item.locale === i18n.language).currency_symbol + ' '
                                                : ''
                                        }
                                        suffix={form.data.service.category.profit_configs.type === 'percentage' ? ' %' : ''}
                                        value={form.data.service.category.profit_configs.display_value}
                                        className="rounded-l-none border-l-0"
                                        onValueChange={(values) => {
                                            const value =
                                                form.data.service.category.profit_configs.type === 'percentage'
                                                    ? values.floatValue
                                                    : values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                            form.setData('service', {
                                                ...form.data.service,
                                                category: {
                                                    ...form.data.service.category,
                                                    profit_configs: {
                                                        ...form.data.service.category.profit_configs,
                                                        value,
                                                        display_value: values.floatValue,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate('service.category.profit_configs.value')}
                                        aria-invalid={form.invalid('service.category.profit_configs.value')}
                                    />
                                    {form.invalid('service.category.profit_configs.value') && (
                                        <InputError message={form.errors['service.category.profit_configs.value']} />
                                    )}
                                </div>
                            </div>
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
