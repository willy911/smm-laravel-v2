import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { orderStatuses } from '@/enums/order';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Calendar03Icon, CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, Loading03Icon, ShoppingBag01Icon } from 'hugeicons-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY_SUMMARY = {
    total: { count: 0, price: 0 },
    pending: { count: 0, price: 0 },
    processing: { count: 0, price: 0 },
    completed: { count: 0, price: 0 },
    failed: { count: 0, price: 0 },
};

export default function Report({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('report');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [summary, setSummary] = useState(pageProps?.summary ?? EMPTY_SUMMARY);
    const [rows, setRows] = useState(pageProps?.rows ?? []);
    const [isLoading, setIsLoading] = useState(false);
    const today = new Date().toISOString().slice(0, 10);
    const [filter, setFilter] = useState({
        from: today,
        to: today,
    });

    const fetchData = useCallback(
        async (f) => {
            setIsLoading(true);
            try {
                const response = await axios.get(route('user.orders.report'), {
                    params: {
                        from: f.from,
                        to: f.to,
                    },
                });
                const data = response.data.pageProps ?? {};
                setSummary(data.summary ?? EMPTY_SUMMARY);
                setRows(data.rows ?? []);
            } catch (error) {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [t],
    );

    const handleApply = useCallback(() => {
        fetchData(filter);
    }, [fetchData, filter]);

    const handleReset = useCallback(() => {
        const next = { from: today, to: today };
        setFilter(next);
        fetchData(next);
    }, [fetchData, today]);

    const summaryCards = [
        {
            label: t('summary.total'),
            icon: <ShoppingBag01Icon className="text-primary h-6 w-6" />,
            amount: formatCurrency(summary.total.price),
            count: formatAmount(summary.total.count),
            bg: 'to-0% from-primary to-accent bg-gradient-to-b',
            text: 'text-primary',
        },
        {
            label: t('summary.pending'),
            icon: <Clock05Icon className="h-6 w-6 text-yellow-500" />,
            amount: formatCurrency(summary.pending.price),
            count: formatAmount(summary.pending.count),
            bg: 'to-0% from-yellow-100 to-accent bg-gradient-to-b',
            text: 'text-yellow-600',
        },
        {
            label: t('summary.processing'),
            icon: <Loading03Icon className="h-6 w-6 text-blue-600" />,
            amount: formatCurrency(summary.processing.price),
            count: formatAmount(summary.processing.count),
            bg: 'to-0% from-blue-100 to-accent bg-gradient-to-b',
            text: 'text-blue-600',
        },
        {
            label: t('summary.completed'),
            icon: <CheckmarkCircle01Icon className="h-6 w-6 text-green-600" />,
            amount: formatCurrency(summary.completed.price),
            count: formatAmount(summary.completed.count),
            bg: 'to-0% from-green-100 to-accent bg-gradient-to-b',
            text: 'text-green-600',
        },
        {
            label: t('summary.failed'),
            icon: <CancelCircleIcon className="h-6 w-6 text-red-600" />,
            amount: formatCurrency(summary.failed.price),
            count: formatAmount(summary.failed.count),
            bg: 'to-0% from-red-100 to-accent bg-gradient-to-b',
            text: 'text-red-600',
        },
    ];

    return (
        <AppLayout
            pageTitle={cn(t('labels.list'), t('labels.orders'))}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('labels.orders'),
                    href: '/',
                },
                {
                    title: t('labels.report'),
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                        <div className="flex items-center gap-2">
                            <Calendar03Icon className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm font-medium">{t('labels.date-range')}</span>
                        </div>
                        <input
                            type="date"
                            aria-label={t('labels.from')}
                            className="border-input bg-background h-8 w-full rounded-md border px-2 text-xs md:w-[160px]"
                            value={filter.from ?? ''}
                            onChange={(event) => setFilter((prev) => ({ ...prev, from: event.target.value || null }))}
                        />
                        <input
                            type="date"
                            aria-label={t('labels.to')}
                            className="border-input bg-background h-8 w-full rounded-md border px-2 text-xs md:w-[160px]"
                            value={filter.to ?? ''}
                            onChange={(event) => setFilter((prev) => ({ ...prev, to: event.target.value || null }))}
                        />
                        <div className="flex items-center gap-2 md:ml-auto">
                            <Button size="sm" onClick={handleApply} disabled={isLoading}>
                                {isLoading ? t('labels.loading') : t('labels.apply')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleReset} disabled={isLoading}>
                                {t('labels.reset')}
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <Alert className="bg-muted text-center">
                            <AlertDescription className="flex items-center justify-center">
                                <Loading03Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                {t('labels.loading')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {summaryCards.map((stat, index) => (
                                    <div key={index} className={cn(`flex items-center justify-between rounded-xl p-4 shadow-sm ${stat.bg}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-background/40 rounded-lg p-2 shadow-inner">{stat.icon}</div>
                                            <div>
                                                <div className={cn('text-sm font-semibold', stat.text)}>{stat.label}</div>
                                                <div className={cn('text-xs', stat.text)}>
                                                    {stat.amount} ({stat.count} {t('labels.orders')})
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-x-2">
                                        <ShoppingBag01Icon className="h-4 w-4" />
                                        {t('labels.title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {rows.length > 0 && (
                                        <p className="text-muted-foreground mb-2 text-xs">{t('labels.showing-rows', { count: rows.length })}</p>
                                    )}
                                    <div className="w-full overflow-x-auto">
                                        <Table className="min-w-[720px]">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('labels.id')}</TableHead>
                                                    <TableHead>{t('labels.created-at')}</TableHead>
                                                    <TableHead>{t('labels.service')}</TableHead>
                                                    <TableHead>{t('labels.target')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.quantity')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.price')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.status')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rows.length > 0 ? (
                                                    rows.map((row) => {
                                                        const statusInfo = orderStatuses[row.status];
                                                        return (
                                                            <TableRow key={row.id}>
                                                                <TableCell className="font-medium">{row.id}</TableCell>
                                                                <TableCell className="whitespace-nowrap">
                                                                    {dayjs(row.created_at)
                                                                        .locale(localStorage.getItem('language') ?? 'id')
                                                                        .format('DD MMMM YYYY - HH:mm')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="block max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                                                        {row.service_name}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="block max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                                                        {row.target}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right">{formatAmount(row.quantity)}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(row.price)}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {statusInfo ? t(statusInfo.label) : row.status}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-muted-foreground h-16 text-center">
                                                            {t('labels.empty')}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </Deferred>
        </AppLayout>
    );
}
