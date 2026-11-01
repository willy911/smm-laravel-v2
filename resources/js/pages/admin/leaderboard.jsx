import AppLayout from '@/components/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { enUS, id } from 'date-fns/locale';
import { ChampionIcon, Loading01Icon, ShoppingBag01Icon, Wallet01Icon } from 'hugeicons-react';
import { Tags } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const localeMap = {
    id: id,
    en: enUS,
};

export default function Leaderboard({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('dashboard');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const currentLocale = localeMap[i18n.language] || id;
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [data, setData] = useState({
        orders: [],
        deposits: [],
        services: [],
    });
    const [isLoading, setIsLoading] = useState(false);

    const getData = async () => {
        setData({
            orders: [],
            deposits: [],
            services: [],
        });
        setIsLoading(true);
        try {
            const response = await axios.get(
                route(route().current(), {
                    render: true,
                    month: selectedMonth,
                }),
            );
            if (response.data.status) {
                setData(response.data.data);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, [selectedMonth]);

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
            <div className="container mx-auto max-w-4xl">
                <div className="grid items-start gap-4 sm:grid-cols-2">
                    <Select
                        defaultValue={selectedMonth}
                        onValueChange={(value) => {
                            setSelectedMonth(value);
                        }}
                    >
                        <SelectTrigger className={cn('col-span-2 w-full')}>
                            <SelectValue placeholder={t('common:placeholders.select')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: new Date().getMonth() + 1 }, (_, i) => {
                                const month = new Date(2000, i, 1);
                                const monthName = new Intl.DateTimeFormat(i18n.language, {
                                    month: 'long',
                                }).format(month);
                                return (
                                    <SelectItem key={i} value={i + 1}>
                                        {monthName}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {isLoading ? (
                        <Alert className="bg-muted col-span-2">
                            <AlertDescription className="flex items-center">
                                <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                {t('common:loading.please-wait')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <Card className="col-span-2 sm:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-x-2">
                                        <ShoppingBag01Icon className="h-4 w-4" />
                                        {t('common:leaderboard.top-10-orders-in-month', {
                                            month: new Intl.DateTimeFormat(i18n.language, {
                                                month: 'long',
                                            }).format(new Date(2025, selectedMonth - 1)),
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 pt-2">
                                    {data?.orders?.length < 1 ? (
                                        <Alert className="bg-muted">
                                            <AlertDescription>{t('common:empty.no-data-yet')}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        data?.orders?.map((order, index) => {
                                            const rankColors = ['bg-yellow-400 text-white', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
                                            return (
                                                <div
                                                    key={index}
                                                    className={cn('flex items-center justify-between rounded-lg py-1 transition last:pb-0')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={cn(
                                                                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                                                index < 3 ? rankColors[index] : 'bg-muted text-muted-foreground',
                                                            )}
                                                        >
                                                            {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                        </div>
                                                        <span className="text-sm font-medium">{order.full_name}</span>
                                                    </div>
                                                    <span className="text-primary text-sm font-semibold">
                                                        {formatCurrency(order.amount)} ({formatAmount(order.count)} {t('common:labels.orders')})
                                                    </span>
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
                                            }).format(new Date(2025, selectedMonth - 1)),
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 pt-2">
                                    {data?.deposits?.length < 1 ? (
                                        <Alert className="bg-muted">
                                            <AlertDescription>{t('common:empty.no-data-yet')}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        data?.deposits?.map((deposit, index) => {
                                            const rankColors = ['bg-yellow-400 text-white', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
                                            return (
                                                <div
                                                    key={index}
                                                    className={cn('flex items-center justify-between rounded-lg py-1 transition last:pb-0')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={cn(
                                                                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                                                index < 3 ? rankColors[index] : 'bg-muted text-muted-foreground',
                                                            )}
                                                        >
                                                            {index === 0 ? <ChampionIcon className="h-4 w-4" /> : `#${index + 1}`}
                                                        </div>
                                                        <span className="text-sm font-medium">{deposit.full_name}</span>
                                                    </div>
                                                    <span className="text-primary text-sm font-semibold">
                                                        {formatCurrency(deposit.amount)} ({formatAmount(deposit.count)} {t('common:labels.deposits')})
                                                    </span>
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
                                            }).format(new Date(2025, selectedMonth - 1)),
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 pt-2">
                                    {data?.services?.length < 1 ? (
                                        <Alert className="bg-muted">
                                            <AlertDescription>{t('common:empty.no-data-yet')}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        data?.services?.map((service, index) => {
                                            const rankColors = ['bg-yellow-400 text-white', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
                                            return (
                                                <div
                                                    key={index}
                                                    className={cn('flex items-center justify-between rounded-lg py-1 transition last:pb-0')}
                                                >
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
                                                        <span className="text-primary text-sm font-semibold">
                                                            {formatCurrency(service.amount)} ({formatAmount(service.count)}{' '}
                                                            {t('common:labels.orders')})
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
