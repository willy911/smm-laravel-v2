import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, config, formatAmount, formatDate, formatDuration, toHTML } from '@/lib/utils';
import { Deferred, router, usePage } from '@inertiajs/react';
import { ShoppingBagAddIcon } from 'hugeicons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Monitoring({ pageProps }) {
    const { t, i18n } = useTranslation('services');
    const { auth } = usePage().props;
    const [tableData, setTableData] = useState([]);
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
            id: false,
            type: false,
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
                route('guest.services.monitoring', {
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
                cell: ({ row }) => row.original.service_id,
                enableSorting: false,
                enableHiding: false,
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
                width: '70%',
            },
            {
                accessorFn: (row) => row.quantity,
                id: 'quantity',
                headerName: t('common:labels.quantity'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.quantity')} />,
                cell: ({ row }) => formatAmount(row.original.quantity),
                width: '100px',
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.created_at,
                id: 'created_at',
                headerName: t('common:labels.started-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.started-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.created_at,
                    }),
                width: '150px',
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.updated_at,
                id: 'updated_at',
                headerName: t('common:labels.ended-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.ended-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.updated_at,
                    }),
                width: '150px',
                enableSorting: false,
            },
            {
                accessorKey: 'avg',
                headerName: t('common:labels.process-time'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.process-time')} />,
                cell: ({ row }) => <span className="text-primary font-medium">{formatDuration(row.original.process_time)}</span>,
                enableSorting: false,
                width: '150px',
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-center gap-2">
                        <TooltipProvider delayDuration={0}>
                            {auth.user && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="success"
                                            className="h-6 w-6"
                                            onClick={() => {
                                                router.visit(
                                                    route('user.orders.create', {
                                                        target: row.original.service_id,
                                                    }),
                                                );
                                            }}
                                        >
                                            <ShoppingBagAddIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="bg-green-500 hover:bg-green-500/90"
                                        arrowClassName="bg-green-500 fill-green-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>
                                            {t('common:actions.create-item', {
                                                item: t('common:labels.order'),
                                            })}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
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
                column_filter: true,
                label: t('common:labels.service'),
                column: 'service_id',
                options: pageProps?.services || [],
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
                pageTitle={cn(t('common:labels.monitoring'), t('common:labels.services'))}
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
                        title: t('common:labels.monitoring'),
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
