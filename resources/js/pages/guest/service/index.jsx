import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DynamicIcon from '@/components/ui/dynamic-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RatingBadge, RatingStars } from '@/components/ui/rating-stars';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDuration, toHTML } from '@/lib/utils';
import { Deferred, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    CancelCircleIcon,
    FavouriteIcon,
    HeartCheckIcon,
    HeartRemoveIcon,
    Recycle03Icon,
    ShoppingBagAddIcon,
    StarIcon,
    TagsIcon,
    ThumbsUpIcon,
    ViewIcon,
} from 'hugeicons-react';
import { ArrowDown, ArrowUp, CheckIcon, ChevronsUpDown, CircleX, RotateCcw } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Index({ pageProps }) {
    const { auth, locales } = usePage().props;
    const { i18n } = useTranslation();
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [openDialog, setOpenDialog] = useState(false);
    const [openServiceCategoryGroupPopover, setOpenServiceCategoryGroupPopover] = useState(false);
    const [openServiceCategoryPopover, setOpenServiceCategoryPopover] = useState(false);
    const [openOtherFilterPopover, setOpenOtherFilterPopover] = useState(false);
    const [selectedOtherFilter, setSelectedOtherFilter] = useState(new Set());
    const [serviceCategories, setServiceCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [service, setService] = useState({});
    const [loading, setLoading] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewMessage, setReviewMessage] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [categorySort, setCategorySort] = useState('asc');
    const [categoryPage, setCategoryPage] = useState(1);
    const [paginationMaxPage, setPaginationMaxPage] = useState(1);

    const PAGE_SIZE = 30;

    const [filterData, setFilterData] = useState({
        service: {
            category_group_id: 'all',
            category_id: '',
            is_favorites: false,
            is_recommendation: false,
            is_refill_support: false,
            is_cancel_support: false,
            search: '',
        },
    });

    // Penanda permintaan agar respons lama (race saat filter diganti cepat) tidak menimpa hasil terbaru.
    const servicesRequestIdRef = useRef(0);

    // Flag boolean bisa keluar sebagai '1' (string), 1 (integer), atau true tergantung sumber data.
    const isFlagOn = (value) => value === true || String(value) === '1';

    const serviceCategoryGroups = [
        {
            value: 'all',
            label: 'Semua',
            type: 'icon',
            icon: 'Menu01Icon',
        },
        ...(pageProps?.serviceCategoryGroups ?? []).map((serviceCategoryGroup) => ({
            value: serviceCategoryGroup.id,
            label: serviceCategoryGroup.name,
            type: serviceCategoryGroup.type,
            icon: serviceCategoryGroup.icon,
            emoji: serviceCategoryGroup.emoji,
        })),
    ];

    const otherFilters = [
        { key: 'is_favorites', label: 'Layanan Favorit Saya', icon: <FavouriteIcon className="size-4" /> },
        { key: 'is_recommendation', label: 'Layanan Rekomendasi', icon: <ThumbsUpIcon className="size-4" /> },
        { key: 'is_refill_support', label: 'Dukungan Isi Ulang', icon: <RotateCcw className="size-4" /> },
        { key: 'is_cancel_support', label: 'Dukungan Pembatalan', icon: <CircleX className="size-4" /> },
    ];

    const selectedServiceCategoryGroup = serviceCategoryGroups.find(
        (option) => String(option.value) === String(filterData.service.category_group_id),
    );
    const selectedServiceCategory = serviceCategories.find((option) => String(option.value) === String(filterData.service.category_id));

    const getServiceCategories = async (serviceCategoryGroupID = 'all') => {
        try {
            const response = await axios.post(route('ajax.services.categories.index'), {
                service: {
                    category: {
                        group: {
                            id: serviceCategoryGroupID === 'all' ? null : serviceCategoryGroupID,
                        },
                    },
                    is_favorites: filterData.service.is_favorites,
                },
            });
            if (response.data.status) {
                const flatCategories = (response.data.serviceCategories ?? []).flatMap((group) => group.options ?? []);
                // Sort client-side (localeCompare + spasi dinormalkan) agar daftar flat benar-benar alfabetis di UI.
                flatCategories.sort((a, b) =>
                    String(a.label)
                        .replace(/\s+/g, ' ')
                        .trim()
                        .localeCompare(String(b.label).replace(/\s+/g, ' ').trim(), 'id', { sensitivity: 'base', numeric: true }),
                );
                setServiceCategories(flatCategories);
            } else {
                setServiceCategories([]);
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            setServiceCategories([]);
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        }
    };

    const getServices = async (page = 1, orderOverride = null) => {
        const requestId = ++servicesRequestIdRef.current;
        setLoading(true);
        try {
            const sort = orderOverride ?? categorySort;
            const order = { column: 'category', direction: sort === 'desc' ? 'desc' : 'asc' };
            const filter = {};
            if (filterData.service.search) {
                filter.search = filterData.service.search;
            }
            if (filterData.service.category_group_id !== 'all') {
                filter.service_category_group_id = filterData.service.category_group_id;
            }
            if (filterData.service.category_id) {
                filter.service_category_id = filterData.service.category_id;
            }
            const other = [];
            if (filterData.service.is_favorites) {
                other.push('favorite');
            }
            if (filterData.service.is_recommendation) {
                other.push('recommended');
            }
            if (filterData.service.is_refill_support) {
                other.push('refill');
            }
            if (filterData.service.is_cancel_support) {
                other.push('cancel');
            }
            if (other.length > 0) {
                filter.other = other.join(',');
            }
            // Ambil halaman 1 s.d. `page` sekaligus lalu digabung — daftar bertambah tanpa kehilangan halaman sebelumnya.
            const MAX_PAGES = 50;
            const targetPage = Math.min(Math.max(page, 1), MAX_PAGES);
            const responses = await Promise.all(
                Array.from({ length: targetPage }, (_, index) =>
                    axios.get(
                        route('guest.services.index', {
                            page: index + 1,
                            length: PAGE_SIZE,
                            order,
                            filter,
                        }),
                    ),
                ),
            );
            if (requestId !== servicesRequestIdRef.current) return;
            const rows = responses.flatMap((response) => response.data?.data?.data ?? []);
            const lastPageMeta = responses[responses.length - 1]?.data?.data;
            if (responses.every((response) => response.data?.status) && rows.length > 0) {
                setServices(rows);
                setCategoryPage(targetPage);
                setPaginationMaxPage(lastPageMeta?.last_page ?? 1);
            } else {
                setServices([]);
                setCategoryPage(1);
                setPaginationMaxPage(1);
                toast({
                    variant: 'error',
                    description: toHTML('Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            if (requestId !== servicesRequestIdRef.current) return;
            setServices([]);
            setCategoryPage(1);
            setPaginationMaxPage(1);
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        } finally {
            if (requestId === servicesRequestIdRef.current) {
                setLoading(false);
            }
        }
    };

    const handleCategorySort = () => {
        const next = categorySort === 'asc' ? 'desc' : 'asc';
        setCategorySort(next);
        getServices(1, next);
    };

    // Jendela nomor halaman ala smm: maks 5 nomor + halaman pertama/terakhir + elipsis.
    const getPageNumbers = () => {
        const current = categoryPage;
        const last = paginationMaxPage;
        const windowSize = 5;
        let start = Math.max(1, current - Math.floor(windowSize / 2));
        let end = Math.min(last, start + windowSize - 1);
        start = Math.max(1, end - windowSize + 1);
        const result = [];
        if (start > 1) {
            result.push(1);
            if (start > 2) result.push('ellipsis-start');
        }
        for (let p = start; p <= end; p++) result.push(p);
        if (end < last) {
            if (end < last - 1) result.push('ellipsis-end');
            result.push(last);
        }
        return result;
    };

    // Layanan terurut by kategori (urutan datang dari backend), dikelompokkan untuk render header per kategori.
    const groupedServices = useMemo(() => {
        const groups = new Map();
        for (const item of services) {
            const key = item.service_category?.name ?? 'Tanpa Kategori';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        }
        return [...groups.entries()].map(([categoryName, items]) => ({
            categoryName,
            items,
        }));
    }, [services]);

    const handleFavorite = async (item) => {
        try {
            const type = item.is_favorite ? 'remove' : 'add';
            const response = await axios.post(route('ajax.services.favorite', { type }), {
                service_id: [item.id],
            });
            if (response.data.status) {
                setServices((prevState) => prevState.map((row) => (row.id === item.id ? { ...row, is_favorite: type === 'add' } : row)));
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message ?? 'Berhasil memperbarui favorit.'),
                });
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan coba lagi.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan coba lagi.'),
            });
        }
    };

    const openServiceDetailDialog = (item) => {
        setOpenDialog(true);
        setService(item);
        setReviewRating(0);
        setReviewMessage('');
        setReviewSubmitted(false);
        axios
            .post(route('ajax.services.show', { target: item.id }))
            .then((response) => {
                if (response.data.status) setService((prevState) => ({ ...prevState, ...response.data.service }));
            })
            .catch(() => {
                toast({
                    variant: 'error',
                    description: toHTML('Terjadi kesalahan, silahkan coba lagi.'),
                });
            });
    };

    const submitServiceReview = async () => {
        if (!service?.can_review || !service?.review_order_id || reviewRating < 1 || submittingReview) return;
        setSubmittingReview(true);
        try {
            const response = await axios.post(route('user.orders.reviews.store'), {
                order_id: service.review_order_id,
                rating: reviewRating,
                message: reviewMessage,
            });
            if (response.data.status) {
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message ?? 'Ulasan berhasil dikirim.'),
                });
                setReviewSubmitted(true);
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan coba lagi.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan coba lagi.'),
            });
        } finally {
            setSubmittingReview(false);
        }
    };

    useEffect(() => {
        setServiceCategories([]);
        getServiceCategories(filterData.service.category_group_id);
    }, [filterData.service.category_group_id]);

    useEffect(() => {
        setServices([]);
        if (filterData.service.category_id) {
            getServices(1);
        }
    }, [filterData.service.category_id]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setServices([]);
            getServices(1);
        }, 200);
        return () => clearTimeout(delay);
    }, [
        filterData.service.category_group_id,
        filterData.service.is_favorites,
        filterData.service.is_recommendation,
        filterData.service.is_refill_support,
        filterData.service.is_cancel_support,
        filterData.service.search,
    ]);

    return (
        <AppLayout
            pageTitle="Layanan - Daftar"
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: 'Layanan',
                    href: '/',
                },
                {
                    title: 'Daftar',
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="grid grid-cols-1">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Daftar Layanan
                                    <button
                                        type="button"
                                        onClick={handleCategorySort}
                                        aria-label={categorySort === 'asc' ? 'Urutkan kategori Z-A' : 'Urutkan kategori A-Z'}
                                        title={categorySort === 'asc' ? 'Kategori A-Z (klik untuk Z-A)' : 'Kategori Z-A (klik untuk A-Z)'}
                                        className="text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-normal"
                                    >
                                        {categorySort === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        {categorySort === 'asc' ? 'A-Z' : 'Z-A'}
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-12">
                                <div className="grid w-full space-y-2 sm:col-span-6 lg:col-span-4">
                                    <Label>Grup</Label>
                                    <Popover open={openServiceCategoryGroupPopover} onOpenChange={setOpenServiceCategoryGroupPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn('justify-between', filterData.service.category_group_id ? '' : 'text-muted-foreground')}
                                            >
                                                {selectedServiceCategoryGroup ? (
                                                    <div
                                                        className={cn(
                                                            'flex items-center',
                                                            selectedServiceCategoryGroup.type === 'icon' ? 'gap-2' : 'gap-1',
                                                        )}
                                                    >
                                                        {selectedServiceCategoryGroup.type === 'icon' ? (
                                                            <DynamicIcon
                                                                className="-mb-px"
                                                                iconName={String(selectedServiceCategoryGroup.icon ?? '').trim()}
                                                                size={16}
                                                            />
                                                        ) : (
                                                            <span>{selectedServiceCategoryGroup.emoji}</span>
                                                        )}
                                                        <span>{selectedServiceCategoryGroup.label}</span>
                                                    </div>
                                                ) : (
                                                    'Pilih...'
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Command>
                                                <CommandInput placeholder="Cari Grup..." />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {serviceCategoryGroups.map((serviceCategoryGroup, index) => (
                                                            <CommandItem
                                                                key={index}
                                                                value={`${serviceCategoryGroup.value}`}
                                                                className={cn(
                                                                    String(filterData.service.category_group_id) ===
                                                                        String(serviceCategoryGroup.value) && 'bg-muted',
                                                                )}
                                                                onSelect={() => {
                                                                    setFilterData((prevState) => ({
                                                                        ...prevState,
                                                                        service: {
                                                                            ...prevState.service,
                                                                            category_group_id: serviceCategoryGroup.value,
                                                                            category_id: '',
                                                                        },
                                                                    }));
                                                                    setOpenServiceCategoryGroupPopover(false);
                                                                }}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        'flex items-center',
                                                                        serviceCategoryGroup.type === 'icon' ? 'gap-2' : 'gap-1',
                                                                    )}
                                                                >
                                                                    {serviceCategoryGroup.type === 'icon' ? (
                                                                        <DynamicIcon
                                                                            className="-mb-px"
                                                                            iconName={String(serviceCategoryGroup.icon ?? '').trim()}
                                                                            size={16}
                                                                        />
                                                                    ) : (
                                                                        <span>{serviceCategoryGroup.emoji}</span>
                                                                    )}
                                                                    <span>{serviceCategoryGroup.label}</span>
                                                                </div>
                                                                <CheckIcon
                                                                    className={cn(
                                                                        'ml-auto h-4 w-4',
                                                                        String(filterData.service.category_group_id) ===
                                                                            String(serviceCategoryGroup.value)
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
                                </div>
                                <div className="grid w-full space-y-2 sm:col-span-6 lg:col-span-4">
                                    <Label>Kategori</Label>
                                    <Popover open={openServiceCategoryPopover} onOpenChange={setOpenServiceCategoryPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('justify-between', filterData.service.category_id ? '' : 'text-muted-foreground')}
                                            >
                                                <span className="max-w-[200px] truncate lg:max-w-[150px] xl:max-w-[250px] 2xl:max-w-[350px]">
                                                    {filterData.service.category_id ? (selectedServiceCategory?.label ?? 'Pilih...') : 'Pilih...'}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Command>
                                                <CommandInput placeholder="Cari Kategori..." />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {serviceCategories.map((serviceCategory, index) => (
                                                            <CommandItem
                                                                key={index}
                                                                value={`${serviceCategory.value}`}
                                                                className={cn(
                                                                    String(filterData.service.category_id) === String(serviceCategory.value) &&
                                                                        'bg-muted',
                                                                )}
                                                                onSelect={() => {
                                                                    setFilterData((prevState) => ({
                                                                        ...prevState,
                                                                        service: {
                                                                            ...prevState.service,
                                                                            category_id: serviceCategory.value,
                                                                        },
                                                                    }));
                                                                    setOpenServiceCategoryPopover(false);
                                                                }}
                                                            >
                                                                {serviceCategory.label}
                                                                <CheckIcon
                                                                    className={cn(
                                                                        'ml-auto h-4 w-4',
                                                                        String(filterData.service.category_id) === String(serviceCategory.value)
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
                                </div>
                                <div className="grid w-full space-y-2 sm:col-span-6 lg:col-span-4">
                                    <Label>Lainnya</Label>
                                    <Popover open={openOtherFilterPopover} onOpenChange={setOpenOtherFilterPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('justify-between', selectedOtherFilter.size === 0 && 'text-muted-foreground')}
                                            >
                                                {!selectedOtherFilter.size && 'Pilih...'}
                                                {selectedOtherFilter.size > 0 && (
                                                    <>
                                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal xl:hidden">
                                                            {selectedOtherFilter.size} dipilih
                                                        </Badge>
                                                        <div className="hidden space-x-1 xl:flex">
                                                            {selectedOtherFilter.size > 3 ? (
                                                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                                                    {selectedOtherFilter.size} dipilih
                                                                </Badge>
                                                            ) : (
                                                                otherFilters
                                                                    .filter((option) => selectedOtherFilter.has(option.key))
                                                                    .map((option) => (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            key={option.key}
                                                                            className="rounded-sm px-1 font-normal"
                                                                        >
                                                                            <span className="max-w-[100px] truncate">{option.label}</span>
                                                                        </Badge>
                                                                    ))
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Command>
                                                <CommandInput placeholder="Cari..." />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {otherFilters.map((option) => {
                                                            const isSelected = selectedOtherFilter.has(option.key);
                                                            return (
                                                                <CommandItem
                                                                    key={option.key}
                                                                    onSelect={() => {
                                                                        const newSelectedOtherFilter = new Set(selectedOtherFilter);
                                                                        if (newSelectedOtherFilter.has(option.key)) {
                                                                            newSelectedOtherFilter.delete(option.key);
                                                                        } else {
                                                                            newSelectedOtherFilter.add(option.key);
                                                                        }
                                                                        setSelectedOtherFilter(newSelectedOtherFilter);
                                                                        setFilterData((prevState) => ({
                                                                            ...prevState,
                                                                            service: {
                                                                                ...prevState.service,
                                                                                is_favorites:
                                                                                    option.key === 'is_favorites'
                                                                                        ? !filterData.service.is_favorites
                                                                                        : filterData.service.is_favorites,
                                                                                is_recommendation:
                                                                                    option.key === 'is_recommendation'
                                                                                        ? !filterData.service.is_recommendation
                                                                                        : filterData.service.is_recommendation,
                                                                                is_refill_support:
                                                                                    option.key === 'is_refill_support'
                                                                                        ? !filterData.service.is_refill_support
                                                                                        : filterData.service.is_refill_support,
                                                                                is_cancel_support:
                                                                                    option.key === 'is_cancel_support'
                                                                                        ? !filterData.service.is_cancel_support
                                                                                        : filterData.service.is_cancel_support,
                                                                            },
                                                                        }));
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={cn(
                                                                            'border-primary mr-2 flex size-4 items-center justify-center rounded-sm border',
                                                                            isSelected
                                                                                ? 'bg-primary text-primary-foreground'
                                                                                : 'opacity-50 [&_svg]:invisible',
                                                                        )}
                                                                    >
                                                                        <CheckIcon className="size-4" aria-hidden="true" />
                                                                    </div>
                                                                    {option.icon}
                                                                    <span>{option.label}</span>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                    {selectedOtherFilter.size > 0 && (
                                                        <>
                                                            <CommandSeparator />
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    className="justify-center text-center"
                                                                    onSelect={() => {
                                                                        setSelectedOtherFilter(new Set());
                                                                        setFilterData((prevState) => ({
                                                                            ...prevState,
                                                                            service: {
                                                                                ...prevState.service,
                                                                                is_favorites: false,
                                                                                is_recommendation: false,
                                                                                is_refill_support: false,
                                                                                is_cancel_support: false,
                                                                            },
                                                                        }));
                                                                    }}
                                                                >
                                                                    Bersihkan
                                                                </CommandItem>
                                                            </CommandGroup>
                                                        </>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="col-span-full grid w-full space-y-2">
                                    <Label>Cari</Label>
                                    <Input
                                        placeholder="Ketikkan ID/Kategori/Nama Layanan..."
                                        value={filterData.service.search}
                                        onChange={(e) => {
                                            setFilterData((prevState) => ({
                                                ...prevState,
                                                service: {
                                                    ...prevState.service,
                                                    search: e.target.value,
                                                },
                                            }));
                                        }}
                                    />
                                </div>
                                {services.length === 0 && !loading && (
                                    <Alert className="bg-primary text-primary-foreground col-span-full text-center">
                                        <AlertDescription className="text-primary-foreground animate-pulse">
                                            Tidak ada layanan tersedia...
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {loading && (
                                    <Alert className="bg-primary text-primary-foreground col-span-full text-center">
                                        <AlertDescription className="text-primary-foreground animate-pulse">Mohon tunggu...</AlertDescription>
                                    </Alert>
                                )}
                                {services.length > 0 && (
                                    <div className="col-span-full overflow-auto rounded-xl border">
                                        <table className="divide-muted min-w-full divide-y-2 text-sm">
                                            <thead className="bg-muted text-left">
                                                <tr>
                                                    <th className="w-16 px-4 py-2 font-medium whitespace-nowrap"></th>
                                                    <th className="px-4 py-2 font-semibold whitespace-nowrap">Layanan</th>
                                                    <th className="px-4 py-2 font-medium whitespace-nowrap">Min</th>
                                                    <th className="px-4 py-2 font-medium whitespace-nowrap">Maks</th>
                                                    <th className="px-4 py-2 font-medium whitespace-nowrap">Harga</th>
                                                    <th className="px-4 py-2 font-medium whitespace-nowrap">Waktu Rata-Rata</th>
                                                    <th className="px-4 py-2 font-medium whitespace-nowrap">Rating</th>
                                                    <th className="px-4 py-2 font-medium whitespace-nowrap">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-muted divide-y">
                                                {groupedServices.map((group) => (
                                                    <Fragment key={group.categoryName}>
                                                        <tr className="bg-primary/10">
                                                            <td colSpan={8} className="px-4 py-2.5 text-center font-bold">
                                                                {group.categoryName}
                                                            </td>
                                                        </tr>
                                                        {group.items.map((item) => (
                                                            <tr className="even:bg-muted/50 hover:bg-muted/50" key={item.id}>
                                                                <td className="px-4 py-2 text-center align-middle">
                                                                    {auth.user && (
                                                                        <button
                                                                            type="button"
                                                                            aria-label={
                                                                                item.is_favorite ? 'Hapus dari Favorit' : 'Tambahkan ke Favorit'
                                                                            }
                                                                            onClick={() => handleFavorite(item)}
                                                                            className="inline-flex cursor-pointer items-center justify-center"
                                                                        >
                                                                            {item.is_favorite ? (
                                                                                <HeartRemoveIcon className="h-4 w-4 text-red-500" />
                                                                            ) : (
                                                                                <HeartCheckIcon className="h-4 w-4 text-gray-400" />
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2">{item.name}</td>
                                                                <td className="px-4 py-2">{formatAmount(item.min)}</td>
                                                                <td className="px-4 py-2">{formatAmount(item.max)}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.price)}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap">
                                                                    {item.avg_time > 0 ? formatDuration(item.avg_time) : 'Layanan baru'}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <RatingBadge rating={item.avg_ratings} total={item.total_ratings} />
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <div className="flex flex-col items-stretch justify-center gap-1.5">
                                                                        {auth.user && (
                                                                            <Link
                                                                                href={route('user.orders.create', {
                                                                                    target: item.id,
                                                                                })}
                                                                                className="block"
                                                                            >
                                                                                <Button size="sm" variant="success" className="h-7 w-full gap-1 px-2">
                                                                                    <ShoppingBagAddIcon className="h-3.5 w-3.5" />
                                                                                    Pesan
                                                                                </Button>
                                                                            </Link>
                                                                        )}
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-7 gap-1 px-2"
                                                                            onClick={() => openServiceDetailDialog(item)}
                                                                        >
                                                                            <ViewIcon className="h-3.5 w-3.5" />
                                                                            Detail
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {services.length > 0 && paginationMaxPage > 1 && (
                                    <div className="col-span-full">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href="#"
                                                        className={cn(categoryPage <= 1 && 'pointer-events-none opacity-50')}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (categoryPage > 1) getServices(categoryPage - 1);
                                                        }}
                                                    />
                                                </PaginationItem>
                                                {getPageNumbers().map((page) =>
                                                    typeof page === 'number' ? (
                                                        <PaginationItem key={`page-${page}`}>
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={page === categoryPage}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (page !== categoryPage) getServices(page);
                                                                }}
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ) : (
                                                        <PaginationItem key={page}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    ),
                                                )}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        href="#"
                                                        className={cn(categoryPage >= paginationMaxPage && 'pointer-events-none opacity-50')}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (categoryPage < paginationMaxPage) getServices(categoryPage + 1);
                                                        }}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detail Layanan</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="prose prose-sm h-[400px] text-sm xl:h-[500px]">
                            {(isFlagOn(service.is_recommended) || isFlagOn(service.is_refill_support) || isFlagOn(service.is_cancel_support)) && (
                                <div className="border-b pb-3">
                                    <h2 className="mb-1 text-sm font-semibold">Label</h2>
                                    <div className="flex items-center space-x-2">
                                        {isFlagOn(service.is_recommended) && (
                                            <Badge className="mt-1 h-5 text-[11px]">
                                                <TagsIcon className="mr-1 h-[13px] w-[13px]" />
                                                Rekomendasi
                                            </Badge>
                                        )}
                                        {isFlagOn(service.is_refill_support) && (
                                            <Badge variant="green" className="mt-1 h-5 text-[11px]">
                                                <Recycle03Icon className="mr-1 h-[13px] w-[13px]" />
                                                Isi Ulang
                                            </Badge>
                                        )}
                                        {isFlagOn(service.is_cancel_support) && (
                                            <Badge variant="red" className="mt-1 h-5 text-[11px]">
                                                <CancelCircleIcon className="mr-1 h-[13px] w-[13px]" />
                                                Pembatalan
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="border-b pb-3">
                                <h2 className="mb-1 text-sm font-semibold">ID</h2>
                                <div className="flex items-center space-x-2">
                                    <p className="text-muted-foreground text-sm">
                                        #{service.id} - {service.name}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 border-b pb-3">
                                <div>
                                    <h2 className="mb-1 text-sm font-semibold">Harga/K</h2>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-muted-foreground text-sm">{formatCurrency(service.price)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="mb-1 text-sm font-semibold">Min.</h2>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-muted-foreground text-sm">{formatAmount(service.min)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="mb-1 text-sm font-semibold">Maks.</h2>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-muted-foreground text-sm">{formatAmount(service.max)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="mb-1 text-sm font-semibold">Isi Ulang</h2>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-muted-foreground text-sm">
                                            {isFlagOn(service.is_refill_support) ? formatAmount(service.refill_days) : 'Tidak didukung'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b pb-3">
                                <h2 className="mb-1 text-sm font-semibold">Rata-Rata</h2>
                                <div className="flex items-center space-x-2">
                                    <div className="text-muted-foreground flex flex-col text-sm">
                                        {service.avg_quantity > 0 || service.avg_time > 0 ? (
                                            <>
                                                <div>
                                                    Jumlah pesan rata-rata <span className="font-medium">{service.avg_quantity}</span>.
                                                </div>
                                                <div>
                                                    Waktu proses rata-rata{' '}
                                                    <span className="font-medium">{formatDuration(service.avg_time || 0)}</span>.
                                                </div>
                                            </>
                                        ) : (
                                            'Belum ada data.'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="border-b pb-3">
                                <h2 className="mb-1 text-sm font-semibold">Ulasan Pembeli</h2>
                                {service.total_ratings > 0 ? (
                                    <>
                                        <RatingBadge rating={service.avg_ratings} total={service.total_ratings} size={16} />
                                        <div className="mt-2 space-y-2">
                                            {(service.reviews ?? []).map((review, index) => (
                                                <div key={index} className="rounded-lg border p-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <RatingStars rating={review.rating} size={12} />
                                                        <span className="text-muted-foreground text-xs">{review.user?.username}</span>
                                                    </div>
                                                    {review.message && (
                                                        <p className="text-muted-foreground mt-1 text-xs whitespace-pre-line">{review.message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Belum ada ulasan.</p>
                                )}
                                <div className="mt-3 border-t pt-3">
                                    <Label className="mb-2">Beri Ulasan</Label>
                                    {!auth?.user ? (
                                        <p className="text-muted-foreground text-sm">
                                            Masuk untuk memberikan ulasan layanan ini.{' '}
                                            <Link href={route('user.auth.signin')} className="text-primary font-medium underline">
                                                Masuk
                                            </Link>
                                        </p>
                                    ) : service.can_review && !reviewSubmitted ? (
                                        <div className="grid gap-3">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewRating(star)}
                                                        aria-label={`Beri ${star} bintang`}
                                                        className="cursor-pointer focus:outline-none"
                                                    >
                                                        <StarIcon
                                                            size={24}
                                                            className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}
                                                            style={star <= reviewRating ? { fill: 'currentColor' } : undefined}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <Textarea
                                                value={reviewMessage}
                                                onChange={(e) => setReviewMessage(e.target.value)}
                                                placeholder="Tulis ulasan (opsional)..."
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="w-fit"
                                                disabled={reviewRating < 1 || submittingReview}
                                                onClick={submitServiceReview}
                                            >
                                                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                                            </Button>
                                        </div>
                                    ) : reviewSubmitted ? (
                                        <div className="grid gap-2">
                                            <RatingStars rating={reviewRating} size={16} />
                                            <p className="text-muted-foreground text-sm">Ulasan terkirim dan menunggu moderasi admin.</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            Selesaikan pesanan untuk layanan ini agar bisa memberikan ulasan.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-1 text-sm font-semibold">Deskripsi</h2>
                                <div className="flex items-center space-x-2">
                                    <p
                                        className="text-muted-foreground text-sm"
                                        style={{
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </Deferred>
        </AppLayout>
    );
}
