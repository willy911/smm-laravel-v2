import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { config, createCurrencyFormatter } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { ChampionIcon, ShoppingCart01Icon, TagsIcon, Wallet01Icon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';

export default function Ranking({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('ranking');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    return (
        <AppLayout
            pageTitle={t('title')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('title'),
                    href: route('guest.ranking'),
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="container mx-auto max-w-4xl">
                    <div className="grid items-start gap-4 sm:grid-cols-2">
                        <Card className="col-span-2 sm:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-x-2">
                                    <ShoppingCart01Icon className="h-4 w-4" />{' '}
                                    {t('top-10-orders-in-month', { month: t('month-name', { returnObjects: true })[new Date().getMonth()] })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                {pageProps?.orders?.length < 1 ? (
                                    <Alert className="bg-muted">
                                        <AlertDescription>{t('no-orders-yet')}</AlertDescription>
                                    </Alert>
                                ) : (
                                    pageProps?.orders?.map((order, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg py-1 transition last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={index < 3 ? 'default' : 'secondary'} className="px-1.5">
                                                    {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                </Badge>
                                                <span className="max-w-[160px] truncate text-sm font-medium">{order.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {order.count > 1 && <span className="text-muted-foreground text-xs">×{order.count}</span>}
                                                <span className="text-primary text-sm font-semibold">{formatCurrency(order.amount)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-2 sm:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-x-2">
                                    <Wallet01Icon className="h-4 w-4" />{' '}
                                    {t('top-10-deposits-in-month', { month: t('month-name', { returnObjects: true })[new Date().getMonth()] })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                {pageProps?.deposits?.length < 1 ? (
                                    <Alert className="bg-muted">
                                        <AlertDescription>{t('no-deposits-yet')}</AlertDescription>
                                    </Alert>
                                ) : (
                                    pageProps?.deposits?.map((deposit, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg py-1 transition last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={index < 3 ? 'default' : 'secondary'} className="px-1.5">
                                                    {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                </Badge>
                                                <span className="max-w-[160px] truncate text-sm font-medium">{deposit.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {deposit.count > 1 && <span className="text-muted-foreground text-xs">×{deposit.count}</span>}
                                                <span className="text-primary text-sm font-semibold">{formatCurrency(deposit.amount)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-2 mx-auto w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-x-3">
                                    <TagsIcon className="h-4 w-4" />{' '}
                                    {t('top-10-services-in-month', { month: t('month-name', { returnObjects: true })[new Date().getMonth()] })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                {pageProps?.services?.length < 1 ? (
                                    <Alert className="bg-muted">
                                        <AlertDescription>{t('no-services-yet')}</AlertDescription>
                                    </Alert>
                                ) : (
                                    pageProps?.services?.map((service, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg py-1 transition last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={index < 3 ? 'default' : 'secondary'} className="px-1.5">
                                                    {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                </Badge>
                                                <span className="max-w-[400px] truncate text-sm font-medium">{service.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-xs">
                                                    {service.count} {t('orders-count')}
                                                </span>
                                                <span className="text-primary text-sm font-semibold">{formatCurrency(service.amount)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Deferred>
        </AppLayout>
    );
}
