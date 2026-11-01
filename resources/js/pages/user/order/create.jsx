import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
// import DynamicIcon from '@/components/ui/dynamic-icon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, getFile, toHTML } from '@/lib/utils';
import { Dialog as HeadlessDialog, DialogPanel as HeadlessDialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Deferred, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Loading02Icon, Menu01Icon, Search01Icon, ShoppingBagAddIcon, WalletAdd01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown, Instagram, XIcon } from 'lucide-react';
import { Fragment, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OrderData from './partials/order-data';
import OrderExampleTarget from './partials/order-example-target';
import OrderSummary from './partials/order-summary';
import ServiceDetails from './partials/service-details';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export default function Create({ pageProps }) {
    const { responseTime, responseError, responseSuccess, auth, configs, orderData, orderDataMassal, locales } = usePage().props;
    const { t, i18n } = useTranslation('orders');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [orderDetail, setOrderDetail] = useState([]);
    const [isDialogExampleTargetOpened, setIsDialogExampleTargetOpened] = useState(false);
    const [searchService, setSearchService] = useState('');
    const [serviceCategoryGroup, setServiceCategoryGroup] = useState('');
    const [serviceCategories, setServiceCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [searchServices, setSearchServices] = useState([]);
    const [isServiceFavorites, setIsServiceFavorites] = useState(false);
    const [selectedService, setSelectedService] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [openServiceCategoryPopover, setOpenServiceCategoryPopover] = useState(false);
    const [openServicePopover, setOpenServicePopover] = useState(false);
    const [openSearchServicePopover, setOpenSearchServicePopover] = useState(false);

    const initialFormData = {
        service: {
            category: {
                id: pageProps?.target?.service_category_id ?? '',
            },
            id: pageProps?.target?.id ?? '',
            type: '',
            price: '',
            min: '',
            max: '',
            description: '',
        },
        order: {
            type: 'single',
            target: '',
            quantity: '',
            mass: '',
            comments: '',
            usernames: '',
            username: '',
            hashtags: '',
            hashtag: '',
            media_url: '',
            answer_number: '',
        },
    };

    const form = useForm('post', route('user.orders.create'), initialFormData);

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setServiceCategoryGroup('');
            },
            onError: (errors) => {
                toast({
                    variant: 'error',
                    description: t('common:toast.invalid-input'),
                });
            },
        });
    };

    const getServiceCategories = async (serviceCategoryGroupID = null) => {
        try {
            const response = await axios.post(route('ajax.services.categories.index'), {
                service: {
                    category: {
                        group: {
                            id: serviceCategoryGroupID,
                        },
                    },
                    is_favorites: isServiceFavorites,
                },
                order: {
                    type: form.data.order.type,
                },
            });
            if (response.data.status) {
                setServiceCategories(response.data.serviceCategories);
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
            });
        }
    };

    const getServices = async (serviceCategoryID) => {
        try {
            const response = await axios.post(route('ajax.services.index'), {
                service: {
                    category: {
                        id: serviceCategoryID,
                    },
                    is_favorites: isServiceFavorites,
                },
                order: {
                    type: form.data.order.type,
                },
            });
            if (response.data.status) {
                setServices(response.data.services);
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
            });
        }
    };

    const getSearchServices = async (value) => {
        try {
            const response = await axios.post(route('ajax.services.search'), {
                service: {
                    name: value,
                    is_favorites: isServiceFavorites,
                },
                order: {
                    type: form.data.order.type,
                },
            });
            if (response.data.status) {
                setSearchServices(response.data.services);
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
            });
        }
    };

    const getServiceDetail = async (serviceID) => {
        try {
            const response = await axios.post(
                route('ajax.services.show', {
                    target: serviceID,
                }),
            );
            if (response.data.status) {
                setSelectedService({
                    ...response.data.service,
                    summary: response.data.summary,
                });
                form.setData('service', {
                    ...form.data.service,
                    category: {
                        ...form.data.service.category,
                        id: response.data.service.service_category_id,
                    },
                });
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
            });
        }
    };

    useEffect(() => {
        form.setData('service', {
            ...form.data.service,
            category: {
                ...form.data.service.category,
                id: '',
            },
            id: '',
        });
        setServiceCategories([]);
        setServices([]);
        setSelectedService([]);
        getServiceCategories(serviceCategoryGroup);
    }, [form.data.order.type, serviceCategoryGroup, isServiceFavorites]);

    useEffect(() => {
        setServices([]);
        if (form.data.service.category.id) getServices(form.data.service.category.id);
    }, [form.data.service.category.id]);

    useEffect(() => {
        setSelectedService([]);
        if (form.data.service.id) getServiceDetail(form.data.service.id);
    }, [form.data.service.id]);

    useEffect(() => {
        form.setData('service', {
            ...form.data.service,
            id: pageProps?.target?.id,
        });
    }, [pageProps?.target?.id]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setSelectedService([]);
            setSearchServices([]);
            form.setData('service', {
                ...form.data.service,
                id: '',
                category: {
                    ...form.data.service.category,
                    id: '',
                },
            });
            if (searchService) getSearchServices(searchService);
        }, 200);
        return () => clearTimeout(delay);
    }, [searchService]);

    useEffect(() => {
        if (Object.keys(selectedService).length > 0 && ['custom_comments', 'comment_replies'].includes(selectedService.type)) {
            form.setData('order', {
                ...form.data.order,
                quantity: form.data.order.comments
                    .split('\n')
                    .filter((line) => line.trim() !== '')
                    .map((line) => line.length).length,
            });
        } else if (Object.keys(selectedService).length > 0 && selectedService.type === 'mentions_custom_list') {
            form.setData('order', {
                ...form.data.order,
                quantity: form.data.order.usernames
                    .split('\n')
                    .filter((line) => line.trim() !== '')
                    .map((line) => line.length).length,
            });
        }
    }, [form.data.order.comments, form.data.order.usernames]);

    useEffect(() => {
        if (Object.keys(selectedService).length > 0) {
            let rawRate = selectedService.service_custom_price?.price ?? selectedService.price;
            let rate = ['package', 'custom_comments_package'].includes(selectedService.type) ? Number(rawRate) : Number(rawRate) / 1000;
            let quantity = 0;
            let total = 0;
            if (form.data.order.type === 'single') {
                const { type } = selectedService;
                const countNonEmptyLines = (text) => (text || '').split('\n').filter((line) => line.trim() !== '').length;
                if (
                    [
                        'primary',
                        'mentions_with_hashtags',
                        'mentions_hashtag',
                        'mentions_user_followers',
                        'mentions_media_likers',
                        'comment_likes',
                        'poll',
                    ].includes(type)
                ) {
                    quantity = form.data.order.quantity || 0;
                } else if (['custom_comments', 'comment_replies'].includes(type)) {
                    quantity = countNonEmptyLines(form.data.order.comments);
                } else if (type === 'mentions_custom_list') {
                    quantity = countNonEmptyLines(form.data.order.usernames);
                } else if (['package', 'custom_comments_package'].includes(type)) {
                    quantity = form.data.order.quantity || 0;
                } else {
                    quantity = 0;
                }
            } else if (form.data.order.type === 'mass') {
                const massText = form.data.order.mass || '';
                quantity = massText.split('\n').reduce((acc, line) => {
                    const match = line.match(/^.*,(\d+)$/);
                    return match ? acc + parseInt(match[1], 10) : acc;
                }, 0);
            } else {
                quantity = 0;
            }
            total = Number(rate * quantity);
            setTotalPrice(total);
        }
    }, [form.data]);

    useEffect(() => {
        if (Object.keys(selectedService).length > 0) {
            let quantity;
            if (form.data.order.type === 'single') {
                if (['custom_comments', 'comment_replies'].includes(selectedService.type)) {
                    form.setData('order', {
                        ...form.data.order,
                        quantity: form.data.order.comments
                            .split('\n')
                            .filter((line) => line.trim() !== '')
                            .map((line) => line.length).length,
                    });
                } else if (selectedService.type === 'mentions_custom_list') {
                    form.setData('order', {
                        ...form.data.order,
                        quantity: form.data.order.usernames
                            .split('\n')
                            .filter((line) => line.trim() !== '')
                            .map((line) => line.length).length,
                    });
                } else if (selectedService.type === 'package') {
                    form.setData('order', {
                        ...form.data.order,
                        quantity: 1,
                    });
                } else if (selectedService.type === 'custom_comments_package') {
                    form.setData('order', {
                        ...form.data.order,
                        quantity: 1,
                    });
                }
            }
        }
    }, [selectedService]);

    useEffect(() => {
        if (orderData !== undefined && orderData.length > 0) setOrderDetail(orderData);
    }, [responseTime]);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const selectedGroup = serviceCategories.find((group) => group.options.some((item) => item.value === form.data.service.category.id));

    return (
        <AppLayout
            pageTitle={cn(
                t('common:actions.create-item', {
                    item: t('common:labels.order'),
                }),
            )}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.orders'),
                    href: '/',
                },
                {
                    title: t('common:actions.create-item', {
                        item: '',
                    }),
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                {orderData !== undefined && <OrderData orderData={orderData} type="single" />}
                {orderDataMassal !== undefined && <OrderData orderData={orderDataMassal} type="massal" />}
                <div className="flex flex-wrap gap-0 md:gap-4 lg:gap-0">
                    <div className="order-last w-full space-y-6 sm:w-full md:w-full xl:order-none xl:w-[55%]">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ShoppingBagAddIcon className="mr-2 h-4 w-4" />
                                    {cn(
                                        t('common:actions.create-item', {
                                            item: t('common:labels.order'),
                                        }),
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    className="grid gap-4"
                                    onSubmit={handleSubmit}
                                    onReset={() => {
                                        form.reset();
                                        form.clearErrors();
                                        setServiceCategoryGroup('');
                                    }}
                                    autoComplete="off"
                                >
                                    <div className="-mx-4 flex items-center justify-between border-b border-dashed pb-3">
                                        <div className="flex space-x-2 pl-4">
                                            <Checkbox
                                                id="orderTypeSingle"
                                                onCheckedChange={(value) => {
                                                    form.setData((data) => ({
                                                        service: {
                                                            ...data.service,
                                                            id: '',
                                                            category: {
                                                                ...data.service.category,
                                                                id: '',
                                                            },
                                                        },
                                                        order: {
                                                            ...form.data.order,
                                                            type: 'single',
                                                            mass: '',
                                                        },
                                                    })).clearErrors();
                                                }}
                                                checked={form.data.order.type == 'single' ? true : false}
                                            />
                                            <Label htmlFor="orderTypeSingle" className="cursor-pointer select-none">
                                                {t('common:labels.single-order')}
                                            </Label>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Checkbox
                                                id="orderTypeMass"
                                                onCheckedChange={(value) => {
                                                    form.setData((data) => ({
                                                        service: {
                                                            ...data.service,
                                                            id: '',
                                                            category: {
                                                                ...data.service.category,
                                                                id: '',
                                                            },
                                                        },
                                                        order: {
                                                            ...form.data.order,
                                                            type: 'mass',
                                                            mass: '',
                                                        },
                                                    })).clearErrors();
                                                }}
                                                checked={form.data.order.type == 'mass' ? true : false}
                                            />
                                            <Label htmlFor="orderTypeMass" className="cursor-pointer select-none">
                                                {t('common:labels.mass-order')}
                                            </Label>
                                        </div>
                                        <div className="flex space-x-2 pr-4">
                                            <Checkbox
                                                id="isServiceFavorites"
                                                onCheckedChange={(value) => {
                                                    setIsServiceFavorites((prev) => !prev);
                                                    form.setData('service', {
                                                        ...form.data.service,
                                                        category: {
                                                            ...form.data.service.category,
                                                            id: '',
                                                        },
                                                        id: '',
                                                    });
                                                }}
                                                checked={isServiceFavorites}
                                            />
                                            <Label htmlFor="isServiceFavorites" className="cursor-pointer select-none">
                                                {t('common:labels.service-favorite')}
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={serviceCategoryGroup === '' ? 'default' : 'outline'}
                                            className="hover:from-primary hover:to-primary/90 hover:text-primary-foreground hover:bg-gradient-to-b"
                                            onClick={() => setServiceCategoryGroup('')}
                                        >
                                            <Menu01Icon className="-mt-px h-4 w-4" />
                                            {t('common:labels.all')}
                                        </Button>
                                        {pageProps?.serviceCategoryGroups?.map((item) => (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={serviceCategoryGroup === item.id ? 'default' : 'outline'}
                                                className="dark:hover:from-primary/50 hover:from-primary/75 hover:to-primary/90 dark:hover:to-primary/70 hover:text-primary-foreground hover:bg-gradient-to-b"
                                                onClick={() => setServiceCategoryGroup(item.id)}
                                                key={item.name}
                                            >
                                                {item.type === 'icon' && (
                                                    <DynamicIcon className="-mt-px h-4 w-4" iconName={item.icon.trim()} size={16} />
                                                )}
                                                {item.type === 'emoji' && <span className="-mt-px -mr-1">{item.emoji}</span>}
                                                {item.type === 'image' && (
                                                    <img
                                                        alt={item.image}
                                                        decoding="async"
                                                        className="-mt-px -mr-1 max-w-20 object-contain md:max-h-5"
                                                        src={getFile('service-category-groups', item.image)}
                                                    />
                                                )}
                                                {item.name}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="grid w-full space-y-2">
                                        <Label>
                                            {t('common:labels.search')} {t('common:labels.id')} / {t('common:labels.service')}
                                        </Label>
                                        <Popover open={openSearchServicePopover} onOpenChange={setOpenSearchServicePopover} className="p-0">
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className={cn('text-muted-foreground justify-between')}>
                                                    {t('common:labels.search')} {t('common:labels.id')} {t('common:labels.or')}{' '}
                                                    {t('common:labels.service')}...
                                                    <Search01Icon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="popover-content p-0">
                                                <Command className="p-0">
                                                    <CommandInput
                                                        placeholder={`${t('common:labels.search')} ${t('common:labels.id')} ${t('common:labels.or')} ${t('common:labels.service')}...`}
                                                        value={searchService}
                                                        onValueChange={setSearchService}
                                                    />
                                                    <CommandList>
                                                        {searchServices.length < 1 && <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>}
                                                        {searchServices.map((item) => {
                                                            return (
                                                                <CommandItem
                                                                    key={item.value}
                                                                    value={item.value}
                                                                    className={form.data.service.id === item.value ? 'bg-muted' : ''}
                                                                    onSelect={(currentValue) => {
                                                                        form.setData('service', {
                                                                            ...form.data.service,
                                                                            category: {
                                                                                ...form.data.service.category,
                                                                                id: item.category_id,
                                                                            },
                                                                            id: item.value,
                                                                        });
                                                                        form.forgetError('service.category.id');
                                                                        form.forgetError('service.id');
                                                                        setOpenSearchServicePopover(false);
                                                                    }}
                                                                >
                                                                    {item.label}
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid w-full space-y-2">
                                        <Label isRequired>{t('common:labels.category')}</Label>
                                        <Popover open={openServiceCategoryPopover} onOpenChange={setOpenServiceCategoryPopover} className="p-0">
                                            <PopoverTrigger className="overflow-hidden" aria-invalid={form.invalid('service.category.id')} asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'justify-between',
                                                        !form.data.service.category.id && 'text-muted-foreground',
                                                        form.invalid('service.category.id') && 'text-destructive',
                                                    )}
                                                >
                                                    <span className="max-w-[300px] truncate md:max-w-[400px] 2xl:max-w-[500px]">
                                                        {selectedGroup && form.data.service.category.id ? (
                                                            <div
                                                                className={cn(
                                                                    'flex items-center',
                                                                    selectedGroup?.type === 'image' ? 'space-x-1' : 'space-x-2',
                                                                )}
                                                            >
                                                                {selectedGroup?.type === 'icon' && (
                                                                    <DynamicIcon
                                                                        key={selectedGroup?.icon}
                                                                        className="mr-1.5 h-4 w-4"
                                                                        iconName={selectedGroup?.icon?.trim()}
                                                                        size={12}
                                                                    />
                                                                )}
                                                                {selectedGroup?.type === 'emoji' && (
                                                                    <span className="-mt-px mr-1">{selectedGroup?.emoji}</span>
                                                                )}
                                                                {selectedGroup?.type === 'image' && (
                                                                    <img
                                                                        alt={selectedGroup?.image}
                                                                        decoding="async"
                                                                        className="max-w-20 object-contain md:max-h-5"
                                                                        src={getFile('service-category-groups', selectedGroup?.image)}
                                                                    />
                                                                )}
                                                                <span>
                                                                    {
                                                                        serviceCategories
                                                                            .flatMap((group) => group.options)
                                                                            .find((item) => item.value === form.data.service.category.id)?.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            t('common:placeholders.select')
                                                        )}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="popover-content p-0">
                                                <Command className="p-0">
                                                    <CommandInput placeholder={`${t('common:labels.search')} ${t('common:labels.category')}...`} />
                                                    <CommandList>
                                                        <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                                        {serviceCategories.map((group, index) => (
                                                            <div key={index}>
                                                                <CommandGroup
                                                                    heading={
                                                                        <div className="flex items-center gap-1">
                                                                            {group.type === 'icon' && (
                                                                                <DynamicIcon
                                                                                    className="h-4 w-4"
                                                                                    iconName={group.icon?.trim()}
                                                                                    size={16}
                                                                                />
                                                                            )}
                                                                            {group.type === 'emoji' && <span className="-mt-px">{group.emoji}</span>}
                                                                            {group.type === 'image' && (
                                                                                <img
                                                                                    alt={group.image}
                                                                                    decoding="async"
                                                                                    className="-mt-px -mr-px max-w-20 object-contain md:max-h-5"
                                                                                    src={getFile('service-category-groups', group.image)}
                                                                                />
                                                                            )}
                                                                            {group.label}
                                                                        </div>
                                                                    }
                                                                >
                                                                    {group.options.map((serviceCategory, index) => (
                                                                        <CommandItem
                                                                            key={index}
                                                                            value={serviceCategory.value}
                                                                            className={
                                                                                form.data.service.category.id === serviceCategory.value
                                                                                    ? 'bg-muted'
                                                                                    : ''
                                                                            }
                                                                            onSelect={(currentValue) => {
                                                                                form.setData('service', {
                                                                                    ...form.data.service,
                                                                                    category: {
                                                                                        ...form.data.service.category,
                                                                                        id: serviceCategory.value,
                                                                                    },
                                                                                    id: '',
                                                                                });
                                                                                form.forgetError('service.category.id');
                                                                                setOpenServiceCategoryPopover(false);
                                                                            }}
                                                                        >
                                                                            {serviceCategory.label}
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    'ml-auto h-4 w-4',
                                                                                    form.data.service.category.id === serviceCategory.value
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0',
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                                {index < serviceCategories.length - 1 && <CommandSeparator />}
                                                            </div>
                                                        ))}
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {form.invalid('service.category.id') && <InputError message={form.errors['service.category.id']} />}
                                    </div>
                                    <div className="grid w-full space-y-2">
                                        <div className="flex justify-between">
                                            <Label isRequired>{t('common:labels.service')}</Label>
                                        </div>
                                        <Popover open={openServicePopover} onOpenChange={setOpenServicePopover} className="p-0">
                                            <PopoverTrigger className="overflow-hidden" aria-invalid={form.invalid('service.id')} asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'justify-between',
                                                        !form.data.service.id && 'text-muted-foreground',
                                                        form.invalid('service.id') && 'text-destructive',
                                                    )}
                                                >
                                                    <span className="max-w-[300px] truncate md:max-w-[400px] 2xl:max-w-[500px]">
                                                        {form.data.service.id
                                                            ? services.find((item) => item.value === form.data.service.id)?.label
                                                            : services.length > 0
                                                              ? t('common:placeholders.select-item', {
                                                                    item: t('common:labels.service'),
                                                                })
                                                              : t('common:placeholders.select-item', {
                                                                    item: t('common:labels.category'),
                                                                })}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="popover-content p-0">
                                                <Command className="p-0">
                                                    <CommandInput
                                                        placeholder={t('common:placeholders.search-item', {
                                                            item: t('common:labels.service'),
                                                        })}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                                        <CommandGroup>
                                                            {services.map((service, index) => (
                                                                <CommandItem
                                                                    key={index}
                                                                    value={service.value}
                                                                    className={cn('data-[selected=true]:bg-transparent')}
                                                                    onSelect={(currentValue) => {
                                                                        form.setData('service', {
                                                                            ...form.data.service,
                                                                            id: service.value,
                                                                        });
                                                                        form.forgetError('service.id');
                                                                        setOpenServicePopover(false);
                                                                    }}
                                                                >
                                                                    {/* {service.label}
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            'ml-auto h-4 w-4',
                                                                            form.data.service.id === service.value ? 'opacity-100' : 'opacity-0',
                                                                        )}
                                                                    /> */}
                                                                    {/* <div
                                                                        className={cn(
                                                                            'hover:bg-primary/10 text-input-foreground hover:ring-primary hover:ring-offset-background relative flex min-h-[85px] w-full cursor-pointer gap-4 rounded-lg border text-start shadow-sm duration-300 outline-none hover:ring-2 hover:ring-offset-2',
                                                                            form.data.service.id === service.value &&
                                                                            'bg-primary/10 ring-primary ring-offset-muted ring-2 ring-offset-2',
                                                                        )}
                                                                    >
                                                                        <span className="relative w-full">
                                                                            <span className="divide-muted-foreground/10 flex h-full flex-col justify-between divide-y">
                                                                                <div className="flex flex-col justify-start gap-1 p-3">
                                                                                    <span className="block text-[13px] font-semibold">
                                                                                        {service.label}
                                                                                    </span>
                                                                                    <div className="flex w-full items-center gap-2 md:gap-3">
                                                                                        <div>
                                                                                            {service.service_custom_price?.price > 0 ? (
                                                                                                <>
                                                                                                    <span className="text-primary flex items-center text-[12px] font-semibold md:text-[14px]">
                                                                                                        {formatCurrency(
                                                                                                            service.service_custom_price.price,
                                                                                                        )}
                                                                                                    </span>

                                                                                                    <span className="decoration-destructive text-destructive flex items-center text-[10px] font-semibold italic line-through decoration-[0.9px]">
                                                                                                        {formatCurrency(service.price)}
                                                                                                    </span>
                                                                                                </>
                                                                                            ) : (
                                                                                                <span className="text-primary flex items-center text-[12px] font-semibold md:text-[14px]">
                                                                                                    {formatCurrency(service.price)}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="from-muted to-muted/40 flex w-full gap-1 rounded-b-xl bg-gradient-to-b p-2">
                                                                                    <Badge variant="outline" className="rounded-sm text-[10px]">
                                                                                        {serviceTypes[service.type]}
                                                                                    </Badge>
                                                                                    {service.avg_time !== 0 && (
                                                                                        <Badge variant="default" className="rounded-sm text-[10px]">
                                                                                            {formatDuration(service.avg_time)}
                                                                                        </Badge>
                                                                                    )}
                                                                                    {service.is_recommended === 1 && (
                                                                                        <Badge variant="indigo" className="rounded-sm text-[10px]">
                                                                                            {t('common:labels.recommended')}
                                                                                        </Badge>
                                                                                    )}
                                                                                    {service.is_best_seller === 1 && (
                                                                                        <Badge variant="amber" className="rounded-sm text-[10px]">
                                                                                            {t('common:labels.best-seller')}
                                                                                        </Badge>
                                                                                    )}
                                                                                    {service.refill_days > 0 && service.is_refill_support === 1 && (
                                                                                        <Badge variant="green" className="rounded-sm text-[10px]">
                                                                                            {service.refill_days} {t('common:labels.day')}
                                                                                        </Badge>
                                                                                    )}
                                                                                    {service.is_cancel_support === 1 && (
                                                                                        <Badge variant="red" className="rounded-sm text-[10px]">
                                                                                            {t('common:labels.cancel')}
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </span>
                                                                        </span>
                                                                        {form.data.service.id === service.value && (
                                                                            <div className="absolute -top-1 -right-8.5">
                                                                                <div className="grid grid-cols-2 gap-x-2">
                                                                                    <div className="bg-primary flex items-center rounded-tr-lg rounded-bl-lg p-1">
                                                                                        <CheckIcon className="size-4 text-white" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div> */}
                                                                    {service.label} -{' '}
                                                                    {service.service_custom_price?.price > 0
                                                                        ? formatCurrency(service.service_custom_price.price)
                                                                        : formatCurrency(service.price)}
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            'ml-auto h-4 w-4',
                                                                            form.data.service.id === service.value ? 'opacity-100' : 'opacity-0',
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {form.invalid('service.id') && <InputError message={form.errors['service.id']} />}
                                    </div>
                                    {Object.keys(selectedService).length > 0 && (
                                        <Tabs defaultValue="details">
                                            <TabsList
                                                className={cn(
                                                    'grid w-full grid-cols-2',
                                                    configs.menu.user.order.summary.enabled === '1' ? 'grid' : 'hidden',
                                                )}
                                            >
                                                <TabsTrigger value="details">{t('common:labels.service-information')}</TabsTrigger>
                                                {configs.menu.user.order.summary.enabled === '1' && (
                                                    <TabsTrigger value="summary">{t('common:labels.order-summary')}</TabsTrigger>
                                                )}
                                            </TabsList>
                                            <TabsContent value="details">
                                                <ServiceDetails selectedService={selectedService} />
                                            </TabsContent>
                                            <TabsContent value="summary">
                                                <OrderSummary selectedService={selectedService} />
                                            </TabsContent>
                                        </Tabs>
                                    )}
                                    {form.data.order.type == 'single' && (
                                        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                                            <div
                                                className={cn(
                                                    'space-y-2',
                                                    Object.keys(selectedService).length > 0
                                                        ? [
                                                              'primary',
                                                              'custom_comments',
                                                              'mentions_with_hashtags',
                                                              'mentions_custom_list',
                                                              'mentions_hashtag',
                                                              'mentions_user_followers',
                                                              'mentions_media_likers',
                                                              'comment_likes',
                                                              'poll',
                                                              'comment_replies',
                                                          ].includes(selectedService.type)
                                                            ? 'col-span-6'
                                                            : 'col-span-12'
                                                        : 'col-span-6',
                                                )}
                                            >
                                                <Label className="flex justify-between">
                                                    <Label isRequired>{t('common:labels.target')}</Label>
                                                    {/* <div
                                                        className="text-primary cursor-pointer text-xs font-medium"
                                                        onClick={() => setIsDialogExampleTargetOpened(true)}
                                                    >
                                                        {t('orders:labels.view-order-target-example')}
                                                    </div> */}
                                                </Label>
                                                <Input
                                                    value={form.data.order.target}
                                                    onChange={(e) => {
                                                        form.setData('order', {
                                                            ...form.data.order,
                                                            target: e.target.value,
                                                        });
                                                    }}
                                                    onBlur={() => form.validate('order.target')}
                                                    aria-invalid={form.invalid('order.target')}
                                                />
                                                {form.invalid('order.target') && <InputError message={form.errors['order.target']} />}
                                            </div>
                                            <div
                                                className={cn(
                                                    'space-y-2',
                                                    Object.keys(selectedService).length > 0
                                                        ? [
                                                              'primary',
                                                              'custom_comments',
                                                              'mentions_with_hashtags',
                                                              'mentions_custom_list',
                                                              'mentions_hashtag',
                                                              'mentions_user_followers',
                                                              'mentions_media_likers',
                                                              'comment_likes',
                                                              'poll',
                                                              'comment_replies',
                                                          ].includes(selectedService.type)
                                                            ? 'col-span-6'
                                                            : 'hidden'
                                                        : 'col-span-6',
                                                )}
                                            >
                                                <Label className="flex justify-between">
                                                    <Label isRequired>{t('common:labels.quantity')}</Label>
                                                    {Object.keys(selectedService).length > 0 && (
                                                        <Badge className="rounded-sm py-1 text-[10px]">
                                                            {t('common:labels.minimum')}: {formatAmount(selectedService.min)} -{' '}
                                                            {t('common:labels.maximum')}: {formatAmount(selectedService.max)}
                                                        </Badge>
                                                    )}
                                                </Label>
                                                <InputMask
                                                    prefix="# "
                                                    min={0}
                                                    value={form.data.order.quantity}
                                                    onValueChange={(values) => {
                                                        form.setData('order', {
                                                            ...form.data.order,
                                                            quantity: values.floatValue,
                                                        });
                                                    }}
                                                    onBlur={() => form.validate('order.quantity')}
                                                    aria-invalid={form.invalid('order.quantity')}
                                                    disabled={
                                                        Object.keys(selectedService).length > 0 &&
                                                        ['custom_comments', 'mentions_custom_list', 'comment_replies'].includes(selectedService.type)
                                                            ? true
                                                            : false
                                                    }
                                                />
                                                {form.invalid('order.quantity') && <InputError message={form.errors['order.quantity']} />}
                                            </div>
                                            {Object.keys(selectedService).length > 0 && selectedService.type == 'mentions_hashtag' && (
                                                <div className="col-span-12 space-y-2">
                                                    <Label isRequired>{t('common:labels.hashtag')}</Label>
                                                    <Input
                                                        value={form.data.order.hashtag}
                                                        onChange={(e) => {
                                                            form.setData('order', {
                                                                ...form.data.order,
                                                                hashtag: e.target.value,
                                                            });
                                                        }}
                                                        onBlur={() => form.validate('order.hashtag')}
                                                        aria-invalid={form.invalid('order.hashtag')}
                                                    />
                                                    {form.invalid('order.hashtag') && <InputError message={form.errors['order.hashtag']} />}
                                                </div>
                                            )}
                                            {Object.keys(selectedService).length > 0 &&
                                                ['mentions_user_followers', 'comment_likes', 'comment_replies'].includes(selectedService.type) && (
                                                    <div className="col-span-12 space-y-2">
                                                        <Label isRequired>{t('common:labels.username')}</Label>
                                                        <Input
                                                            value={form.data.order.username}
                                                            onChange={(e) => {
                                                                form.setData('order', {
                                                                    ...form.data.order,
                                                                    username: e.target.value,
                                                                });
                                                            }}
                                                            onBlur={() => form.validate('order.username')}
                                                            aria-invalid={form.invalid('order.username')}
                                                        />
                                                        {form.invalid('order.username') && <InputError message={form.errors['order.username']} />}
                                                    </div>
                                                )}
                                            {Object.keys(selectedService).length > 0 && selectedService.type == 'mentions_media_likers' && (
                                                <div className="col-span-12 space-y-2">
                                                    <Label isRequired>{t('common:labels.media-url')}</Label>
                                                    <Input
                                                        type="url"
                                                        value={form.data.order.media_url}
                                                        onChange={(e) => {
                                                            form.setData('order', {
                                                                ...form.data.order,
                                                                media_url: e.target.value,
                                                            });
                                                        }}
                                                        onBlur={() => form.validate('order.media_url')}
                                                        aria-invalid={form.invalid('order.media_url')}
                                                    />
                                                    {form.invalid('order.media_url') && <InputError message={form.errors['order.media_url']} />}
                                                </div>
                                            )}
                                            {Object.keys(selectedService).length > 0 && selectedService.type == 'poll' && (
                                                <div className="col-span-12 space-y-2">
                                                    <Label isRequired>{t('common:labels.answer-number')}</Label>
                                                    <Input
                                                        type="number"
                                                        value={form.data.order.answer_number}
                                                        onChange={(e) => {
                                                            form.setData('order', {
                                                                ...form.data.order,
                                                                answer_number: e.target.value,
                                                            });
                                                        }}
                                                        onBlur={() => form.validate('order.answer_number')}
                                                        aria-invalid={form.invalid('order.answer_number')}
                                                    />
                                                    {form.invalid('order.answer_number') && (
                                                        <InputError message={form.errors['order.answer_number']} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {form.data.order.type == 'single' &&
                                        Object.keys(selectedService).length > 0 &&
                                        ['custom_comments', 'custom_comments_package', 'comment_replies'].includes(selectedService.type) && (
                                            <div className="space-y-2">
                                                <Label isRequired>{t('common:labels.comments')}</Label>
                                                <Textarea
                                                    placeholder={t('common:placeholders.separate-quantities-by-line')}
                                                    rows="10"
                                                    value={form.data.order.comments}
                                                    onChange={(e) => {
                                                        form.setData('order', {
                                                            ...form.data.order,
                                                            comments: e.target.value,
                                                        });
                                                    }}
                                                    onBlur={() => {
                                                        form.validate('order.comments');
                                                        form.validate('order.quantity');
                                                    }}
                                                    aria-invalid={form.invalid('order.comments')}
                                                />
                                                {form.invalid('order.comments') && <InputError message={form.errors['order.comments']} />}
                                            </div>
                                        )}
                                    {form.data.order.type == 'single' &&
                                        Object.keys(selectedService).length > 0 &&
                                        ['mentions_with_hashtags', 'mentions_custom_list'].includes(selectedService.type) && (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                                {['mentions_with_hashtags', 'mentions_custom_list'].includes(selectedService.type) && (
                                                    <div
                                                        className={cn(
                                                            'space-y-2',
                                                            selectedService.type == 'mentions_with_hashtags' ? 'col-span-6' : 'col-span-12',
                                                        )}
                                                    >
                                                        <Label isRequired>{t('common:labels.usernames')}</Label>
                                                        <Textarea
                                                            placeholder={t('common:placeholders.separate-usernames-by-line')}
                                                            rows="5"
                                                            value={form.data.order.usernames}
                                                            onChange={(e) => {
                                                                form.setData('order', {
                                                                    ...form.data.order,
                                                                    usernames: e.target.value,
                                                                });
                                                            }}
                                                            onBlur={() => form.validate('order.usernames')}
                                                            aria-invalid={form.invalid('order.usernames')}
                                                        />
                                                        {form.invalid('order.usernames') && <InputError message={form.errors['order.usernames']} />}
                                                    </div>
                                                )}
                                                {selectedService.type == 'mentions_with_hashtags' && (
                                                    <div className="col-span-6 space-y-2">
                                                        <Label isRequired>{t('common:labels.hashtags')}</Label>
                                                        <Textarea
                                                            placeholder={t('common:placeholders.separate-hashtags-by-line')}
                                                            rows="5"
                                                            value={form.data.order.hashtags}
                                                            onChange={(e) => {
                                                                form.setData('order', {
                                                                    ...form.data.order,
                                                                    hashtags: e.target.value,
                                                                });
                                                            }}
                                                            onBlur={() => form.validate('order.hashtags')}
                                                            aria-invalid={form.invalid('order.hashtags')}
                                                        />
                                                        {form.invalid('order.hashtags') && <InputError message={form.errors['order.hashtags']} />}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    {form.data.order.type == 'mass' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="flex justify-between">
                                                    <Label isRequired>
                                                        {t('common:labels.target')} & {t('common:labels.quantity')}
                                                    </Label>
                                                    {Object.keys(selectedService).length > 0 && (
                                                        <Badge className="rounded-sm py-1 text-[10px]">
                                                            {t('common:labels.minimum')}: {formatAmount(selectedService.min)} -{' '}
                                                            {t('common:labels.maximum')}: {formatAmount(selectedService.max)}
                                                        </Badge>
                                                    )}
                                                </Label>
                                                <Textarea
                                                    placeholder={t('common:placeholders.order-mass')}
                                                    rows="10"
                                                    value={form.data.order.mass}
                                                    onChange={(e) => {
                                                        form.setData('order', {
                                                            ...form.data.order,
                                                            mass: e.target.value,
                                                        });
                                                    }}
                                                    onBlur={() => form.validate('order.mass')}
                                                    aria-invalid={form.invalid('order.mass')}
                                                />
                                                {form.invalid('order.mass') && <InputError message={form.errors['order.mass']} />}
                                            </div>
                                        </>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('common:labels.total-price')}</Label>
                                            <Input value={formatCurrency(totalPrice)} readOnly />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('common:labels.balance')}</Label>
                                            <Input value={formatCurrency(auth.user.balance)} readOnly />
                                        </div>
                                    </div>
                                    <div className="flex justify-end overflow-hidden">
                                        {auth.user.balance < totalPrice ? (
                                            <Link
                                                href={route('user.deposits.create')}
                                                className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }), 'w-full')}
                                            >
                                                <WalletAdd01Icon className="h-4 w-4" />
                                                {t('orders:toast.insufficient-balance')}
                                            </Link>
                                        ) : (
                                            <Button size="sm" type="submit" className="w-full" disabled={form.processing}>
                                                {!form.processing ? (
                                                    <>
                                                        <ShoppingBagAddIcon className="h-4 w-4" /> {t('orders:create.button')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loading02Icon className="h-4 w-4 animate-spin" /> {t('common:loading.please-wait')}
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="order-first w-full pt-0 pb-2 sm:w-full md:w-full xl:order-none xl:w-[45%] xl:pb-0 xl:pl-6">
                        <div className="">
                            <Accordion
                                type="single"
                                className={cn(Object.keys(selectedService).length > 0 ? '' : '')}
                                defaultValue={isSmallScreen ? '' : 'item-0'}
                                collapsible
                            >
                                {configs.order_info.map((item, index) => (
                                    <AccordionItem
                                        className="bg-card text-card-foreground mb-4 rounded-xl border shadow"
                                        value={`item-${index}`}
                                        key={index}
                                    >
                                        <AccordionTrigger className="px-6">
                                            <div className="flex items-center">
                                                <DynamicIcon className="mr-2 h-4 w-4" iconName={item.icon.trim()} size={16} />
                                                {item.title}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="prose prose-sm border-t px-6 pt-4 text-sm">
                                            {toHTML(item.content)}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </div>
            </Deferred>
            <Transition appear show={isDialogExampleTargetOpened} as={Fragment}>
                <HeadlessDialog as="div" className="relative z-50" onClose={() => setIsDialogExampleTargetOpened(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <HeadlessDialogPanel className="border-border/25 bg-secondary relative w-full translate-y-0 transform overflow-hidden !rounded-2xl border text-left shadow-xl transition-all sm:my-8 sm:max-w-3xl">
                                    <div className="absolute top-0 right-0 z-40 block pt-4 pr-4">
                                        <button
                                            type="button"
                                            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                            onClick={() => {
                                                setIsDialogExampleTargetOpened(false);
                                            }}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="w-full overflow-auto p-4">
                                        <OrderExampleTarget />
                                    </div>
                                </HeadlessDialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </HeadlessDialog>
            </Transition>
            {/* <Dialog open={isDialogExampleTargetOpened} onOpenChange={setIsDialogExampleTargetOpened}>
             
                <DialogContent className="max-w-4xl pt-2">
                    <DialogHeader>
                        <DialogTitle />
                        <DialogDescription />
                    </DialogHeader>
                    
                </DialogContent>
            </Dialog> */}
        </AppLayout>
    );
}

const IconTags = () => {
    return (
        <div className="flex gap-3">
            <TooltipProvider delayDuration={0}>
                {[...Array(25)].map((_, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger>
                            <Instagram className="text-primary h-5 w-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Index {index + 1}</p>
                        </TooltipContent>
                    </Tooltip>
                    // <Instagram className="text-primary w-5 h-5" />
                ))}
            </TooltipProvider>
        </div>
    );
};
