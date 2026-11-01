import AppHeader from '@/components/layouts/app-header';
import AppearanceToggleDropdown from '@/components/layouts/appearance-dropdown';
import LanguageToggleDropdown from '@/components/layouts/language-dropdown';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { cleanHTML, cn, config, createCurrencyFormatter, formatDate, getFile, stringLimit, toHTML } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Facebook01Icon, GlobalIcon, WhatsappIcon } from 'hugeicons-react';
import { Store, UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Navigation = ({ t, pageProps }) => {
    const { auth } = usePage().props;
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
                                {auth.user ? (
                                    <Link
                                        href="/"
                                        className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                    >
                                        {t('landing:nav.home')}
                                    </Link>
                                ) : (
                                    <Link
                                        href="/#home"
                                        className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                    >
                                        {t('landing:nav.home')}
                                    </Link>
                                )}
                                <Link
                                    href={route('guest.services.index')}
                                    className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                >
                                    {t('landing:nav.services')}
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href="sitemaps/faq"
                                        className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                    >
                                        {t('landing:nav.faqs')}
                                    </Link>
                                ) : (
                                    <Link
                                        href="/#faqs"
                                        className="text-secondary-foreground hover:text-primary border-transparent text-sm font-medium transition-colors duration-200 ease-out"
                                    >
                                        {t('landing:nav.faqs')}
                                    </Link>
                                )}
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

export default function Detail({ pageProps }) {
    const { locales, summary, configs } = usePage().props;
    const { t, i18n } = useTranslation(['landing', 'blogs']);
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

    const [search, setSearch] = useState(pageProps.filters?.search || '');
    const [category, setCategory] = useState(pageProps.filters?.category || '');

    const submitSearch = (e) => {
        e?.preventDefault();

        router.get(
            route('guest.blogs.index'),
            {
                search,
                category,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const goToPage = (page) => {
        router.get(
            route('guest.blogs.index'),
            {
                page,
                category,
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const shareToFacebook = (url) => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
    };

    const shareToWhatsApp = (url) => {
        window.open(`https://api.whatsapp.com/send?text=${url}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <AppHeader pageTitle={pageProps?.target.title} />
            <Head>
                <meta name="description" content={stringLimit(cleanHTML(pageProps?.target.content), 0, 180)} />
            </Head>
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
                    <div className="container mx-auto my-8 max-w-[1200px] space-y-6">
                        <Breadcrumb className="mx-4">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink className="text-primary" asChild>
                                        <Link href={route('guest.blogs.index')}>{t('common:labels.blog')}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink className="text-primary" asChild>
                                        <Link
                                            href={route('guest.blogs.index', {
                                                category: pageProps?.target.category_slug,
                                            })}
                                        >
                                            {pageProps?.target.category}
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-muted-foreground max-w-xs truncate">{pageProps?.target.title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="mx-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                            <div className="space-y-6">
                                <div className="order-last w-full space-y-6 sm:w-full md:w-full xl:order-none xl:w-[100%]">
                                    <div className="prose prose-sm">
                                        <h1 className="text-foreground">{pageProps.target.title}</h1>
                                    </div>
                                    <div className="flex h-[350px] w-full items-center justify-center overflow-hidden rounded-lg bg-black">
                                        <img
                                            src={getFile('website-blogs', pageProps.target.banner)}
                                            alt={pageProps.target.title}
                                            className="h-full w-full object-contain sm:object-cover"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => shareToFacebook(route('guest.blogs.show', { target: pageProps.target.slug }))}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Facebook01Icon size={20} />
                                        </button>
                                        <button
                                            onClick={() => shareToWhatsApp(route('guest.blogs.show', { target: pageProps.target.slug }))}
                                            className="text-green-500 hover:text-green-700"
                                        >
                                            <WhatsappIcon size={20} />
                                        </button>
                                    </div>
                                    <div className="prose">
                                        <div>{toHTML(pageProps.target.content)}</div>
                                    </div>
                                </div>
                            </div>

                            <aside className="sticky top-20 space-y-6 self-start">
                                <Card className="bg-card overflow-hidden rounded-3xl border shadow-sm">
                                    <CardHeader className="border-b pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-2xl">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </div>

                                            <div>
                                                <CardTitle className="text-lg font-bold tracking-wide">{t('common:labels.category')}</CardTitle>

                                                <p className="text-muted-foreground text-xs">{t('blogs:description.category')}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-3">
                                        <div className="space-y-1">
                                            {pageProps.websiteBlogCategories?.map((category) => (
                                                <button
                                                    key={category.value}
                                                    onClick={() => {
                                                        setCategory(category.value);

                                                        router.get(
                                                            route('guest.blogs.index'),
                                                            {
                                                                category: category.value,
                                                                search,
                                                                page: 1,
                                                            },
                                                            {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                                replace: true,
                                                            },
                                                        );
                                                    }}
                                                    className={cn(
                                                        'hover:bg-muted/60 group flex w-full items-center justify-between rounded-2xl px-3 py-1 transition-all duration-200',
                                                        category.value === pageProps.filters?.category && 'bg-primary/10',
                                                    )}
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="bg-primary/70 group-hover:bg-primary h-2 w-2 rounded-full transition-colors" />

                                                        <span className="group-hover:text-primary truncate text-[15px] font-medium transition-colors">
                                                            {category.label}
                                                        </span>
                                                    </div>

                                                    <div className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-7 min-w-[30px] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all duration-200">
                                                        {category.count}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/60 bg-card overflow-hidden rounded-[28px] border shadow-sm">
                                    <CardHeader className="border-b pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-2xl">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-bold tracking-wide">
                                                    {t('blogs:labels.related-articles')}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6 px-6 pb-6">
                                        {pageProps.relatedBlogs?.map((blog) => (
                                            <Link
                                                key={blog.slug}
                                                href={route('guest.blogs.show', blog.slug)}
                                                className="group flex items-start gap-4"
                                            >
                                                <img
                                                    src={getFile('website-blogs', blog.banner)}
                                                    alt={blog.title}
                                                    className="h-[72px] w-[72px] rounded-2xl object-cover"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-foreground group-hover:text-primary line-clamp-3 text-[15px] leading-[1.45] font-semibold transition-colors">
                                                        {blog.title}
                                                    </h3>

                                                    <p className="text-muted-foreground mt-1 text-[13px]">
                                                        {formatDate({
                                                            date: blog.created_at,
                                                            format: 'DD MMMM YYYY',
                                                        })}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>
                    </div>
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
        <footer className="relative bg-transparent">
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
    const { auth } = usePage().props;
    return !auth.user ? (
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
    ) : (
        <Link
            href={route('guest.dashboard')}
            className={cn(
                buttonVariants({
                    size: 'sm',
                    variant: 'default',
                }),
            )}
        >
            <Store />
            {t('common:labels.dashboard')}
        </Link>
    );
};

function ArticleCard({ image, category, title, excerpt, date, link }) {
    return (
        <Link href={link} className="bg-card dark:bg-muted flex flex-col overflow-hidden rounded-xl shadow-sm">
            <img src={image} alt={title} className="h-44 w-full object-cover" />

            <div className="flex flex-1 flex-col p-5">
                <span className="text-primary mb-2 text-xs font-semibold">{category}</span>

                <p className="mb-1 text-xs text-gray-400">{date}</p>

                <h3 className="text-accent-foreground mb-2 line-clamp-2 font-semibold">{title}</h3>

                <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">{excerpt}</p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-gray-400"></span>
                    <button className="text-primary text-sm font-medium hover:underline">Baca Selengkapnya →</button>
                </div>
            </div>
        </Link>
    );
}
