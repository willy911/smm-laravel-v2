import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { orderRefillStatuses, orderRefillStatusOptions } from '@/enums/order-refill';
import { toast } from '@/hooks/use-toast';
import { cn, config, formatDate, toHTML } from '@/lib/utils';
import { Deferred } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Refill({ pageProps }) {
    const { t, i18n } = useTranslation('orders');
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
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async ({ pagination, columnFilters, globalFilter, sorting }) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                route('user.orders.refills.index', {
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
                accessorKey: 'order_id',
                headerName: t('common:labels.order-id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.order-id')} />,
                cell: ({ row }) => row.original.order_id,
                width: '32px',
            },
            {
                accessorKey: 'service_id',
                headerName: t('common:labels.service'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.service')} />,
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-primary h-4.5 rounded-sm border-none text-[11px]">
                                {row.original.service.id}
                            </Badge>
                            <span className="block max-h-[24px] overflow-hidden transition-all duration-500 hover:max-h-[200px] sm:max-w-lg">
                                <span className="block overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal">
                                    {row.original.service?.name ?? row.original.service_name}
                                </span>
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'target',
                headerName: t('common:labels.target'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.target')} />,
                cell: ({ row }) => {
                    return (
                        <div className="grid">
                            {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                            <span className="sm:max-w-md sm:truncate">{row.original.target}</span>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: 'status',
                headerName: t('common:labels.status'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => {
                    const Icon = orderRefillStatuses[row.original.status].icon;
                    return (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant={orderRefillStatuses[row.original.status].variant} className={cn('flex h-6')}>
                                <Icon />
                                {t(orderRefillStatuses[row.original.status].label)}
                            </Button>
                        </div>
                    );
                },
                width: '100px',
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
                label: t('common:labels.created-at'),
                from: 'updated_at.start',
                to: 'updated_at.end',
            },
            {
                column_filter: true,
                label: t('common:labels.service'),
                column: 'service_id',
                options: pageProps?.services || [],
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: orderRefillStatusOptions,
            },
        ],
        [i18n.language, pageProps?.services],
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
                pageTitle={cn(t('common:labels.refill'), t('common:labels.orders'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.orders'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.refill'),
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
        </>
    );
}
