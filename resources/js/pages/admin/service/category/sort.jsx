import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Loading01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { lazy, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactSortable } from 'react-sortablejs';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export default function Sort({ pageProps, isSortDialogOpened, setIsSortDialogOpened, fetchData, tableStateRef }) {
    const { t } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);
    const [serviceCategoryGroups, setServiceCategoryGroups] = useState([]);
    const [openServiceCategoryGroupPopover, setOpenServiceCategoryGroupPopover] = useState(false);

    const form = useForm('post', route('admin.services.categories.sort'), {
        service: {
            category: {
                group: {
                    id: '',
                },
            },
        },
        items: [],
    });

    const handleRequestClose = useCallback(() => {
        setIsSortDialogOpened(false);
        form.reset();
    }, [form, setIsSortDialogOpened]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);
            axios
                .post(route('admin.services.categories.sort'), form.data)
                .then((response) => {
                    form.reset();
                    setIsSortDialogOpened(false);
                    toast({
                        variant: 'success',
                        description: toHTML(response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                    fetchData(tableStateRef.current);
                })
                .catch((error) => {
                    toast({
                        variant: 'error',
                        description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [form, setIsSortDialogOpened, fetchData, tableStateRef],
    );

    const getServiceCategoryGroups = async () => {
        setIsLoading(true);
        await axios
            .get(
                route('admin.services.categories.groups.options', {
                    ...form.data,
                    ...{
                        onlyRelated: 'serviceCategories',
                    },
                }),
            )
            .then((response) => {
                setServiceCategoryGroups(response.data.items);
            })
            .catch((error) => {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getServiceCategories = async () => {
        form.setData('items', []);
        setIsLoading(true);
        await axios
            .get(route('admin.services.categories.options', form.data))
            .then((response) => {
                form.setData('items', response.data.items[0].items);
            })
            .catch((error) => {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (form.data.service.category.group.id) {
            getServiceCategories();
        }
    }, [form.data.service.category.group.id]);

    useEffect(() => {
        if (!isSortDialogOpened) form.setData('items', []);
        if (isSortDialogOpened) getServiceCategoryGroups();
    }, [isSortDialogOpened]);

    const selectedGroup = serviceCategoryGroups.find((option) => option.value == form.data.service.category.group.id);

    return (
        <>
            <Dialog open={isSortDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {t('admin/common:actions.sort-item', {
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
                                        {form.data.service.category.group.id ? (
                                            <div className="flex items-center space-x-2">
                                                {selectedGroup?.type === 'icon' ? (
                                                    <DynamicIcon
                                                        key={selectedGroup?.icon}
                                                        className="h-4 w-4"
                                                        iconName={selectedGroup?.icon?.trim()}
                                                        size={12}
                                                    />
                                                ) : (
                                                    <span className="-mt-px mr-1.5">{selectedGroup?.emoji}</span>
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
                                                {serviceCategoryGroups.map((option) => (
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
                                                            }));
                                                            setOpenServiceCategoryGroupPopover(false);
                                                        }}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            {option.type === 'icon' ? (
                                                                <DynamicIcon className="h-4 w-4" iconName={option.icon.trim()} size={12} />
                                                            ) : (
                                                                <span className="-mt-px mr-1.5">{option.emoji}</span>
                                                            )}
                                                            <span>{option.label}</span>
                                                        </div>
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
                        {form.data.items.length < 1 && isLoading && (
                            <Alert className="bg-muted">
                                <AlertDescription className="flex items-center">
                                    <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                    {t('common:loading.please-wait')}
                                </AlertDescription>
                            </Alert>
                        )}
                        {form.data.items.length >= 1 && isLoading && (
                            <Alert className="bg-muted">
                                <AlertDescription className="flex items-center">
                                    <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                    {t('common:loading.please-wait')}
                                </AlertDescription>
                            </Alert>
                        )}
                        {form.data.items.length >= 1 && !isLoading && (
                            <ReactSortable
                                className="grid gap-3"
                                list={form.data.items}
                                setList={(e) => {
                                    form.setData('items', e);
                                }}
                                handle=".drag-handle"
                                animation={300}
                                ghostClass="opacity-50"
                            >
                                {form.data.items.map((item, index) => (
                                    <Button className="drag-handle justify-start" key={index}>
                                        {index + 1}. {item.label}
                                    </Button>
                                ))}
                            </ReactSortable>
                        )}
                        <DialogFooter>
                            {form.data.items.length >= 1 && !isLoading && (
                                <Button type="submit" className={cn('w-full')} disabled={isLoading} onClick={handleSubmit}>
                                    {!isLoading ? t('common:actions.submit') : t('common:loading.please-wait')}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
