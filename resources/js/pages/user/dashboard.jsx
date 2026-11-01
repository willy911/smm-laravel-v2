import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { serviceTypes } from '@/enums/service';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, formatDuration, getFile, toHTML } from '@/lib/utils';
import { Deferred, Link, usePage } from '@inertiajs/react';
import {
    Calendar03Icon,
    MoneyBag02Icon,
    NewsIcon,
    ShoppingBag01Icon,
    ShoppingBagAddIcon,
    StarIcon,
    TelegramIcon,
    ThumbsUpIcon,
    UserGroupIcon,
    Wallet01Icon,
    WalletAdd01Icon,
    WhatsappBusinessIcon,
} from 'hugeicons-react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'swiper/css/bundle';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const NewsItem = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="bg-primary/10 mb-4 w-full overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md"
        >
            <div className="p-0">
                <div className="border-l-4 p-4" style={{ borderLeftColor: `var(--${item.category.toLowerCase()}-color, var(--primary))` }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                <Badge className={`${item.categoryColor} px-2 py-1 text-xs font-medium`}>
                                    <span>{item.categoryIcon}</span> {item.category}
                                </Badge>
                                <div className="text-muted-foreground flex items-center text-xs">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {item.date}
                                </div>
                            </div>
                            <h3 className="mb-2 text-base leading-tight font-semibold">{item.title}</h3>
                            <p className="text-muted-foreground text-sm">{item.summary}</p>
                        </div>
                        <CollapsibleTrigger asChild>
                            <button className="bg-muted/50 hover:bg-muted ml-2 rounded-full p-2 transition-colors">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        </CollapsibleTrigger>
                    </div>
                </div>

                <CollapsibleContent>
                    <div
                        className="bg-muted/30 border-l-4 p-4"
                        style={{ borderLeftColor: `var(--${item.category.toLowerCase()}-color, var(--primary))` }}
                    >
                        <p className="text-sm leading-relaxed">{item.content}</p>
                        <div className="mt-3 flex justify-end">
                            <CollapsibleTrigger asChild>
                                <button className="text-primary flex items-center text-xs hover:underline">
                                    Tutup <ChevronUp className="ml-1 h-3 w-3" />
                                </button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
};

export default function Dashboard({ pageProps }) {
    const { websiteNews, auth, websiteConfigs, locales } = usePage().props;
    const { t, i18n } = useTranslation(['dashboard', 'services']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [isDialogOpened, setIsDialogOpened] = useState(false);

    return (
        <AppLayout
            pageTitle={t('common:labels.dashboard')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.dashboard'),
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="items-start justify-center gap-6 rounded-lg md:grid lg:grid-cols-2 xl:grid-cols-3">
                    <div className="top-4 col-span-3 mt-6 mb-6 grid items-start gap-6 md:mt-0 lg:mb-0 xl:sticky xl:col-span-1">
                        <Card>
                            <CardHeader className="from-primary to-foreground/40 bg-gradient-to-r py-0">
                                <CardTitle className="py-0">
                                    <div className="flex flex-row items-center">
                                        <div className="w-7/12">
                                            <div className="p-2 text-white">
                                                <div className="text-base text-white">{t('dashboard:welcome')}</div>
                                                <span className="block text-sm">{auth.user.full_name}</span>
                                            </div>
                                        </div>
                                        <div className="w-4/12 self-end sm:w-3/12 md:w-3/12 xl:w-5/12">
                                            <img src="/assets/images/dashboard-vector.png" alt="" className="w-full" />
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-3.5">
                                <div className="grid gap-4 pt-1">
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex items-center space-x-4">
                                            <span className="border-muted bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                                                <MoneyBag02Icon className="text-primary h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-muted-foreground text-sm leading-none">{t('common:labels.balance')}</p>
                                                <p className="text-sm font-medium">{formatCurrency(auth.user.balance)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex items-center space-x-4">
                                            <span className="border-muted bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                                                <ShoppingBag01Icon className="text-primary h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-muted-foreground text-sm leading-none">{t('common:labels.orders')}</p>
                                                <p className="text-sm font-medium">{formatCurrency(pageProps?.totalOrders)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex items-center space-x-4">
                                            <span className="border-muted bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                                                <Wallet01Icon className="text-primary h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-muted-foreground text-sm leading-none">{t('common:labels.deposits')}</p>
                                                <p className="text-sm font-medium">{formatCurrency(pageProps?.totalDeposits)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex items-center space-x-4">
                                            <span className="border-muted bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                                                <Wallet01Icon className="text-primary h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-muted-foreground text-sm leading-none">{t('common:labels.service-discount')}</p>
                                                <p className="text-sm font-medium">{formatAmount(auth.user.service_discount)} %</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center gap-3">
                                <Link href={route('user.deposits.create')} className={cn('w-full', buttonVariants({ variant: 'success' }))}>
                                    <WalletAdd01Icon className="h-4 w-4" />
                                    {t('common:actions.create-item', {
                                        item: t('common:labels.deposit'),
                                    })}
                                </Link>
                                <Link href={route('user.orders.create')} className={cn('w-full', buttonVariants({ variant: 'default' }))}>
                                    <ShoppingBagAddIcon className="h-4 w-4" />
                                    {t('common:actions.create-item', {
                                        item: t('common:labels.order'),
                                    })}
                                </Link>
                            </CardFooter>
                            {/* <CardFooter className="grid gap-4">
                                <div className="flex justify-center gap-3">
                                    <Link href={route('user.deposits.create')} className={cn('w-full', buttonVariants({ variant: 'success' }))}>
                                        <WalletAdd01Icon className="h-4 w-4" />
                                        {t('common:actions.create-item', {
                                            item: t('common:labels.deposit'),
                                        })}
                                    </Link>
                                    <Link href={route('user.orders.create')} className={cn('w-full', buttonVariants({ variant: 'default' }))}>
                                        <ShoppingBagAddIcon className="h-4 w-4" />
                                        {t('common:actions.create-item', {
                                            item: t('common:labels.order'),
                                        })}
                                    </Link>
                                </div>
                                <div className="flex justify-center gap-3">
                                    <Link href={route('user.deposits.create')} className={cn('w-full', buttonVariants({ variant: 'success' }))}>
                                        <WalletAdd01Icon className="h-4 w-4" />
                                        Riwayat Deposit
                                    </Link>
                                    <Link href={route('user.orders.create')} className={cn('w-full', buttonVariants({ variant: 'default' }))}>
                                        <ShoppingBagAddIcon className="h-4 w-4" />
                                        Riwayat Pesanan
                                    </Link>
                                </div>
                            </CardFooter> */}
                        </Card>
                        {config('social').whatsapp_channel || config('social').telegram_channel ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserGroupIcon className="h-4 w-4" /> {t('dashboard:community.title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4 text-sm">{t('dashboard:community.description')}</p>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {config('social').whatsapp_channel && (
                                            <a
                                                href={config('social').whatsapp_channel}
                                                target="_blank"
                                                className={cn('w-full', buttonVariants({ variant: 'success' }))}
                                            >
                                                <WhatsappBusinessIcon className="h-6 w-6" />
                                                {t('common:labels.whatsapp')}
                                            </a>
                                        )}
                                        {config('social').telegram_channel && (
                                            <a
                                                href={config('social').telegram_channel}
                                                target="_blank"
                                                className={cn(
                                                    'text-primary-foreground w-full bg-gradient-to-b from-[#0088cc] to-[#01699c] shadow-md hover:from-[#0088cc] hover:to-[#013c59] dark:bg-gradient-to-b dark:from-[#0088cc] dark:to-[#015178] dark:hover:from-[#0088cc] dark:hover:to-[#013c59]',
                                                    buttonVariants({ variant: 'none' }),
                                                )}
                                            >
                                                <TelegramIcon className="h-6 w-6" />
                                                {t('common:labels.telegram')}
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            ''
                        )}
                    </div>
                    <div className="col-span-3 grid items-start gap-[18px] pb-48 sm:pb-0 lg:col-span-3 xl:col-span-2">
                        {config('banner') && config('banner').length > 0 && (
                            <Swiper
                                effect={'coverflow'}
                                grabCursor={true}
                                centeredSlides={true}
                                slidesPerView={'auto'}
                                loop={config('banner').length <= 2 ? false : true}
                                autoplay={{
                                    delay: 2500,
                                    disableOnInteraction: false,
                                }}
                                coverflowEffect={{
                                    rotate: 50,
                                    stretch: 0,
                                    depth: 100,
                                    modifier: 1,
                                    slideShadows: false,
                                }}
                                pagination={{
                                    clickable: true,
                                }}
                                modules={[EffectCoverflow, Autoplay, Pagination]}
                                className="mySwiper"
                            >
                                {config('banner').map((rawBanner, index) => {
                                    const banner = typeof rawBanner === 'string' ? { file: rawBanner, link: '' } : rawBanner;
                                    if (!banner?.file) return null;
                                    return (
                                        <SwiperSlide key={index}>
                                            {banner.link ? (
                                                <a
                                                    href={banner.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                                                >
                                                    <img
                                                        src={getFile('website-banner', banner.file)}
                                                        fetchPriority="high"
                                                        className="h-full w-full rounded-xl object-cover"
                                                        alt={`Banner ${index + 1}`}
                                                    />
                                                </a>
                                            ) : (
                                                <img
                                                    src={getFile('website-banner', banner.file)}
                                                    fetchPriority="high"
                                                    className="h-full w-full rounded-xl object-cover"
                                                    alt={`Banner ${index + 1}`}
                                                />
                                            )}
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        )}
                        <div className="relative overflow-hidden">
                            <div className="animate-marquee flex gap-4 whitespace-nowrap">
                                {pageProps?.lastOrders?.map((order, index) => (
                                    <Alert key={`duplicate-${index}`} className="border-primary/20 bg-primary/5 min-w-fit shrink-0 shadow-sm">
                                        <AlertDescription className="flex items-center gap-2">
                                            <span className="bg-primary size-2 animate-pulse rounded-full" />
                                            <span>
                                                <span className="text-primary font-semibold">{order.user}</span> baru saja memesan{' '}
                                                <span className="text-primary font-semibold">{order.service}</span>
                                            </span>
                                        </AlertDescription>
                                    </Alert>
                                ))}

                                {/* Duplicate agar marquee terlihat seamless */}
                                {pageProps?.lastOrders?.map((order, index) => (
                                    <Alert key={`duplicate-${index}`} className="border-primary/20 bg-primary/5 min-w-fit shrink-0 shadow-sm">
                                        <AlertDescription className="flex items-center gap-2">
                                            <span className="bg-primary size-2 animate-pulse rounded-full" />
                                            <span>
                                                <span className="text-primary font-semibold">{order.user}</span> baru saja memesan{' '}
                                                <span className="text-primary font-semibold">{order.service}</span>
                                            </span>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </div>
                        {(pageProps?.serviceRecommendations?.length > 0 || pageProps?.serviceBestSellings.length > 0) && (
                            <Card>
                                <CardContent className="p-0">
                                    <Accordion
                                        type="single"
                                        defaultValue={
                                            pageProps?.serviceRecommendations?.length > 0 ? 'service-recommendations' : 'service-best-sellings'
                                        }
                                        collapsible
                                    >
                                        {pageProps?.serviceRecommendations?.length > 0 && (
                                            <AccordionItem value="service-recommendations">
                                                <AccordionTrigger className="px-4 py-4">
                                                    <div className="flex items-center">
                                                        <ThumbsUpIcon className="mr-2 h-4 w-4" />
                                                        {t('common:labels.recommended-services')}
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="max-h-[300px] overflow-y-auto xl:max-h-[380px]">
                                                    <div className="grid gap-4 border-t px-4 pt-4">
                                                        {pageProps?.serviceRecommendations?.map((service, index) => (
                                                            <Link
                                                                key={index}
                                                                href={route('user.orders.create', {
                                                                    target: service.id,
                                                                })}
                                                                className={cn(
                                                                    'hover:bg-primary/10 text-input-foreground hover:ring-primary hover:ring-offset-background relative flex min-h-[85px] w-full cursor-pointer gap-4 rounded-lg border text-start shadow-sm duration-300 outline-none hover:ring-2 hover:ring-offset-2',
                                                                )}
                                                            >
                                                                <span className="relative w-full">
                                                                    <span className="divide-muted-foreground/10 flex h-full flex-col justify-between divide-y">
                                                                        <div className="flex flex-col justify-start gap-1 p-3">
                                                                            <span className="block text-[13px] font-semibold">
                                                                                #{service.id} - {service.name}
                                                                            </span>
                                                                            <div className="flex w-full items-center gap-2 md:gap-3">
                                                                                <div>
                                                                                    <span className="text-primary flex items-center text-[12px] font-semibold md:text-[14px]">
                                                                                        {formatCurrency(service.price)}
                                                                                    </span>
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
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}
                                        {pageProps?.serviceBestSellings.length > 0 && (
                                            <AccordionItem value="service-best-sellings">
                                                <AccordionTrigger className="px-4 py-4">
                                                    <div className="flex items-center">
                                                        <StarIcon className="mr-2 h-4 w-4" />
                                                        {t('common:labels.best-seller-services')}
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="max-h-[300px] overflow-y-auto xl:max-h-[380px]">
                                                    <div className="grid gap-4 border-t px-4 pt-4">
                                                        {pageProps?.serviceBestSellings.map((service, index) => (
                                                            <Link
                                                                key={index}
                                                                href={route('user.orders.create', {
                                                                    target: service.id,
                                                                })}
                                                                className={cn(
                                                                    'hover:bg-primary/10 text-input-foreground hover:ring-primary hover:ring-offset-background relative flex min-h-[85px] w-full cursor-pointer gap-4 rounded-lg border text-start shadow-sm duration-300 outline-none hover:ring-2 hover:ring-offset-2',
                                                                )}
                                                            >
                                                                <span className="relative w-full">
                                                                    <span className="divide-muted-foreground/10 flex h-full flex-col justify-between divide-y">
                                                                        <div className="flex flex-col justify-start gap-1 p-3">
                                                                            <span className="block text-[13px] font-semibold">
                                                                                #{service.id} - {service.name}
                                                                            </span>
                                                                            <div className="flex w-full items-center gap-2 md:gap-3">
                                                                                <div>
                                                                                    <span className="text-primary flex items-center text-[12px] font-semibold md:text-[14px]">
                                                                                        {formatCurrency(service.price)}
                                                                                    </span>
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
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )}
                        {websiteNews.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <div className="flex items-center gap-2">
                                            <NewsIcon className="h-4 w-4" /> {t('dashboard:latest-5-news')}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* <div className="space-y-1">
                                {newsItems.map((item) => (
                                    <NewsItem key={item.id} item={item} />
                                ))}
                            </div> */}
                                    {websiteNews.map((news, index) => {
                                        return (
                                            <div className="bg-primary/10 mb-4 rounded-xl border p-4 text-wrap shadow-sm last:mb-0" key={index}>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button className="h-7 rounded-md text-xs">
                                                        {/* <Calendar03Icon /> {formatDate('2025-14-04', 'DD MMMM YYYY - HH:mm')} */}
                                                        <Calendar03Icon /> {formatDate({ date: news.created_at })}
                                                    </Button>
                                                    <Button className="h-7 rounded-md text-xs">
                                                        <NewsIcon /> {news.title}
                                                    </Button>
                                                </div>
                                                <div className="prose prose-sm pt-2 text-sm text-wrap">{toHTML(news.content)}</div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </Deferred>
        </AppLayout>
    );
}
