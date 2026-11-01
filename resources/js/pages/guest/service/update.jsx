import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { serviceUpdateTypeOptions, serviceUpdateTypes } from '@/enums/service-update';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Update({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('services');
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
                route('guest.services.updates', {
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
                id: 'type',
                enableSorting: false,
                enableHiding: false,
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
                cell: ({ row }) => row.original.service_id,
                enableSorting: false,
                enableHiding: false,
                width: '32px',
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
                accessorKey: 'service_id',
                headerName: t('common:labels.service'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.service')} />,
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center gap-2 text-wrap">
                            <Badge variant="secondary" className="text-primary h-4.5 rounded-sm border-none text-[11px]">
                                {row.original.service.id}
                            </Badge>
                            <span className="block max-h-[24px] overflow-hidden transition-all duration-500 hover:max-h-[200px] sm:max-w-lg">
                                <span className="block overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal">
                                    {row.original.service?.name}
                                </span>
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'content_key',
                headerName: t('common:labels.description'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.description')} />,
                cell: ({ row }) => {
                    const Icon = serviceUpdateTypes[row.original.type].icon;
                    const formatContentParams = (params) => {
                        if (!params?.type || !params?.from || !params?.to) return params;
                        const formattedParams = { ...params };
                        if (params.type === 'amount') {
                            formattedParams.from = formatAmount(params.from);
                            formattedParams.to = formatAmount(params.to);
                        } else if (params.type === 'currency') {
                            formattedParams.from = formatCurrency(params.from);
                            formattedParams.to = formatCurrency(params.to);
                        }
                        return formattedParams;
                    };
                    return (
                        <div className="grid">
                            <span className="flex items-center gap-2 sm:max-w-sm sm:truncate">
                                {/* <Badge variant={serviceUpdateTypes[row.original.type].variant} className="h-4.5 rounded-sm border-none text-[11px]">
                                    {t(row.original.content_key, formatContentParams(row.original.content_params))}
                                </Badge> */}
                                <Badge variant="secondary" className={cn('rounded-sm border-none', serviceUpdateTypes[row.original.type].textColor)}>
                                    <Icon />
                                    {t(row.original.content_key, formatContentParams(row.original.content_params))}
                                </Badge>
                            </span>
                        </div>
                    );
                },
                width: '450px',
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
                label: t('common:labels.service'),
                column: 'service_id',
                options: pageProps?.services || [],
            },
            {
                column_filter: true,
                label: t('common:labels.type'),
                column: 'type',
                options: serviceUpdateTypeOptions,
            },
        ],
        [pageProps?.services, i18n.language],
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
                pageTitle={cn(t('common:labels.update'), t('common:labels.services'))}
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
                        title: t('common:labels.update'),
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
