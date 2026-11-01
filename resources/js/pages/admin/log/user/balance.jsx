import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { balanceCategories, balanceTypes } from '@/enums/balance';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { MinusSignCircleIcon, PlusSignCircleIcon, Wallet01Icon } from 'hugeicons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Index({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['account', 'orders', 'deposits', 'affiliate']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [tableData, setTableData] = useState([]);
    const initialGlobalFilterState = {
        search: '',
        created_at: {
            start: null,
            end: null,
        },
    };
    const tableState = {
        sorting: [{ id: 'created_at', desc: true }],
        columnFilters: [],
        globalFilter: initialGlobalFilterState,
        columnVisibility: {
            id: false,
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        total: { amount: 0, count: 0 },
        credit: { amount: 0, count: 0 },
        debit: { amount: 0, count: 0 },
    });

    const fetchData = async ({ pagination, columnFilters, globalFilter, sorting }) => {
        setIsLoading(true);
        setSummary({
            total: { amount: 0, count: 0 },
            credit: { amount: 0, count: 0 },
            debit: { amount: 0, count: 0 },
        });
        try {
            const response = await fetch(
                route(route().current(), {
                    page: pagination.pageIndex + 1,
                    length: pagination.pageSize,
                    filter: {
                        ...globalFilter,
                        ...columnFilters.reduce((acc, item) => {
                            const key = item.id === 'name' ? 'search' : item.id;
                            const value = Array.isArray(item.value) ? item.value.join(',') : item.value;
                            acc[key] = value;
                            return acc;
                        }, {}),
                    },
                    order: {
                        column: sorting[0].id,
                        direction: sorting[0].desc ? 'desc' : 'asc',
                    },
                }),
            );
            const data = await response.json();
            setTableData(data.data);
            setSummary(data.summary);
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            {
                id: 'id',
                cell: ({ row }) => row.original.created_at,
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorFn: (row) => row.created_at,
                id: 'created_at',
                headerName: t('common:labels.created-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.created-at')} />,
                cell: ({ row }) => formatDate({ date: row.original.created_at }),
                width: '170px',
            },
            {
                accessorFn: (row) => row.user_id,
                id: 'user_id',
                headerName: t('common:labels.user'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.user')} />,
                cell: ({ row }) => row.original.user?.username,
                width: '200px',
            },
            {
                accessorFn: (row) => row.type,
                id: 'type',
                headerName: t('common:labels.type'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.type')} />,
                cell: ({ row }) => (
                    <span className={`text-${balanceTypes[row.original.type].color}`}>{t(balanceTypes[row.original.type].label)}</span>
                ),
                width: '100px',
            },
            {
                accessorFn: (row) => row.category,
                id: 'category',
                headerName: t('common:labels.category'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.category')} />,
                cell: ({ row }) => t(balanceCategories[row.original.category].label),
                width: '100px',
            },
            {
                accessorFn: (row) => row.amount,
                id: 'amount',
                headerName: t('common:labels.amount'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.amount')} />,
                cell: (info) => formatCurrency(info.getValue()),
                width: '100px',
            },
            {
                accessorFn: (row) => row.initial_balance,
                id: 'initial_balance',
                headerName: t('common:labels.initial-balance'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.initial-balance')} />,
                cell: (info) => formatCurrency(info.getValue()),
                enableSorting: false,
                width: '100px',
            },
            {
                accessorFn: (row) => row.final_balance,
                id: 'final_balance',
                headerName: t('common:labels.final-balance'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.final-balance')} />,
                cell: (info) => formatCurrency(info.getValue()),
                enableSorting: false,
                width: '100px',
            },
            {
                accessorFn: (row) => row.content_key,
                id: 'content_key',
                headerName: t('common:labels.content'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.content')} />,
                cell: ({ row }) => {
                    let contentParams = row.original.content_params;

                    if (row.original.category === 'commission') {
                        contentParams = {
                            ...contentParams,
                            amount: formatCurrency(contentParams.amount),
                        };
                    }

                    if (row.original.category === 'other') {
                        contentParams = {
                            ...contentParams,
                            amount: formatCurrency(contentParams.amount),
                        };
                    }

                    return toHTML(t(row.original.content_key, contentParams));
                },
                enableSorting: false,
            },
        ],
        [i18n.language],
    );

    const filters = useMemo(
        () => [
            {
                column_filter: false,
                type: 'daterange',
                label: t('common:labels.created-at'),
                from: 'created_at.start',
                to: 'created_at.end',
            },
            {
                column_filter: true,
                label: t('common:labels.user'),
                column: 'user_id',
                options: pageProps?.users || [],
            },
            {
                column_filter: true,
                label: t('common:labels.type'),
                column: 'type',
                options: pageProps?.types || [],
            },
            {
                column_filter: true,
                label: t('common:labels.category'),
                column: 'category',
                options: pageProps?.categories || [],
            },
        ],
        [pageProps?.users, pageProps?.types, pageProps?.categories, i18n.language],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.logs'), t('common:labels.balance'), t('common:labels.user'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.logs'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.user'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.balance'),
                        href: '/',
                    },
                ]}
            >
                <Deferred data="pageProps" fallback={<AppSkeleton />}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {[
                            {
                                label: t('common:labels.total'),
                                icon: <Wallet01Icon className="text-primary h-6 w-6" />,
                                amount: formatCurrency(summary.total.amount),
                                count: formatAmount(summary.total.count),
                                bg: 'bg-gradient-to-b to-0% from-primary to-accent',
                                text: 'text-primary',
                            },
                            {
                                label: t('common:labels.credit'),
                                icon: <PlusSignCircleIcon className="h-6 w-6 text-green-600" />,
                                amount: formatCurrency(summary.credit.amount),
                                count: formatAmount(summary.credit.count),
                                bg: 'bg-gradient-to-b to-0% from-green-100 to-accent',
                                text: 'text-green-600',
                            },
                            {
                                label: t('common:labels.debit'),
                                icon: <MinusSignCircleIcon className="h-6 w-6 text-red-600" />,
                                amount: formatCurrency(summary.debit.amount),
                                count: formatAmount(summary.debit.count),
                                bg: 'bg-gradient-to-b to-0% from-red-100 to-accent',
                                text: 'text-red-600',
                            },
                        ].map((stat, index) => (
                            <div key={index} className={cn(`flex items-center justify-between rounded-xl p-4 shadow-sm ${stat.bg}`)}>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-transparent p-2 shadow-inner">{stat.icon}</div>
                                    <div>
                                        <div className={cn('text-sm font-semibold', stat.text)}>{stat.label}</div>
                                        <div className={cn('text-xs', stat.text)}>
                                            {stat.amount} ({stat.count} Data)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <DataTable
                        pageProps={pageProps}
                        tableData={tableData}
                        initialGlobalFilterState={initialGlobalFilterState}
                        tableState={tableState}
                        columns={columns}
                        filters={filters}
                        onChange={fetchData}
                        isLoading={isLoading}
                    />
                </Deferred>
            </AppLayout>
        </>
    );
}
