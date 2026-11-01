import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
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
    const [serviceCategories, setServiceCategories] = useState([]);
    const [openServiceCategoryGroupPopover, setOpenServiceCategoryGroupPopover] = useState(false);
    const [openServiceCategoryPopover, setOpenServiceCategoryPopover] = useState(false);

    const form = useForm('post', route('admin.services.sort'), {
        service: {
            category: {
                id: '',
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
                .post(route('admin.services.sort'), form.data)
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

    const getServices = async () => {
        form.setData('items', []);
        setIsLoading(true);
        await axios
            .get(route('admin.services.options', form.data))
            .then((response) => {
                form.setData('items', response.data.items);
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
        if (form.data.service.category.id) {
            getServices();
        }
    }, [form.data.service.category.id]);

    useEffect(() => {
        if (!isSortDialogOpened) form.setData('items', []);
    }, [isSortDialogOpened]);

    return (
        <>
            <Dialog open={isSortDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-3xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {t('admin/common:actions.sort-item', {
                                    item: t('common:labels.service'),
                                })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.category')}</Label>
                            <Popover open={openServiceCategoryPopover} onOpenChange={setOpenServiceCategoryPopover}>
                                <PopoverTrigger aria-invalid={form.invalid('service.category.id')} asChild>
                                    {/* <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            !form.data.service.category.id && 'text-muted-foreground',
                                            form.invalid('service.category.id') && 'text-destructive hover:text-destructive',
                                        )}
                                    >
                                        {form.data.service.category.id ? (
                                            <div className="flex items-center space-x-2">
                                                {selectedCategory.group?.type === 'icon' ? (
                                                    <DynamicIcon className="h-4 w-4" iconName={selectedCategory.group?.icon?.trim()} size={12} />
                                                ) : (
                                                    <span className="-mt-px mr-1.5">{selectedCategory.group?.emoji}</span>
                                                )}
                                                <span>{selectedCategory.label}</span>
                                            </div>
                                        ) : (
                                            t('common:placeholders.select')
                                        )}

                                        <ChevronsUpDown
                                            className={cn(
                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                (form.invalid('service.category.id') || form.data.service.category.id) && 'opacity-100',
                                            )}
                                        />
                                    </Button> */}
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
                                                        <span>{item.label}</span>
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
                                                <>
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
                                                </>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('service.category.id') && <InputError message={form.errors['service.category.id']} />}
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
