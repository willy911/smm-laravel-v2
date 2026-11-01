import AppHeader from '@/components/layouts/app-header';
import AppearanceToggleDropdown from '@/components/layouts/appearance-dropdown';
import LanguageToggleDropdown from '@/components/layouts/language-dropdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { serviceTypes } from '@/enums/service';
import { cn, config, createCurrencyFormatter, formatAmount, formatDuration, getFile, toHTML } from '@/lib/utils';
import { Deferred, Link, usePage } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import {
    Agreement02Icon,
    Briefcase01Icon,
    CustomerService02Icon,
    FavouriteIcon,
    GlobalIcon,
    SaleTag02Icon,
    ShoppingBag01Icon,
    StarIcon,
    Tag01Icon,
    ThumbsUpIcon,
    UserGroupIcon,
    UserLove01Icon,
    WebDesign01Icon,
} from 'hugeicons-react';
import { UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { useTranslation } from 'react-i18next';

const socialIcons = [
    { src: '/assets/images/icons/twitter.svg', alt: 'Twitter' },
    { src: '/assets/images/icons/instagram.svg', alt: 'Instagram' },
    { src: '/assets/images/icons/youtube.svg', alt: 'Youtube' },
    { src: '/assets/images/icons/facebook.svg', alt: 'Facebook' },
    { src: '/assets/images/icons/tiktok.svg', alt: 'TikTok' },
    { src: '/assets/images/icons/whatsapp.svg', alt: 'Whatsapp' },
    { src: '/assets/images/icons/discord.svg', alt: 'Discord' },
    { src: '/assets/images/icons/google.svg', alt: 'Google' },
    { src: '/assets/images/icons/spotify.svg', alt: 'Spotify' },
    { src: '/assets/images/icons/linkedin.svg', alt: 'Linkedin' },
    { src: '/assets/images/icons/twitch.svg', alt: 'Twitch' },
];

const Navigation = ({ t, pageProps }) => {
    return (
        <nav className="bg-muted sticky top-0 z-40 w-full flex-none border-b">
            <div className="container mx-auto max-w-[1200px]">
                <div className="flex h-[60px] items-center justify-between">
                    {!config().logo_lg_light || !config().logo_lg_dark ? (
                        <Link className="flex h-9 shrink-0 items-center justify-center" href="/">
                            <GlobalIcon className="mr-2 h-6 w-6" />
                            <span className="font-semibold">{config().name}</span>
                        </Link>
                    ) : (
                        <Link className="flex h-9 shrink-0 items-center justify-center px-4 xl:px-0" href="/">
                            <img
                                className="object-fit block aspect-square w-[140px] rounded-lg object-contain dark:hidden"
                                src={getFile('website', config().logo_lg_light)}
                                alt={config().name}
                            />
                            <img
                                className="object-fit hidden aspect-square w-[140px] rounded-lg object-contain dark:block"
                                src={getFile('website', config().logo_lg_dark)}
                                alt={config().name}
                            />
                        </Link>
                    )}
                    <div className="">
                        <div className="hidden lg:ml-10 lg:block lg:self-stretch">
                            <div className="flex h-full space-x-6">
                                <a
                                    href="#home"
                                    className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                >
                                    {t('landing:nav.home')}
                                </a>
                                {pageProps?.serviceBestSellings?.length > 0 ||
                                    (pageProps?.serviceRecommendations?.length > 0 && (
                                        <a
                                            href="#featured-services"
                                            className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                        >
                                            {t('landing:nav.featured-services')}
                                        </a>
                                    ))}
                                <Link
                                    href={route('guest.services.index')}
                                    className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                >
                                    {t('landing:nav.services')}
                                </Link>
                                <a
                                    href="#faqs"
                                    className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                >
                                    {t('landing:nav.faqs')}
                                </a>
                                <Link
                                    href="/blogs"
                                    className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                >
                                    {t('common:labels.blog')}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="ml-auto flex w-full items-center gap-4 px-4 py-4 sm:px-6 md:gap-2 lg:w-auto lg:gap-3">
                            <AuthButtons t={t} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const HeroSection = ({ summary, t, formatAmount, config }) => {
    const renderSummary = [
        { icon: <UserGroupIcon className="size-4" />, label: t('common:labels.users'), value: formatAmount(summary?.users) ?? 0 },
        { icon: <ShoppingBag01Icon className="size-4" />, label: t('common:labels.orders'), value: formatAmount(summary?.orders) ?? 0 },
        { icon: <Tag01Icon className="size-4" />, label: t('common:labels.services'), value: formatAmount(summary?.services) ?? 0 },
        { icon: <CustomerService02Icon className="size-4" />, label: t('common:labels.support'), value: '24/7' },
    ];

    return (
        <section id="home" className="bg-accent relative overflow-hidden pt-15 pb-5">
            <div className="absolute top-0 left-0 h-32 w-32 -translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br from-red-200 to-yellow-100"></div>
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br from-green-200 to-blue-100"></div>
            <div className="to-primary/20 from-muted absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-gradient-to-tr blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center px-4 text-center sm:px-6 md:px-8">
                <h1 className="text-primary text-3xl font-bold sm:text-4xl">
                    {config().name} - {config().sub_name}
                </h1>
                <p className="text-muted-foreground mt-4 max-w-2xl">{toHTML(t('landing:hero.description').replace('Wuzz Panel', config().name))}</p>

                {config('menu').guest.dashboard.summary.enabled === '1' && (
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 pt-8 sm:gap-0">
                        {renderSummary.map((item, index) => (
                            <div
                                key={index}
                                className="border-muted-foreground/20 flex min-w-[140px] flex-1 flex-col items-center justify-center text-center first:border-none sm:w-40 sm:border-l-2"
                            >
                                <div className="text-primary text-lg font-bold sm:text-2xl">
                                    {item.value}
                                    {index !== 3 && '+'}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                                    {item.icon} {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 py-8">
                    <AuthButtons t={t} />
                </div>

                <SocialMarquee />

                <img
                    src="/assets/images/heart.png"
                    alt="Heart"
                    className="absolute top-5 left-[0rem] hidden h-[10rem] w-[10rem] animate-bounce duration-2000 lg:block xl:left-[13rem]"
                />
                <img
                    src="/assets/images/thumb.png"
                    alt="Thumb"
                    className="absolute top-5 right-[0rem] hidden h-[10rem] w-[10rem] animate-bounce duration-2000 lg:block xl:right-[13rem]"
                />

                <AnimatedDots />
            </div>
        </section>
    );
};

const SocialMarquee = () => {
    return (
        <Marquee autoFill={true} pauseOnHover={true} speed={50} gradient={false}>
            <div className="flex items-center justify-center gap-4">
                {socialIcons.map((icon, index) => (
                    <motion.div
                        key={index}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: (i) => ({
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: i * 0.1,
                                    duration: 0.1,
                                },
                            }),
                        }}
                    >
                        <span className="mx-6 inline-block">
                            <img src={icon.src} alt={icon.alt} className="h-full w-24 grayscale transition duration-300 hover:grayscale-0" />
                        </span>
                    </motion.div>
                ))}
            </div>
        </Marquee>
    );
};

const AnimatedDots = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-[-1]">
            <div className="absolute top-10 left-20 h-4 w-4 animate-pulse rounded-full bg-red-400"></div>
            <div className="absolute top-20 right-20 h-4 w-4 animate-pulse rounded-full bg-yellow-400"></div>
            <div className="absolute top-28 left-40 h-4 w-4 animate-pulse rounded-full bg-blue-400"></div>
            <div className="absolute right-40 bottom-22 h-4 w-4 animate-pulse rounded-full bg-green-400"></div>
            <div className="absolute bottom-20 left-16 h-4 w-4 animate-pulse rounded-full bg-purple-400"></div>
        </div>
    );
};

const OurServicesSection = ({ t }) => {
    return (
        <section id="services" className="from-muted to-primary/10 relative bg-gradient-to-b py-10" data-aos="fade-up">
            <div className="container mx-auto mb-20 max-w-[1200px] px-4 text-center">
                <h1 className="text-center text-2xl font-semibold sm:text-[33px]">
                    {t('landing:our-services.title', {
                        website_name: config().name,
                    })}
                </h1>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">{t('landing:our-services.subtitle')}</p>
                <OurServices t={t} />
            </div>
            <SectionDivider />
        </section>
    );
};

const FeaturedServicesSection = ({ t, pageProps, tabActive, setTabActive, formatCurrency }) => {
    return (
        <section id="featured-services" className="from-muted to-primary/10 relative scroll-mt-[60px] bg-gradient-to-b py-10" data-aos="fade-up">
            <div className="container mx-auto mb-20 max-w-[1200px] px-4 text-center">
                <h1 className="text-center text-2xl font-semibold sm:text-[33px]">{t('landing:featured-services.title')}</h1>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">{t('landing:featured-services.subtitle')}</p>

                <Deferred data="pageProps" fallback={<ServicesSkeleton />}>
                    <ServicesTabs pageProps={pageProps} tabActive={tabActive} setTabActive={setTabActive} t={t} />
                    <ServicesGrid pageProps={pageProps} tabActive={tabActive} formatCurrency={formatCurrency} t={t} />
                </Deferred>
            </div>
            <SectionDivider />
        </section>
    );
};

const ServicesSkeleton = () => {
    return (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
    );
};

const ServicesTabs = ({ pageProps, tabActive, setTabActive, t }) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 py-6">
            {pageProps?.serviceBestSellings?.length > 0 && (
                <Button
                    size="sm"
                    variant={tabActive === 'service-best-sellings' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                    onClick={() => setTabActive('service-best-sellings')}
                >
                    <StarIcon className="mb-px h-4 w-4" />
                    {t('common:labels.best-seller-services')}
                </Button>
            )}
            {pageProps?.serviceRecommendations?.length > 0 && (
                <Button
                    size="sm"
                    variant={tabActive === 'service-recommendations' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                    onClick={() => setTabActive('service-recommendations')}
                >
                    <ThumbsUpIcon className="mb-px h-4 w-4" />
                    {t('common:labels.recommended-services')}
                </Button>
            )}
        </div>
    );
};

const ServicesGrid = ({ pageProps, tabActive, formatCurrency, t }) => {
    const renderServiceCard = (service, index) => (
        <Link
            key={index}
            href={route('user.orders.create', { target: service.id })}
            className={cn(
                'hover:bg-primary/10 text-input-foreground hover:ring-primary hover:ring-offset-background bg-accent relative flex min-h-[85px] w-full cursor-pointer gap-4 rounded-lg border text-start shadow-sm duration-300 outline-none hover:ring-2 hover:ring-offset-2',
                pageProps.serviceBestSellings?.length === 10 && index === 9 ? 'lg:col-start-2' : '',
            )}
        >
            <span className="relative w-full">
                <span className="divide-muted-foreground/10 flex h-full flex-col justify-between divide-y">
                    <div className="flex flex-col justify-start gap-1 p-3">
                        <span className="block truncate text-[13px] font-semibold">
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
    );

    return (
        <>
            {tabActive === 'service-best-sellings' && pageProps?.serviceBestSellings?.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{pageProps.serviceBestSellings.map(renderServiceCard)}</div>
            )}
            {tabActive === 'service-recommendations' && pageProps?.serviceRecommendations?.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{pageProps.serviceRecommendations.map(renderServiceCard)}</div>
            )}
        </>
    );
};

const FAQsSection = ({ t }) => {
    return (
        <section
            id="faqs"
            className="from-muted to-primary/10 relative scroll-mt-[60px] bg-gradient-to-b py-10 pb-42 sm:py-10 sm:pb-72"
            data-aos="fade-up"
        >
            <div className="container mx-auto max-w-[1200px] px-4 text-center">
                <h1 className="text-center text-2xl font-semibold sm:text-[33px]">{t('landing:faqs.title')}</h1>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">{t('landing:faqs.subtitle')}</p>

                <div className="mx-auto max-w-[1200px] px-6 py-6 text-center">
                    <Accordion type="single" className="w-full" collapsible defaultValue="faq-1">
                        {t('landing:faqs.items', { returnObjects: true }).map((faq, index) => (
                            <AccordionItem key={faq.value} value={faq.value} className="mb-4 px-4">
                                <AccordionTrigger className="hover:no-underline [&_svg]:size-5">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <span className="mt-1 text-[17px] font-semibold hover:underline">
                                            {t(`landing:faqs.items.${index}.question`, {
                                                website_name: config().name,
                                            }).replace('Wuzz Panel', config().name)}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border-t pt-3 text-start">
                                    <div className="flex items-center gap-12">
                                        <span className="text-muted-foreground text-[26px] font-semibold"></span>
                                        <span className="text-sm sm:text-base">
                                            {toHTML(
                                                t(`landing:faqs.items.${index}.answer`, {
                                                    website_name: config().name,
                                                }).replace('Wuzz Panel', config().name),
                                            )}
                                        </span>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

const SectionDivider = () => {
    return (
        <div className="absolute right-0 bottom-0 left-0 -mb-px overflow-hidden">
            <svg
                className="text-muted h-auto w-full"
                viewBox="0 0 1440 100"
                preserveAspectRatio="none"
                fill="currentColor"
                style={{ transform: 'translateY(1px)' }}
            >
                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,100L1320,100C1200,100,960,100,720,100C480,100,240,100,120,100L0,100Z"></path>
            </svg>
        </div>
    );
};

export default function Dashboard({ pageProps }) {
    const { locales, summary, configs } = usePage().props;
    const { t, i18n } = useTranslation(['landing', 'services']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [tabActive, setTabActive] = useState('service-best-sellings');

    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease',
            once: true,
        });
    }, []);

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

    return (
        <>
            <AppHeader />
            <AppearanceToggleDropdown
                className={cn(
                    route().current('admin.websites.configs.*') ? 'bottom-[54px]' : 'bottom-15',
                    'fixed right-5 z-40 flex items-center gap-1 rounded-lg border shadow-sm',
                )}
            />
            <LanguageToggleDropdown className={cn('bottom-5', 'fixed right-5 z-40 flex items-center gap-1 rounded-lg border shadow-sm')} />
            <div>
                <div className="bg-muted/40 flex min-h-screen w-full flex-col">
                    <Navigation t={t} pageProps={pageProps} />
                    <HeroSection summary={summary} t={t} formatAmount={formatAmount} config={config} />
                    <OurServicesSection t={t} />
                    {pageProps?.serviceBestSellings?.length > 0 ||
                        (pageProps?.serviceRecommendations?.length > 0 && (
                            <FeaturedServicesSection
                                t={t}
                                pageProps={pageProps}
                                tabActive={tabActive}
                                setTabActive={setTabActive}
                                formatCurrency={formatCurrency}
                            />
                        ))}

                    <FAQsSection t={t} />
                    <Footer t={t} />
                </div>
                <Toaster position="top-right" richColors />
            </div>
        </>
    );
}

const SectionTitle = ({ title }) => (
    <div className="relative">
        <h3 className="text-text-color text-sm leading-6 font-bold">{title}</h3>
        <div className="bg-primary-400 h-1 w-1/4 rounded-full" />
    </div>
);

const Footer = ({ t }) => {
    const socials = [
        { name: t('common:contact-dialog.instagram.title'), url: (username) => `https://instagram.com/${username}`, key: 'instagram' },
        { name: t('common:contact-dialog.tiktok.title'), url: (username) => `https://tiktok.com/@${username}`, key: 'tiktok' },
        { name: t('common:contact-dialog.facebook.title'), url: (username) => `https://fb.me/${username}`, key: 'facebook' },
    ];

    const supports = [
        { name: t('common:contact-dialog.whatsapp.title'), url: (number) => `https://wa.me/${number}`, key: 'whatsapp' },
        { name: t('common:contact-dialog.telegram.title'), url: (username) => `https://t.me/${username}`, key: 'telegram' },
        { name: t('common:contact-dialog.email.title'), url: (email) => `mailto:${email}`, key: 'email' },
        { name: t('common:contact-dialog.google-maps.title'), url: (address) => address, key: 'google_maps' },
    ];

    const sitemaps = [{ name: t('common:labels.tos'), target: 'tos' }];

    return (
        <footer className="relative -mt-24 bg-transparent sm:-mt-72">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 300">
                <path
                    className="fill-primary text-primary"
                    d="M0,192L18.5,208C36.9,224,74,256,111,245.3C147.7,235,185,181,222,149.3C258.5,117,295,107,332,133.3C369.2,160,406,224,443,250.7C480,277,517,267,554,245.3C590.8,224,628,192,665,197.3C701.5,203,738,245,775,245.3C812.3,245,849,203,886,192C923.1,181,960,203,997,213.3C1033.8,224,1071,224,1108,218.7C1144.6,213,1182,203,1218,202.7C1255.4,203,1292,213,1329,224C1366.2,235,1403,245,1422,250.7L1440,256L1440,320L1421.5,320C1403.1,320,1366,320,1329,320C1292.3,320,1255,320,1218,320C1181.5,320,1145,320,1108,320C1070.8,320,1034,320,997,320C960,320,923,320,886,320C849.2,320,812,320,775,320C738.5,320,702,320,665,320C627.7,320,591,320,554,320C516.9,320,480,320,443,320C406.2,320,369,320,332,320C295.4,320,258,320,222,320C184.6,320,148,320,111,320C73.8,320,37,320,18,320L0,320Z"
                ></path>
            </svg>

            <div className="bg-primary text-primary-foreground">
                <div className="container mx-auto max-w-[1200px] px-4 pb-8 xl:px-0">
                    <div className="xl:grid xl:grid-cols-4 xl:gap-8">
                        <div className="space-y-8 pt-8 sm:pt-0 xl:col-span-2">
                            <div className="flex h-5 shrink-0">
                                {!config().logo_lg_dark ? (
                                    <Link className="flex h-9 shrink-0 items-center justify-center" href="/">
                                        <GlobalIcon className="mr-2 h-6 w-6" />
                                        <span className="font-semibold">{config().name}</span>
                                    </Link>
                                ) : (
                                    <Link className="flex h-9 shrink-0 items-center justify-center" href="/">
                                        <img
                                            className="object-fit aspect-square w-[140px] rounded-lg object-contain"
                                            src={getFile('website', config().logo_lg_dark)}
                                            alt={config().name}
                                        />
                                    </Link>
                                )}
                            </div>
                            <div className="text-text-color text-sm leading-6">
                                {toHTML(t('landing:hero.description').replace('Wuzz Panel', config().name))}
                            </div>
                        </div>

                        <div className="mt-16 grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0">
                            <div className="space-y-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
                                <div>
                                    <SectionTitle title={t('common:labels.social-media')} />
                                    <ul className="mt-6 space-y-4">
                                        {socials.map(({ name, url, key }) =>
                                            config('social')[key] ? (
                                                <li key={key}>
                                                    <a
                                                        href={url(config('social')[key])}
                                                        className="text-text-color hover:text-primary-200 flex space-x-3 text-sm leading-6"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span>{name}</span>
                                                    </a>
                                                </li>
                                            ) : null,
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <SectionTitle title={t('common:labels.support')} />
                                    <ul className="mt-6 space-y-4">
                                        {supports.map(({ name, url, key }) =>
                                            config('social')[key] ? (
                                                <li key={key}>
                                                    <a
                                                        href={url(config('social')[key])}
                                                        className="text-text-color hover:text-primary-200 flex space-x-3 text-sm leading-6"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span>{name}</span>
                                                    </a>
                                                </li>
                                            ) : null,
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <SectionTitle title={t('common:labels.sitemap')} />
                                    <ul className="mt-6 space-y-4">
                                        {sitemaps.map(({ name, target }) => (
                                            <li key={target}>
                                                <Link
                                                    href={route('guest.sitemaps.show', { target })}
                                                    className="text-text-color hover:text-primary-200 text-sm leading-6"
                                                >
                                                    {name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const AuthButtons = ({ t }) => {
    return (
        <>
            <Link
                href={route('user.auth.signin')}
                className={cn(
                    buttonVariants({
                        size: 'sm',
                        variant: 'success',
                    }),
                )}
            >
                <UserRoundCheck />
                {t('common:labels.signin')}
            </Link>
            <Link
                href={route('user.auth.signup')}
                className={cn(
                    buttonVariants({
                        size: 'sm',
                        variant: 'default',
                    }),
                )}
            >
                <UserRoundPlus />
                {t('common:labels.signup')}
            </Link>
        </>
    );
};

const OurServices = ({ t }) => {
    const ourServices = [
        {
            name: t('landing:our-services.items.quality-service.name'),
            icon: <FavouriteIcon size="32" className="text-primary" />,
            description: t('landing:our-services.items.quality-service.description'),
        },
        {
            name: t('landing:our-services.items.competitive-price.name'),
            icon: <SaleTag02Icon size="32" className="text-primary" />,
            description: t('landing:our-services.items.competitive-price.description'),
        },
        {
            name: t('landing:our-services.items.support.name'),
            icon: <UserLove01Icon size="32" className="text-primary" />,
            description: t('landing:our-services.items.support.description'),
        },
        {
            name: t('landing:our-services.items.ease-of-use.name'),
            icon: <WebDesign01Icon size="32" className="text-primary" />,
            description: t('landing:our-services.items.ease-of-use.description'),
        },
        {
            name: t('landing:our-services.items.business-partner.name'),
            icon: <Agreement02Icon size="32" className="text-primary" />,
            description: t('landing:our-services.items.business-partner.description'),
        },
        {
            name: t('landing:our-services.items.professional-quality.name'),
            icon: <Briefcase01Icon size="32" className="text-primary" />,
            description: t('landing:our-services.items.professional-quality.description'),
        },
    ];

    return (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ourServices.map((item, index) => (
                <div
                    key={index}
                    className="group border-muted bg-accent relative overflow-hidden rounded-3xl border p-6 shadow-lg transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl"
                >
                    <div className="from-primary/15 to-background absolute inset-0 z-[-1] bg-gradient-to-b opacity-0 transition duration-300 group-hover:opacity-100"></div>
                    <div className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-inner transition group-hover:scale-110">
                        {item.icon}
                    </div>
                    <h3 className="group-hover:text-primary text-accent-foreground text-xl font-semibold transition">{item.name}</h3>
                    <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{item.description}</p>
                </div>
            ))}
        </div>
    );
};
