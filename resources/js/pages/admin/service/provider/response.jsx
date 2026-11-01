import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, config, formatDate, toHTML } from '@/lib/utils';
import { Deferred } from '@inertiajs/react';
import { SourceCodeIcon } from 'hugeicons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Response({ pageProps }) {
    const { t, i18n } = useTranslation(['admin/provider-response', 'admin/common', 'common']);
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [logs, setLogs] = useState({});
    const initialGlobalFilterState = {
        search: '',
        created_at: {
            start: null,
            end: null,
        },
    };
    const tableState = {
        sorting: [{ id: 'id', desc: true }],
        columnFilters: [],
        globalFilter: initialGlobalFilterState,
        columnVisibility: {
            order_id: false,
            order_refill_id: false,
            order_cancel_id: false,
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };

    const typeLabels = useMemo(() => {
        const labels = {};
        (pageProps?.types || []).forEach((item) => {
            labels[item.value] = item.label;
        });
        return labels;
    }, [pageProps?.types]);

    const responseStatuses = useMemo(
        () => ({
            success: {
                label: t('admin/provider-response:labels.success'),
                variant: 'success',
            },
            fail: {
                label: t('admin/provider-response:labels.fail'),
                variant: 'destructive',
            },
        }),
        [i18n.language],
    );

    const fetchData = useCallback(
        async ({ pagination, columnFilters, globalFilter, sorting }) => {
            setIsLoading(true);
            try {
                const rawTableRequest = {
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
                };

                const response = await fetch(route(route().current(), rawTableRequest), {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const data = await response.json();
                setTableData(data.data);
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

    const handleOpenLogs = useCallback((row) => {
        setLogs(row.original.logs ?? {});
        setIsOpenDialog(true);
    }, []);

    const columns = useMemo(
        () => [
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
                headerName: t('admin/provider-response:labels.created_at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.created_at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.created_at,
                    }),
                width: '170px',
            },
            {
                accessorFn: (row) => row.type,
                id: 'type',
                headerName: t('admin/provider-response:labels.type'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.type')} />,
                cell: ({ row }) => typeLabels[row.original.type] ?? row.original.type,
            },
            {
                accessorFn: (row) => row.user_id,
                id: 'user_id',
                headerName: t('admin/provider-response:labels.user'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.user')} />,
                cell: ({ row }) => row.original.user?.username ?? row.original.user_id,
            },
            {
                accessorFn: (row) => row.service_provider_id,
                id: 'service_provider_id',
                headerName: t('admin/provider-response:labels.provider'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.provider')} />,
                cell: ({ row }) => row.original.service_provider?.alias ?? row.original.service_provider_id,
            },
            {
                accessorKey: 'service_id',
                headerName: t('admin/provider-response:labels.service'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.service')} />,
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center gap-2">
                            {row.original.service && (
                                <Badge variant="secondary" className="text-primary h-4.5 rounded-sm border-none text-[11px]">
                                    {row.original.service.id}
                                </Badge>
                            )}
                            <span className="block max-h-[24px] overflow-hidden transition-all duration-500 hover:max-h-[200px] sm:max-w-lg">
                                <span className="block overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal">
                                    {row.original.service?.name ?? row.original.service_id ?? '-'}
                                </span>
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'order_id',
                headerName: t('admin/provider-response:labels.order_id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.order_id')} />,
                cell: ({ row }) => row.original.order?.ref_id ?? row.original.order_id ?? '-',
                width: '110px',
            },
            {
                accessorKey: 'order_refill_id',
                headerName: t('admin/provider-response:labels.order_refill_id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.order_refill_id')} />,
                cell: ({ row }) => row.original.order_refill?.ref_id ?? row.original.order_refill_id ?? '-',
                width: '110px',
            },
            {
                accessorKey: 'order_cancel_id',
                headerName: t('admin/provider-response:labels.order_cancel_id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.order_cancel_id')} />,
                cell: ({ row }) => row.original.order_cancel?.ref_id ?? row.original.order_cancel_id ?? '-',
                width: '110px',
            },
            {
                accessorFn: (row) => JSON.stringify(row.logs),
                id: 'logs',
                headerName: t('admin/provider-response:labels.logs'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.logs')} />,
                cell: ({ row }) => (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" className="h-6 max-w-xs justify-start" onClick={() => handleOpenLogs(row)}>
                                    <SourceCodeIcon className="h-4 w-4 shrink-0" />
                                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{JSON.stringify(row.original.logs)}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('admin/provider-response:labels.view_log')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'status',
                headerName: t('admin/provider-response:labels.status'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/provider-response:labels.status')} />,
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant={responseStatuses[row.original.status]?.variant ?? 'outline'} className={cn('flex h-6')}>
                                {responseStatuses[row.original.status]?.label ?? row.original.status}
                            </Button>
                        </div>
                    );
                },
                width: '100px',
            },
        ],
        [i18n.language, typeLabels, handleOpenLogs],
    );

    const filters = useMemo(
        () => [
            {
                column_filter: false,
                type: 'daterange',
                label: t('admin/provider-response:labels.created_at'),
                from: 'created_at.start',
                to: 'created_at.end',
            },
            {
                column_filter: true,
                label: t('admin/provider-response:labels.type'),
                column: 'type',
                options: pageProps?.types || [],
            },
            {
                column_filter: true,
                label: t('admin/provider-response:labels.status'),
                column: 'status',
                options: pageProps?.statuses || [],
            },
        ],
        [i18n.language, pageProps?.types, pageProps?.statuses],
    );

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
                pageTitle={cn('Respon', 'Penyedia')}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.services'),
                        href: '/',
                    },
                    {
                        title: t('admin/common:labels.provider'),
                        href: '/',
                    },
                    {
                        title: t('admin/provider-response:labels.type'),
                        href: '/',
                    },
                ]}
            >
                <Deferred data="pageProps" fallback={<AppSkeleton />}>
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

            <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
                <DialogContent className="w-full sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('admin/provider-response:labels.logs')}</DialogTitle>
                        <DialogDescription />
                    </DialogHeader>
                    <pre className="bg-muted/40 max-h-[60vh] overflow-auto rounded-lg p-4 text-xs" style={{ whiteSpace: 'pre-wrap' }}>
                        {logs && Object.keys(logs).length ? JSON.stringify(logs, null, 2) : t('admin/provider-response:empty.logs')}
                    </pre>
                </DialogContent>
            </Dialog>
        </>
    );
}
