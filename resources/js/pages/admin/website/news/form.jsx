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
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TextEditor from '@/components/ui/text-editor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, getFile, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { t } = useTranslation(['admin/common', 'admin/products']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);

    const isUpdate = useMemo(() => Object.keys(target).length > 0 && target.id, [target]);
    const method = isUpdate ? 'put' : 'post';

    const form = useForm(method, isUpdate ? route('admin.websites.news.update', { target: target.id }) : route('admin.websites.news.store'), {
        _method: method,
        website: {
            news: {
                title: target.title ?? '',
                content: target.content ?? '',
                only_visible_on: target.only_visible_on ?? '',
                is_public: !!Number(target.is_public ?? 0),
                is_popup: !!Number(target.is_popup ?? 0),
                banner: '',
            },
        },
    });

    form.validateFiles();
    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            news: {
                title: target.title ?? '',
                content: target.content ?? '',
                only_visible_on: target.only_visible_on ?? '',
                is_public: !!Number(target.is_public ?? 0),
                is_popup: !!Number(target.is_popup ?? 0),
                banner: '',
            },
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        const u = form.data.website || {};
        return (
            u.news.title !== initialData.news.title ||
            u.news.content !== initialData.news.content ||
            u.news.only_visible_on !== initialData.news.only_visible_on ||
            u.news.is_public !== initialData.news.is_public ||
            u.news.is_popup !== initialData.news.is_popup ||
            u.news.banner !== initialData.news.banner
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

            const url = isUpdate ? route('admin.websites.news.update', { target: target.id }) : route('admin.websites.news.store');

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
                news: {
                    title: target.title ?? '',
                    content: target.content ?? '',
                    only_visible_on: target.only_visible_on ?? '',
                    is_public: !!Number(target.is_public ?? 0),
                    is_popup: !!Number(target.is_popup ?? 0),
                    banner: '',
                },
            },
        }));
        form.setErrors([]);
    }, [isCreateDialogOpened, target?.id]);

    const routeList = [
        { value: 'guest.dashboard', label: 'Dashboard' },
        { value: 'user.leaderboard', label: 'Leaderboard' },
        { value: 'user.orders.index', label: 'Orders' },
        { value: 'user.orders.create', label: 'Create Order' },
        { value: 'user.orders.refills.index', label: 'Order Refills' },
        { value: 'user.deposits.index', label: 'Deposits' },
        { value: 'user.deposits.create', label: 'Create Deposit' },
        { value: 'user.tickets.index', label: 'Tickets' },
        { value: 'user.tickets.create', label: 'Create Ticket' },
        { value: 'guest.services.index', label: 'Services' },
    ];

    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {target.id
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.news'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.news'),
                                      })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        {target?.id !== undefined && target?.banner && (
                            <div className="rounded-lg border py-4">
                                <img src={getFile('website-news', target.banner)} alt="" className="mx-auto h-32 w-80 rounded-md object-cover" />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label isRequired={target?.id ? false : true}>{t('common:labels.banner')}</Label>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-pointer" asChild>
                                        <Input
                                            type="file"
                                            accept=".png, .jpg, .jpeg, .svg, .webp, .avif"
                                            onChange={(e) => {
                                                form.setData((data) => ({
                                                    ...data,
                                                    website: {
                                                        ...data.website,
                                                        news: {
                                                            ...data.website.news,
                                                            banner: e.target.files[0],
                                                        },
                                                    },
                                                }));
                                                form.forgetError('website.news.banner');
                                            }}
                                            onBlur={() => form.validate('website.news.banner')}
                                            aria-invalid={form.invalid('website.news.banner')}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content tooltip-content">
                                        <span>
                                            <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                        </span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {form.invalid('website.news.banner') && <InputError message={form.errors['website.news.banner']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.title')}</Label>
                            <Input
                                value={form.data.website.news.title}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            news: {
                                                ...data.website.news,
                                                title: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('website.news.title')}
                                aria-invalid={form.invalid('website.news.title')}
                            />
                            {form.invalid('website.news.title') && <InputError message={form.errors['website.news.title']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.content')}</Label>
                            <TextEditor
                                value={form.data.website.news.content}
                                onEditorChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            news: {
                                                ...data.website.news,
                                                content: e,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('website.news.content')}
                                aria-invalid={form.invalid('website.news.content')}
                            />
                            {form.invalid('website.news.content') && <InputError message={form.errors['website.news.content']} />}
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>On Visible On</Label>
                            <Popover>
                                <PopoverTrigger aria-invalid={form.invalid('website.news.only_visible_on')} asChild>
                                    <Button variant="outline" role="combobox" className="h-auto justify-between px-3">
                                        <div
                                            className={cn(
                                                'flex flex-wrap gap-2',
                                                form.data.website.news.only_visible_on?.length > 0 ? 'font-normal' : 'text-muted-foreground',
                                            )}
                                        >
                                            {form.data.website.news.only_visible_on
                                                ? form.data.website.news.only_visible_on
                                                      .split(',')
                                                      .filter(Boolean)
                                                      .map((val, index) => {
                                                          const found = routeList.find((item) => item.value === val);

                                                          return (
                                                              <div key={index} className="bg-muted rounded-xl border px-2 py-1 text-xs font-medium">
                                                                  {found ? found.label : val}
                                                              </div>
                                                          );
                                                      })
                                                : 'Select...'}
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                        <CommandGroup>
                                            <CommandList>
                                                {routeList.map((item) => {
                                                    const selectedRoutes = form.data.website.news.only_visible_on
                                                        ? form.data.website.news.only_visible_on.split(',').filter(Boolean)
                                                        : [];
                                                    const isSelected = selectedRoutes.includes(item.value);

                                                    return (
                                                        <CommandItem
                                                            key={item.value}
                                                            value={item.value}
                                                            className={isSelected ? 'bg-muted' : ''}
                                                            onSelect={() => {
                                                                let updated;

                                                                if (isSelected) {
                                                                    updated = selectedRoutes.filter((r) => r !== item.value);
                                                                } else {
                                                                    updated = [...selectedRoutes, item.value];
                                                                }

                                                                form.setData('website', {
                                                                    ...form.data.website,
                                                                    news: {
                                                                        ...form.data.website.news,
                                                                        only_visible_on: updated.join(','),
                                                                    },
                                                                });

                                                                form.forgetError('website.news.only_visible_on');
                                                            }}
                                                        >
                                                            <span>{item.label}</span>
                                                            <CheckIcon className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandList>
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPublic"
                                checked={form.data.website.news.is_public}
                                onCheckedChange={(checked) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            news: {
                                                ...data.website.news,
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
                                Show News to the Public
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPopup"
                                checked={form.data.website.news.is_popup}
                                onCheckedChange={(checked) => {
                                    form.setData((data) => ({
                                        ...data,
                                        website: {
                                            ...data.website,
                                            news: {
                                                ...data.website.news,
                                                is_popup: checked,
                                            },
                                        },
                                    }));
                                }}
                            />
                            <label
                                htmlFor="isPopup"
                                className="mt-[2px] text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show News Popup
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
