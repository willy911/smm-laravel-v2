import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { orderStatuses } from '@/enums/order';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import dayjs from 'dayjs';
import { ArrowLeft01Icon, Calendar03Icon, CheckmarkCircle01Icon, Clock05Icon, Loading01Icon, RefreshIcon, ShoppingBag01Icon } from 'hugeicons-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY_REPORT = {
    total: { total: 0, price: 0 },
    pending: { total: 0, price: 0 },
    processing: { total: 0, price: 0 },
    completed: { total: 0, price: 0, profit: 0 },
    failed: { total: 0, price: 0 },
};

const EMPTY_ROWS = [];

export default function Report({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('admin/report');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [report, setReport] = useState(EMPTY_REPORT);
    const [rows, setRows] = useState(EMPTY_ROWS);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState({
        start: null,
        end: null,
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('admin.orders.report'), {
                params: {
                    page: 1,
                    from: filter.start ? dayjs(filter.start).format('YYYY-MM-DD') : undefined,
                    to: filter.end ? dayjs(filter.end).format('YYYY-MM-DD') : undefined,
                },
            });
            if (response.data.status) {
                setReport({ ...EMPTY_REPORT, ...(response.data.report ?? {}) });
                setRows(Array.isArray(response.data.data) ? response.data.data : EMPTY_ROWS);
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? t('common:toast.exception')),
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
    }, [filter, t]);

    const resetFilters = useCallback(() => {
        setFilter({ start: null, end: null });
    }, []);

    const summaryCards = [
        {
            key: 'total',
            label: t('labels.total'),
            amount: report.total.price,
            count: report.total.total,
            icon: <ShoppingBag01Icon className="text-primary h-6 w-6" />,
            amountClass: 'text-primary',
        },
        {
            key: 'pending',
            label: t('labels.pending'),
            amount: report.pending.price,
            count: report.pending.total,
            icon: <Clock05Icon className="h-6 w-6 text-yellow-500" />,
            amountClass: 'text-yellow-600',
        },
        {
            key: 'processing',
            label: t('labels.processing'),
            amount: report.processing.price,
            count: report.processing.total,
            icon: <Loading01Icon className="h-6 w-6 text-blue-600" />,
            amountClass: 'text-blue-600',
        },
        {
            key: 'completed',
            label: t('labels.completed'),
            amount: report.completed.price,
            count: report.completed.total,
            icon: <CheckmarkCircle01Icon className="h-6 w-6 text-green-600" />,
            amountClass: 'text-green-600',
        },
        {
            key: 'failed',
            label: t('labels.failed'),
            amount: report.failed.price,
            count: report.failed.total,
            icon: <ShoppingBag01Icon className="h-6 w-6 text-red-600" />,
            amountClass: 'text-red-600',
        },
    ];

    return (
        <AppLayout
            pageTitle={t('labels.title')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('labels.orders'),
                    href: '/admin/orders',
                },
                {
                    title: t('labels.title'),
                    href: route('admin.orders.report'),
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                        <input
                            type="date"
                            aria-label={t('labels.start')}
                            className="border-input h-8 w-full rounded-md border bg-transparent px-2 text-xs md:w-[170px]"
                            value={filter.start ?? ''}
                            onChange={(event) => setFilter((prev) => ({ ...prev, start: event.target.value || null }))}
                        />
                        <input
                            type="date"
                            aria-label={t('labels.end')}
                            className="border-input h-8 w-full rounded-md border bg-transparent px-2 text-xs md:w-[170px]"
                            value={filter.end ?? ''}
                            onChange={(event) => setFilter((prev) => ({ ...prev, end: event.target.value || null }))}
                        />
                        <div className="flex items-center gap-2 md:ml-auto">
                            <Button size="sm" onClick={fetchData} disabled={isLoading}>
                                {isLoading ? t('labels.loading') : t('labels.apply')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={resetFilters} disabled={isLoading}>
                                <RefreshIcon className="mr-1.5 h-4 w-4" />
                                {t('labels.reset')}
                            </Button>
                            <Button size="sm" variant="secondary" asChild>
                                <a href={route('admin.orders.index')}>
                                    <ArrowLeft01Icon className="mr-1.5 h-4 w-4" />
                                    {t('labels.back')}
                                </a>
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <Alert className="bg-muted text-center">
                            <AlertDescription className="flex items-center justify-center">
                                <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                {t('labels.loading')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                                {summaryCards.map((card) => (
                                    <Card key={card.key}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                            <CardTitle className="text-muted-foreground text-xs font-medium">{card.label}</CardTitle>
                                            {card.icon}
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className={cn('text-xl font-bold', card.amountClass)}>{formatCurrency(card.amount)}</div>
                                            <p className="text-muted-foreground text-xs">
                                                {formatAmount(card.count)} {t('labels.orders')}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-muted-foreground text-xs font-medium">{t('labels.profit')}</CardTitle>
                                        <Calendar03Icon className="h-6 w-6 text-emerald-600" />
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div
                                            className={cn(
                                                'text-xl font-bold',
                                                report.completed.profit > 0 ? 'text-emerald-600' : report.completed.profit < 0 ? 'text-red-600' : '',
                                            )}
                                        >
                                            {formatCurrency(report.completed.profit)}
                                        </div>
                                        <p className="text-muted-foreground text-xs">{t('labels.profit_note')}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-x-2">
                                        <ShoppingBag01Icon className="h-4 w-4" />
                                        {t('labels.transactions')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full overflow-x-auto">
                                        <Table className="min-w-[900px]">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('labels.date')}</TableHead>
                                                    <TableHead>{t('labels.user')}</TableHead>
                                                    <TableHead>{t('labels.service')}</TableHead>
                                                    <TableHead>{t('labels.target')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.quantity')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.price')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.profit')}</TableHead>
                                                    <TableHead>{t('labels.status')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rows.length > 0 ? (
                                                    rows.map((row) => {
                                                        const statusInfo = orderStatuses[row.status];
                                                        const StatusIcon = statusInfo?.icon;
                                                        return (
                                                            <TableRow key={row.id}>
                                                                <TableCell className="font-medium">
                                                                    {dayjs(row.created_at).format('DD/MM/YYYY HH:mm')}
                                                                </TableCell>
                                                                <TableCell>{row.user?.username ?? '-'}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        {row.service_id != null && row.service_id > 0 && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="text-primary h-4.5 rounded-sm border-none text-[11px]"
                                                                            >
                                                                                {row.service_id}
                                                                            </Badge>
                                                                        )}
                                                                        <span className="block max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                                            {row.service_name}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                                    {row.target}
                                                                </TableCell>
                                                                <TableCell className="text-right">{formatAmount(row.quantity)}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(row.price)}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(row.profit)}</TableCell>
                                                                <TableCell>
                                                                    {statusInfo ? (
                                                                        <Button size="sm" variant={statusInfo.variant} className="flex h-6">
                                                                            {StatusIcon && <StatusIcon />}
                                                                            {t(statusInfo.label)}
                                                                        </Button>
                                                                    ) : (
                                                                        <Badge variant="outline">{row.status}</Badge>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-muted-foreground h-16 text-center">
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
