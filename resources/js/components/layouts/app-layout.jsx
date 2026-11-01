import { AppSidebar } from '@/components/layouts/app-sidebar';
import AppearanceToggleDropdown from '@/components/layouts/appearance-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { toast } from '@/hooks/use-toast';
import { config, createCurrencyFormatter, formatDate, getFile, toHTML } from '@/lib/utils';
import { Dialog as HeadlessDialog, DialogPanel as HeadlessDialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { router, usePage } from '@inertiajs/react';
import {
    Calendar03Icon,
    CustomerService02Icon,
    DatabaseIcon,
    LicenseIcon,
    Logout02Icon,
    NewsIcon,
    UserSettings01Icon,
    WalletDone01Icon,
} from 'hugeicons-react';
import { XIcon } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'swiper/css/bundle';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Badge } from '../ui/badge';
import { Toaster } from '../ui/toaster';
import { AppBreadcrumbs } from './app-breadcrumbs';
import AppHeader from './app-header';
import ContactDialog from './contact-dialog';
import LanguageToggleDropdown from './language-dropdown';

export default function AppLayout({
    pageTitle = 'Dasbor',
    breadcrumbs = [
        {
            title: config().name,
            href: '/',
        },
        {
            title: 'Dasbor',
            href: '/',
        },
    ],
    children,
}) {
    const { auth, locales, responseTime, responseError, responseSuccess, configs, websiteNews } = usePage().props;
    const { t, i18n } = useTranslation('account');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const canvasRef = useRef(null);
    const { appearance } = useAppearance();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showWebsiteNewsDialog, setShowWebsiteNewsDialog] = useState(false);
    const [showContactDialog, setShowContactDialog] = useState(false);
    const filteredWebsiteNews = websiteNews.filter((item) => {
        const isAllowedRoute =
            !item.only_visible_on ||
            item.only_visible_on
                .split(',')
                .map((r) => r.trim())
                .includes(route().current());

        if (!isAllowedRoute) return false;

        return auth.user ? item.is_popup : item.is_popup && item.is_public;
    });
    const hasScopedNews = filteredWebsiteNews.some((item) => {
        if (!item.only_visible_on) return false;
        return item.only_visible_on
            .split(',')
            .map((r) => r.trim())
            .includes(route().current());
    });
    const latestNewsUpdateKey =
        filteredWebsiteNews.length > 0
            ? new Date(
                  filteredWebsiteNews
                      .map((n) => n.created_at)
                      .sort()
                      .reverse()[0],
              ).getTime()
            : '';

    const localStorageKey = hasScopedNews
        ? `showPopupWebsiteNews_${route().current().replace(/\./g, '_')}_${latestNewsUpdateKey}`
        : `showPopupWebsiteNews_${latestNewsUpdateKey}`;

    useEffect(() => {
        if (responseError)
            toast({
                variant: 'error',
                description: toHTML(responseError),
            });
        if (responseSuccess)
            toast({
                variant: 'success',
                description: toHTML(responseSuccess),
            });
    }, [responseTime]);

    useEffect(() => {
        const root = document.documentElement;

        const applyCssVariables = () => {
            const isDark = root.classList.contains('dark');
            const currentTheme = isDark ? configs.theme.dark : configs.theme.light;

            if (currentTheme) {
                for (const [key, value] of Object.entries(currentTheme)) {
                    root.style.setProperty(`--${key}`, value);
                }
            }
        };

        applyCssVariables();

        const observer = new MutationObserver(applyCssVariables);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const lastClosed = localStorage.getItem(localStorageKey);
        const now = new Date().getTime();

        if (!route().current('admin.*') && (!lastClosed || now - lastClosed > 3 * 60 * 60 * 1000)) {
            setShowWebsiteNewsDialog(filteredWebsiteNews.length > 0);
        }
    }, [filteredWebsiteNews.length, localStorageKey]);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;

    //     const images = [];
    //     const imageSources = [
    //         '/assets/images/heart.png',
    //         '/assets/images/thumb.png',
    //         // '/assets/images/avatar.avif',
    //         // "assets/images/thumbs3.png",
    //         // "assets/images/thumbs4.png",
    //     ];

    //     const numFlakes = 50;
    //     const flakes = [];

    //     class Flake {
    //         constructor(x, y, speed, size, image) {
    //             this.x = x;
    //             this.y = y;
    //             this.speed = speed;
    //             this.size = size;
    //             this.image = image;
    //         }

    //         update() {
    //             this.y += this.speed * 0.5;
    //             if (this.y > canvas.height) {
    //                 this.y = -this.size;
    //                 this.x = Math.random() * canvas.width;
    //             }
    //         }

    //         draw() {
    //             ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    //         }
    //     }

    //     let loadedImages = 0;

    //     imageSources.forEach((src) => {
    //         const img = new Image();
    //         img.src = src;
    //         img.onload = () => {
    //             images.push(img);
    //             loadedImages++;
    //             if (loadedImages === imageSources.length) {
    //                 initFlakes();
    //                 animate();
    //             }
    //         };
    //     });

    //     const initFlakes = () => {
    //         for (let i = 0; i < numFlakes; i++) {
    //             const randomImage = images[Math.floor(Math.random() * images.length)];
    //             flakes.push(new Flake(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 30, randomImage));
    //         }
    //     };

    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);

    //         flakes.forEach((flake) => {
    //             flake.update();
    //             flake.draw();
    //         });

    //         requestAnimationFrame(animate);
    //     };

    //     window.addEventListener('resize', () => {
    //         canvas.width = window.innerWidth;
    //         canvas.height = window.innerHeight;
    //     });

    //     return () => {
    //         window.removeEventListener('resize', () => {
    //             canvas.width = window.innerWidth;
    //             canvas.height = window.innerHeight;
    //         });
    //     };
    // }, []);
    return (
        <>
            <Toaster />
            <AppHeader pageTitle={pageTitle} />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2">
                        {/* <div className="flex items-center gap-2 px-4"> */}
                        <div className="flex w-full items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <AppBreadcrumbs breadcrumbs={breadcrumbs} />
                            <div className="ml-auto flex-1 sm:flex-initial"></div>
                            {route().current('admin.*') && auth.admin && (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Avatar className="h-8 w-8 cursor-pointer rounded-lg">
                                                <AvatarImage src={'/assets/images/avatar.avif'} alt={auth.admin.full_name} />
                                                <AvatarFallback className="rounded-xl border">
                                                    {auth.admin.full_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel className="p-0 font-normal">
                                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                    <Avatar className="h-8 w-8 rounded-lg">
                                                        <AvatarImage src="/assets/images/avatar.avif" alt={auth.admin.full_name} />
                                                        <AvatarFallback className="rounded-xl border">
                                                            {auth.admin.full_name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                                        <span className="truncate font-semibold">{auth.admin.full_name}</span>
                                                        <span className="text-muted-foreground truncate text-xs">{auth.admin.group.name}</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="flex cursor-pointer items-center gap-2"
                                                onClick={() => router.visit(route('admin.auth.signout'))}
                                            >
                                                <Logout02Icon />
                                                {t('common:labels.signout')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                            {!route().current('admin.*') && auth.user && (
                                <>
                                    <div className="mr-2 grid flex-1 text-right text-sm leading-tight">
                                        <span className="text-muted-foreground truncate text-xs">{t('common:labels.balance')}</span>
                                        <span className="truncate font-semibold">{formatCurrency(auth.user.balance)}</span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Avatar className="h-8 w-8 cursor-pointer rounded-lg">
                                                <AvatarImage src={'/assets/images/avatar.avif'} alt={auth.user.full_name} />
                                                <AvatarFallback className="rounded-xl border">
                                                    {auth.user.full_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel className="p-0 font-normal">
                                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                    <Avatar className="h-8 w-8 rounded-lg">
                                                        <AvatarImage src="/assets/images/avatar.avif" alt={auth.user.full_name} />
                                                        <AvatarFallback className="rounded-xl border">
                                                            {auth.user.full_name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                                        <span className="truncate font-semibold">{auth.user.full_name}</span>
                                                        <span className="text-muted-foreground truncate text-xs">{auth.user.group.name}</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem
                                                    className="flex cursor-pointer items-center gap-2"
                                                    onClick={() => router.visit(route('user.account.settings'))}
                                                >
                                                    <UserSettings01Icon />
                                                    {t('common:labels.settings')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex cursor-pointer items-center gap-2"
                                                    onClick={() => router.visit(route('user.account.logs.balance'))}
                                                >
                                                    <WalletDone01Icon />
                                                    {t('common:labels.balance-logs')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex cursor-pointer items-center gap-2"
                                                    onClick={() => router.visit(route('user.account.logs.signin'))}
                                                >
                                                    <DatabaseIcon />
                                                    {t('common:labels.signin-logs')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex cursor-pointer items-center gap-2"
                                                    onClick={() => router.visit(route('user.account.logs.activity'))}
                                                >
                                                    <LicenseIcon />
                                                    {t('common:labels.activity-logs')}
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="flex cursor-pointer items-center gap-2"
                                                onClick={() => router.visit(route('user.auth.signout'))}
                                            >
                                                <Logout02Icon />
                                                {t('common:labels.signout')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                            <AppearanceToggleDropdown />
                            <LanguageToggleDropdown />
                        </div>
                    </header>
                    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {/* <canvas
                            ref={canvasRef}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                            }}
                        ></canvas> */}
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
            {/* <AppearanceToggleDropdown
                className={cn(
                    route().current('admin.websites.configs.*') ? 'bottom-[54px]' : 'bottom-17',
                    'fixed right-6 z-40 flex items-center gap-1 rounded-lg border shadow-sm',
                )}
            /> */}
            {!route().current('admin.*') && (
                <ContactDialog showContactDialog={showContactDialog} setShowContactDialog={setShowContactDialog}>
                    <Button
                        className="fixed right-6 bottom-6 z-40 flex items-center gap-1 rounded-lg border shadow-sm"
                        onClick={() => setShowContactDialog(true)}
                    >
                        <CustomerService02Icon />
                    </Button>
                </ContactDialog>
            )}

            <Transition appear show={showWebsiteNewsDialog} as={Fragment}>
                <HeadlessDialog as="div" className="relative z-50" onClose={() => setShowWebsiteNewsDialog(false)}>
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
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
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
                                                setShowWebsiteNewsDialog(false);
                                            }}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="w-full">
                                        <Swiper
                                            effect={'coverflow'}
                                            initialSlide="2"
                                            grabCursor={true}
                                            centeredSlides={true}
                                            slidesPerView={'auto'}
                                            loop={filteredWebsiteNews.length <= 2 ? false : true}
                                            autoplay={{
                                                delay: 2500,
                                                disableOnInteraction: true,
                                            }}
                                            onSlideChange={(swiper) => {
                                                setActiveIndex(swiper.realIndex);
                                            }}
                                            coverflowEffect={{
                                                rotate: 50,
                                                stretch: 0,
                                                depth: 100,
                                                modifier: 1,
                                                slideShadows: false,
                                            }}
                                            modules={[EffectCoverflow, Autoplay]}
                                            autoHeight={true}
                                            className="mySwiper"
                                        >
                                            {filteredWebsiteNews.map((news, index) => {
                                                return (
                                                    <SwiperSlide key={index}>
                                                        {news.banner || config().default_news_banner ? (
                                                            <>
                                                                <div>
                                                                    <img
                                                                        fetchPriority="high"
                                                                        width={0}
                                                                        height={0}
                                                                        decoding="async"
                                                                        className="object-center"
                                                                        sizes="100vw"
                                                                        src={getFile('website-news', news.banner || config().default_news_banner)}
                                                                        style={{
                                                                            color: 'transparent',
                                                                            width: '100%',
                                                                            height: 'auto',
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="p-4 pb-0">
                                                                    <div
                                                                        className="bg-primary/10 mb-4 rounded-xl border p-4 text-wrap shadow-sm last:mb-0"
                                                                        key={index}
                                                                    >
                                                                        <div className="flex flex-wrap gap-2">
                                                                            <Button className="h-7 rounded-md text-xs">
                                                                                {/* <Calendar03Icon /> {formatDate('2025-14-04', 'DD MMMM YYYY - HH:mm')} */}
                                                                                <Calendar03Icon /> {formatDate({ date: news.created_at })}
                                                                            </Button>
                                                                            <Button className="h-7 rounded-md text-xs">
                                                                                <NewsIcon /> {news.title}
                                                                            </Button>
                                                                        </div>
                                                                        <div className="prose prose-sm pt-2 text-sm text-wrap">
                                                                            {toHTML(news.content)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="p-4 pb-0">
                                                                <div
                                                                    className="bg-primary/10 mb-4 rounded-xl border p-4 text-wrap shadow-sm last:mb-0"
                                                                    key={index}
                                                                >
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Button className="h-7 rounded-md text-xs">
                                                                            {/* <Calendar03Icon /> {formatDate('2025-14-04', 'DD MMMM YYYY - HH:mm')} */}
                                                                            <Calendar03Icon /> {formatDate({ date: news.created_at })}
                                                                        </Button>
                                                                        <Button className="h-7 rounded-md text-xs">
                                                                            <NewsIcon /> {news.title}
                                                                        </Button>
                                                                    </div>
                                                                    <div className="prose prose-sm pt-2 text-sm text-wrap">
                                                                        {toHTML(news.content)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </SwiperSlide>
                                                );
                                            })}
                                        </Swiper>
                                        <div className="dark:from-muted dark:to-muted/50 mt-4 flex w-full items-center justify-between gap-2 rounded-b-xl bg-gradient-to-b from-gray-200 to-gray-200/40 p-2 px-4">
                                            <div className="flex items-center gap-2">
                                                <Badge>
                                                    {activeIndex + 1} / {filteredWebsiteNews.length}
                                                </Badge>
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setShowWebsiteNewsDialog(false);
                                                    localStorage.setItem(localStorageKey, new Date().getTime());
                                                }}
                                            >
                                                {t('common:actions.dont-show-again')}
                                            </Button>
                                        </div>
                                    </div>
                                </HeadlessDialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </HeadlessDialog>
            </Transition>
        </>
    );
}
