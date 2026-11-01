import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, config, createCurrencyFormatter } from '@/lib/utils';
import { Deferred, router, usePage } from '@inertiajs/react';
import { ChampionIcon, ShoppingBag01Icon, ShoppingBagAddIcon, Wallet01Icon } from 'hugeicons-react';
import { Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Leaderboard({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation();
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const getRankColor = (index) => {
        if (index === 0) return 'border-l-4 border-yellow-500';
        if (index === 1) return 'border-l-4 border-gray-400';
        if (index === 2) return 'border-l-4 border-amber-600';
        return '';
    };
    return (
        <AppLayout
            pageTitle={t('common:labels.leaderboard')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.leaderboard'),
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="container mx-auto max-w-4xl">
                    <div className="grid items-start gap-4 sm:grid-cols-2">
                        <Card className="col-span-2 sm:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-x-2">
                                    <ShoppingBag01Icon className="h-4 w-4" />{' '}
                                    {t('common:leaderboard.top-10-orders-in-month', {
                                        month: new Intl.DateTimeFormat(i18n.language, {
                                            month: 'long',
                                        }).format(new Date(2025, new Date().getMonth())),
                                    })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                {pageProps?.orders?.length < 1 ? (
                                    <Alert className="bg-muted">
                                        <AlertDescription>{t('common:empty.no-data-yet')}</AlertDescription>
                                    </Alert>
                                ) : (
                                    pageProps?.orders?.map((order, index) => {
                                        const rankColors = ['bg-yellow-400 text-white', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
                                        return (
                                            <div key={index} className={cn('flex items-center justify-between rounded-lg py-1 transition last:pb-0')}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                                            index < 3 ? rankColors[index] : 'bg-muted text-muted-foreground',
                                                        )}
                                                    >
                                                        {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                    </div>
                                                    <span className="max-w-[120px] truncate text-sm font-medium">{order.full_name}</span>
                                                </div>
                                                <span className="text-primary text-sm font-semibold">{formatCurrency(order.amount)}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-2 sm:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-x-2">
                                    <Wallet01Icon className="h-4 w-4" />{' '}
                                    {t('common:leaderboard.top-10-deposits-in-month', {
                                        month: new Intl.DateTimeFormat(i18n.language, {
                                            month: 'long',
                                        }).format(new Date(2025, new Date().getMonth())),
                                    })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                {pageProps?.deposits?.length < 1 ? (
                                    <Alert className="bg-muted">
                                        <AlertDescription>{t('common:empty.no-data-yet')}</AlertDescription>
                                    </Alert>
                                ) : (
                                    pageProps?.deposits?.map((deposit, index) => {
                                        const rankColors = ['bg-yellow-400 text-white', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
                                        return (
                                            <div key={index} className={cn('flex items-center justify-between rounded-lg py-1 transition last:pb-0')}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                                            index < 3 ? rankColors[index] : 'bg-muted text-muted-foreground',
                                                        )}
                                                    >
                                                        {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                    </div>
                                                    <span className="max-w-[120px] truncate text-sm font-medium">{deposit.full_name}</span>
                                                </div>
                                                <span className="text-primary text-sm font-semibold">{formatCurrency(deposit.amount)}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-2 mx-auto w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-x-3">
                                    <Tags className="h-4 w-4" />{' '}
                                    {t('common:leaderboard.top-10-services-in-month', {
                                        month: new Intl.DateTimeFormat(i18n.language, {
                                            month: 'long',
                                        }).format(new Date(2025, new Date().getMonth())),
                                    })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                {pageProps?.services?.length < 1 ? (
                                    <Alert className="bg-muted">
                                        <AlertDescription>{t('common:empty.no-data-yet')}</AlertDescription>
                                    </Alert>
                                ) : (
                                    pageProps?.services?.map((service, index) => {
                                        const rankColors = ['bg-yellow-400 text-white', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
                                        return (
                                            <div key={index} className={cn('flex items-center justify-between rounded-lg py-1 transition last:pb-0')}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                                            index < 3 ? rankColors[index] : 'bg-muted text-muted-foreground',
                                                        )}
                                                    >
                                                        {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                    </div>
                                                    <span className="text-sm font-medium">{service.service_name}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="text-primary text-sm font-semibold">{formatCurrency(service.amount)}</span>
                                                    <div className="ml-auto font-medium">
                                                        <Button
                                                            size="icon"
                                                            variant="success"
                                                            className="-mt-px h-6 w-6"
                                                            onClick={() => {
                                                                router.visit(
                                                                    route('user.orders.create', {
                                                                        target: service.service_id,
                                                                    }),
                                                                );
                                                            }}
                                                        >
                                                            <ShoppingBagAddIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Deferred>
        </AppLayout>
    );
}
