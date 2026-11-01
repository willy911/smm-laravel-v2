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
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, getFile, toHTML } from '@/lib/utils';
import data from '@emoji-mart/data';
import axios from 'axios';
import { getEmojiDataFromNative, init, SearchIndex } from 'emoji-mart';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
init({ data });

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { t } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);
    const [openEmojiPopover, setOpenEmojiPopover] = useState(false);
    const [emojis, setEmojis] = useState([]);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(
        method,
        isUpdate ? route('admin.services.categories.groups.update', { target: target.id }) : route('admin.services.categories.groups.store'),
        {
            _method: method,
            service: {
                category: {
                    group: {
                        name: target.name ?? '',
                        type: target.type ?? 'emoji',
                        emoji: target.emoji ?? '🔥',
                        icon: target.icon ?? 'GlobalIcon',
                        image: target.image ?? '',
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
                    name: target.name ?? '',
                    type: target.type ?? 'emoji',
                    emoji: target.emoji ?? '🔥',
                    icon: target.icon ?? 'GlobalIcon',
                    image: target.image ?? '',
                },
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.service || {};
        return (
            u.category?.group?.name !== initialData.category.group.name ||
            u.category?.group?.type !== initialData.category.group.type ||
            u.category?.group?.emoji !== initialData.category.group.emoji ||
            u.category?.group?.icon !== initialData.category.group.icon ||
            u.category?.group?.image !== initialData.category.group.image
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

            const url = isUpdate
                ? route('admin.services.categories.groups.update', { target: target.id })
                : route('admin.services.categories.groups.store');

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

    const searchEmoji = async (value) => {
        const emojis = (await SearchIndex.search(value)).map((emoji) => {
            return emoji;
        });
        setEmojis(emojis);
    };

    useEffect(() => {
        form.setData((data) => ({
            ...data,
            service: {
                category: {
                    group: {
                        name: target.name ?? '',
                        type: target.type ?? 'emoji',
                        emoji: target.emoji ?? '🔥',
                        icon: target.icon ?? 'GlobalIcon',
                        image: target.image ?? '',
                    },
                },
            },
        }));
        if (isCreateDialogOpened) {
            searchEmoji('fire');
            if (target.id !== undefined && target.type === 'emoji')
                getEmojiDataFromNative(target.emoji).then((data) => searchEmoji(data.keywords[0]));
        }
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
                                value={form.data.service.category.group.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        service: {
                                            ...data.service,
                                            category: {
                                                ...data.service.category,
                                                group: {
                                                    ...data.service.category.group,
                                                    name: e.target.value,
                                                },
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('service.category.group.name')}
                                aria-invalid={form.invalid('service.category.group.name')}
                            />
                            {form.invalid('service.category.group.name') && <InputError message={form.errors['service.category.group.name']} />}
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-12 items-center">
                                <Label className={form.data.service.category.group.type === 'emoji' ? 'col-span-12' : 'col-span-2'} isRequired>
                                    {t('common:labels.type')}
                                </Label>
                                {target?.id !== undefined && form.data.service.category.group.type == 'image' && target?.image && (
                                    <div className="col-span-12 mt-2 rounded-lg border py-4">
                                        <img
                                            src={getFile('service-category-groups', target.image)}
                                            alt=""
                                            className="mx-auto h-auto rounded-md object-contain"
                                        />
                                    </div>
                                )}
                                {form.data.service.category.group.type === 'icon' && (
                                    <small className="col-span-10 text-xs">
                                        You can find the list of icons at{` `}
                                        <a
                                            href="https://hugeicons.com/icons?search=jhonroot.dev"
                                            target="_blank"
                                            className="text-primary underline underline-offset-2"
                                        >
                                            https://hugeicons.com/icons
                                        </a>
                                    </small>
                                )}
                            </div>
                            <div className="grid grid-cols-12">
                                <div className="col-span-2 grid w-full gap-2">
                                    <Select
                                        defaultValue={form.data.service.category.group.type}
                                        onValueChange={(value) => {
                                            form.setData('service', {
                                                ...form.data.service,
                                                category: {
                                                    ...form.data.service.category,
                                                    group: {
                                                        ...form.data.service.category.group,
                                                        type: value,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate('service.category.group.type')}
                                    >
                                        <SelectTrigger className="w-full rounded-r-none" aria-invalid={form.invalid('service.category.group.type')}>
                                            <SelectValue placeholder={t('common:placeholders.select')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">{t('common:labels.image')}</SelectItem>
                                            <SelectItem value="emoji">{t('common:labels.emoji')}</SelectItem>
                                            <SelectItem value="icon">{t('common:labels.icon')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.invalid('service.category.group.type') && (
                                        <InputError message={form.errors['service.category.group.type']} />
                                    )}
                                </div>
                                <div className="col-span-10 grid w-full gap-2">
                                    {form.data.service.category.group.type === 'image' && (
                                        <>
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger className="cursor-pointer" asChild>
                                                        <Input
                                                            type="file"
                                                            accept=".png, .jpg, .jpeg, .svg, .webp, .avif"
                                                            className="ml-3 rounded-l-none border-l-0"
                                                            onChange={(e) => {
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    service: {
                                                                        ...data.service,
                                                                        category: {
                                                                            ...form.data.service.category,
                                                                            group: {
                                                                                ...form.data.service.category.group,
                                                                                image: e.target.files[0],
                                                                            },
                                                                        },
                                                                    },
                                                                })).validate('service.category.group.image');
                                                                form.forgetError('service.category.group.image');
                                                            }}
                                                            onBlur={() => form.validate('service.category.group.image')}
                                                            aria-invalid={form.invalid('service.category.group.image')}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content tooltip-content">
                                                        <span>
                                                            <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                                        </span>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            {form.invalid('service.category.group.image') && (
                                                <InputError message={form.errors['service.category.group.image']} />
                                            )}
                                        </>
                                    )}
                                    {form.data.service.category.group.type === 'emoji' && (
                                        <>
                                            <Popover open={openEmojiPopover} onOpenChange={setOpenEmojiPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            'justify-between rounded-l-none border-l-0',
                                                            !form.data.service.category.group.emoji && 'text-muted-foreground',
                                                            form.invalid('service.category.group.emoji') && 'text-destructive hover:text-destructive',
                                                        )}
                                                    >
                                                        {form.data.service.category.group.emoji ? (
                                                            <div className="space-x-2">
                                                                <span>{form.data.service.category.group.emoji}</span>
                                                                <span>
                                                                    {
                                                                        emojis.find(
                                                                            (option) =>
                                                                                option.skins[0].native == form.data.service.category.group.emoji,
                                                                        )?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            t('common:placeholders.select')
                                                        )}
                                                        <ChevronsUpDown
                                                            className={cn(
                                                                '-mr-1 h-4 w-4 shrink-0 opacity-50',
                                                                (form.invalid('service.category.group.emoji') ||
                                                                    form.data.service.category.group.emoji) &&
                                                                    'opacity-100',
                                                            )}
                                                        />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="popover-content p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder={t('common:placeholders.search-item', {
                                                                item: t('common:labels.emoji'),
                                                            })}
                                                            className="h-9"
                                                            onValueChange={(value) => searchEmoji(value)}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                                            <CommandGroup>
                                                                {emojis.map((option) => (
                                                                    <CommandItem
                                                                        value={option.id}
                                                                        key={option.id}
                                                                        onSelect={(value) => {
                                                                            form.setData((data) => ({
                                                                                ...data,
                                                                                service: {
                                                                                    ...data.service,
                                                                                    category: {
                                                                                        ...form.data.service.category,
                                                                                        group: {
                                                                                            ...form.data.service.category.group,
                                                                                            emoji: option.skins[0].native,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            })).validate('service.category.group.emoji');
                                                                            form.forgetError('service.category.group.emoji');
                                                                            setOpenEmojiPopover(false);
                                                                        }}
                                                                    >
                                                                        <div className="space-x-2">
                                                                            <span>{option.skins[0].native}</span>
                                                                            <span>{option.name}</span>
                                                                        </div>
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                'ml-auto h-4 w-4',
                                                                                option.skins[0].native === form.data.service.category.group.emoji
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0',
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {form.invalid('service.category.group.emoji') && (
                                                <InputError message={form.errors['service.category.group.emoji']} />
                                            )}
                                        </>
                                    )}
                                    {form.data.service.category.group.type === 'icon' && (
                                        <>
                                            <Input
                                                value={form.data.service.category.group.icon}
                                                className={cn('rounded-l-none border-l-0')}
                                                onChange={(e) => {
                                                    form.setData((data) => ({
                                                        ...data,
                                                        service: {
                                                            ...data.service,
                                                            category: {
                                                                ...form.data.service.category,
                                                                group: {
                                                                    ...form.data.service.category.group,
                                                                    icon: e.target.value,
                                                                },
                                                            },
                                                        },
                                                    })).validate('service.category.group.icon');
                                                    form.forgetError('service.category.group.icon');
                                                }}
                                                onBlur={() => form.validate('service.category.group.icon')}
                                                aria-invalid={form.invalid('service.category.group.icon')}
                                            />
                                            {form.invalid('service.category.group.icon') && (
                                                <InputError message={form.errors['service.category.group.icon']} />
                                            )}
                                        </>
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
