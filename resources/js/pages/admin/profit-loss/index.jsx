import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Download01Icon, Loading01Icon, ProfitIcon, RefreshIcon } from 'hugeicons-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY_REPORT = {
    summary: {
        revenue: 0,
        modal: 0,
        profit: 0,
        margin: 0,
        transactions: 0,
    },
    per_day: [],
};

export default function Index({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('admin/profit-loss');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [report, setReport] = useState(EMPTY_REPORT);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState({
        start: null,
        end: null,
    });

    const buildQuery = useCallback((f) => {
        const params = new URLSearchParams();
        if (f.start) params.set('filter[created_at][start]', dayjs(f.start).format('YYYY-MM-DD'));
        if (f.end) params.set('filter[created_at][end]', dayjs(f.end).format('YYYY-MM-DD'));
        return params;
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('admin.profit-loss.index'), {
                params: {
                    page: 1,
                    ...Object.fromEntries(buildQuery(filter).entries()),
                },
            });
            if (response.data.status) {
                setReport({ ...EMPTY_REPORT, ...(response.data.data ?? {}) });
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
    }, [buildQuery, filter, t]);

    const handleExport = useCallback(() => {
        const params = buildQuery(filter);
        const query = params.toString();
        window.location.href = route('admin.profit-loss.export') + (query ? `?${query}` : '');
    }, [buildQuery, filter]);

    const resetFilters = useCallback(() => {
        setFilter({ start: null, end: null });
    }, []);

    const summary = report.summary ?? EMPTY_REPORT.summary;
    const perDay = Array.isArray(report.per_day) ? report.per_day : [];

    return (
        <AppLayout
            pageTitle={t('labels.title')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('labels.title'),
                    href: '/',
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
                            <Button size="sm" variant="secondary" onClick={handleExport}>
                                <Download01Icon className="mr-1.5 h-4 w-4" />
                                {t('labels.export')}
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
                                <Card>
                                    <CardHeader className="space-y-0">
                                        <CardTitle className="text-muted-foreground text-xs font-medium">{t('labels.revenue')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="text-xl font-bold">{formatCurrency(summary.revenue)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="space-y-0">
                                        <CardTitle className="text-muted-foreground text-xs font-medium">{t('labels.modal')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="text-xl font-bold">{formatCurrency(summary.modal)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="space-y-0">
                                        <CardTitle className="text-muted-foreground flex items-center gap-x-1.5 text-xs font-medium">
                                            <ProfitIcon className="h-3.5 w-3.5" />
                                            {t('labels.profit')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div
                                            className={cn(
                                                'text-xl font-bold',
                                                summary.profit > 0 ? 'text-emerald-600' : summary.profit < 0 ? 'text-red-600' : '',
                                            )}
                                        >
                                            {formatCurrency(summary.profit)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="space-y-0">
                                        <CardTitle className="text-muted-foreground text-xs font-medium">{t('labels.margin')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="text-xl font-bold">
                                            {Number(summary.margin ?? 0).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}%
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="space-y-0">
                                        <CardTitle className="text-muted-foreground text-xs font-medium">{t('labels.transactions')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="text-xl font-bold">{formatAmount(summary.transactions)}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-x-2">
                                        <ProfitIcon className="h-4 w-4" />
                                        {t('labels.per_day')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full overflow-x-auto">
                                        <Table className="min-w-[720px]">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('labels.date')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.order_count')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.revenue')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.modal')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.profit')}</TableHead>
                                                    <TableHead className="text-right">{t('labels.margin')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {perDay.length > 0 ? (
                                                    perDay.map((row) => (
                                                        <TableRow key={row.date}>
                                                            <TableCell className="font-medium">{row.date}</TableCell>
                                                            <TableCell className="text-right">{formatAmount(row.orders)}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(row.modal)}</TableCell>
                                                            <TableCell className="text-right">
                                                                <span
                                                                    className={cn(
                                                                        'font-semibold',
                                                                        row.profit > 0 ? 'text-emerald-600' : row.profit < 0 ? 'text-red-600' : '',
                                                                    )}
                                                                >
                                                                    {formatCurrency(row.profit)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {Number(row.margin ?? 0).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-muted-foreground h-16 text-center">
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
