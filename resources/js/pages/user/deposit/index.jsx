import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { depositStatuses, depositStatusOptions } from '@/enums/deposit';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon, CancelCircleHalfDotIcon, CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, ViewIcon, Wallet01Icon } from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Index({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('deposits');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [tableData, setTableData] = useState([]);
    const initialGlobalFilterState = {
        search: '',
        created_at: {
            start: null,
            end: null,
        },
        updated_at: {
            start: null,
            end: null,
        },
    };
    const tableState = {
        sorting: [{ id: 'id', desc: true }],
        columnFilters: [],
        globalFilter: initialGlobalFilterState,
        columnVisibility: {
            created_at: false,
            updated_at: false,
            admin_fee: false,
            unique_code: false,
            total_payment: false,
            initial_balance: false,
            final_balance: false,
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        total: { amount: 0, count: 0 },
        pending: { amount: 0, count: 0 },
        completed: { amount: 0, count: 0 },
        failed: { amount: 0, count: 0 },
    });

    const fetchData = async ({ pagination, columnFilters, globalFilter, sorting }) => {
        setIsLoading(true);
        setSummary({
            total: { amount: 0, count: 0 },
            pending: { amount: 0, count: 0 },
            completed: { amount: 0, count: 0 },
            failed: { amount: 0, count: 0 },
        });
        try {
            const response = await fetch(
                route('user.deposits.index', {
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
                id: 'expander',
                header: () => null,
                cell: ({ row }) => {
                    return (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className={cn('h-auto p-0')} onClick={() => row.toggleExpanded()}>
                                        {row.getIsExpanded() ? (
                                            <ChevronDownIcon className="text-destructive" />
                                        ) : (
                                            <ChevronRightIcon className="text-primary" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{row.getIsExpanded() ? t('common:tooltips.close-detail') : t('common:tooltips.open-detail')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                enableSorting: false,
                enableHiding: false,
                width: '32px',
            },
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                width: '32px',
            },
            {
                accessorKey: 'id',
                headerName: t('common:labels.id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.id')} />,
                cell: ({ row }) => row.getValue('id'),
                width: '32px',
            },
            {
                accessorFn: (row) => row.created_at,
                id: 'created_at',
                headerName: t('common:labels.created-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.created-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.created_at,
                    }),
                width: '170px',
            },
            {
                accessorFn: (row) => row.updated_at,
                id: 'updated_at',
                headerName: t('common:labels.updated-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.updated-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.updated_at,
                    }),
                width: '170px',
            },
            {
                accessorKey: 'payment_method_id',
                headerName: t('common:labels.payment-method'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.payment-method')} />,
                cell: ({ row }) => row.original.payment_method_name,
            },
            {
                accessorKey: 'amount',
                headerName: t('common:labels.amount'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.amount')} />,
                cell: ({ row }) => formatCurrency(row.original.amount),
                width: '32px',
            },
            {
                accessorKey: 'bonus',
                headerName: t('common:labels.bonus'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.bonus')} />,
                cell: ({ row }) => formatCurrency(row.original.bonus),
                enableSorting: false,
                width: '32px',
            },
            {
                accessorKey: 'admin_fee',
                headerName: t('common:labels.admin-fee'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.admin-fee')} />,
                cell: ({ row }) => formatCurrency(row.original.admin_fee),
                enableSorting: false,
                width: '32px',
            },
            {
                accessorKey: 'unique_code',
                headerName: t('deposits:labels.unique-code'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('deposits:labels.unique-code')} />,
                cell: ({ row }) => formatCurrency(row.original.unique_code),
                enableSorting: false,
                width: '32px',
            },
            {
                accessorKey: 'total_payment',
                headerName: t('deposits:labels.total-payment'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('deposits:labels.total-payment')} />,
                cell: ({ row }) => formatCurrency(row.original.total_payment),
                width: '32px',
            },
            {
                accessorKey: 'total_balance',
                headerName: t('deposits:labels.total-balance'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('deposits:labels.total-balance')} />,
                cell: ({ row }) => formatCurrency(row.original.total_balance),
                width: '32px',
            },
            {
                accessorKey: 'initial_balance',
                headerName: t('common:labels.initial-balance'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.initial-balance')} />,
                cell: ({ row }) => formatCurrency(row.original.initial_balance),
                enableSorting: false,
                width: '100px',
            },
            {
                accessorKey: 'final_balance',
                headerName: t('common:labels.final-balance'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.final-balance')} />,
                cell: ({ row }) => formatCurrency(row.original.final_balance),
                enableSorting: false,
                width: '100px',
            },
            {
                accessorKey: 'status',
                headerName: t('common:labels.status'),
                id: 'status',
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => {
                    const Icon = depositStatuses[row.original.status].icon;
                    return (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant={depositStatuses[row.original.status].variant} className={cn('flex h-6')}>
                                <Icon />
                                {t(depositStatuses[row.original.status].label)}
                            </Button>
                        </div>
                    );
                },
                width: '100px',
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-center gap-2">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" className="h-6 w-6" onClick={() => row.toggleExpanded()}>
                                        <ViewIcon className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{row.getIsExpanded() ? t('common:tooltips.close-detail') : t('common:tooltips.open-detail')}</p>
                                </TooltipContent>
                            </Tooltip>
                            {row.original.status === 'pending' ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-6 w-6"
                                            onClick={() => handleSwitch(row.original.id, 'status', 'canceled')}
                                        >
                                            <CancelCircleIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="bg-red-500 hover:bg-red-500/90"
                                        arrowClassName="bg-red-500 fill-red-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>Batalkan Deposit</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                ''
                            )}
                            <Tooltip>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" variant="destructive" className="size-6">
                                                <CancelCircleHalfDotIcon className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent isBlur>
                                        <AlertDialogHeader className="text-left">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-md bg-amber-100 p-1.5 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-900/40">
                                                    <Alert01Icon />
                                                </div>
                                                <div className="space-y-1">
                                                    <AlertDialogTitle className="text-base">{t('deposits:dialog.cancel.title')}</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-sm">
                                                        {toHTML(
                                                            t('deposits:dialog.cancel.description', {
                                                                item: t('common:labels.deposit'),
                                                                value: row.original.id,
                                                            }),
                                                        )}
                                                    </AlertDialogDescription>
                                                </div>
                                            </div>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-4">
                                            <AlertDialogCancel>{t('deposits:dialog.cancel.cancel-button')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleSwitch(row.original.id, 'status', 'canceled')}>
                                                {t('deposits:dialog.cancel.confirm-button')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <TooltipContent
                                    className="bg-red-500 hover:bg-red-500/90"
                                    arrowClassName="bg-red-500 fill-red-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                >
                                    <p>{t('common:labels.cancel')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ),
                width: '32px',
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
                column_filter: false,
                type: 'daterange',
                label: t('common:labels.updated-at'),
                from: 'updated_at.start',
                to: 'updated_at.end',
            },
            {
                column_filter: true,
                label: t('common:labels.payment-method'),
                column: 'payment_method_id',
                options: pageProps?.paymentMethods || [],
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: depositStatusOptions,
            },
        ],
        [i18n.language, pageProps?.paymentMethods],
    );

    const handleSwitch = async (id, columnName, columnValue) => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                route('user.deposits.switch', {
                    target: id,
                    columnName,
                    columnValue,
                }),
            );
            toast({
                variant: 'success',
                description: toHTML(response.data.message),
            });
            setTableData((prevData) => ({
                ...prevData,
                data: prevData.data.map((item) => (id === item.id ? { ...item, status: 'canceled' } : item)),
            }));
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const rowSelectionActions = useMemo(
        () => [
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.id'),
                }),
                type: 'copy',
            },
        ],
        [i18n.language],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.deposits'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.deposits'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.list'),
                        href: '/',
                    },
                ]}
            >
                <Deferred data="pageProps" fallback={<AppSkeleton />}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[
                            {
                                label: t('common:summary.total'),
                                icon: <Wallet01Icon className="text-primary h-6 w-6" />,
                                amount: formatCurrency(summary.total.amount),
                                count: formatAmount(summary.total.count),
                                bg: 'bg-gradient-to-b to-0% from-primary to-accent',
                                text: 'text-primary',
                            },
                            {
                                label: t('common:summary.pending'),
                                icon: <Clock05Icon className="h-6 w-6 text-yellow-500" />,
                                amount: formatCurrency(summary.pending.amount),
                                count: formatAmount(summary.pending.count),
                                bg: 'bg-gradient-to-b to-0% from-yellow-100 to-accent',
                                text: 'text-yellow-600',
                            },
                            {
                                label: t('common:summary.success'),
                                icon: <CheckmarkCircle01Icon className="h-6 w-6 text-green-600" />,
                                amount: formatCurrency(summary.completed.amount),
                                count: formatAmount(summary.completed.count),
                                bg: 'bg-gradient-to-b to-0% from-green-100 to-accent',
                                text: 'text-green-600',
                            },
                            {
                                label: t('common:summary.fail'),
                                icon: <CancelCircleIcon className="h-6 w-6 text-red-600" />,
                                amount: formatCurrency(summary.failed.amount),
                                count: formatAmount(summary.failed.count),
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
                                            {stat.amount} ({stat.count} {t('common:labels.deposits')})
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
                        rowSelectionActions={rowSelectionActions}
                        onChange={fetchData}
                        isLoading={isLoading}
                    />
                </Deferred>
            </AppLayout>
        </>
    );
}
