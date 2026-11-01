import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Activity({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/logs']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [isSortDialogOpened, setIsSortDialogOpened] = useState(false);
    const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
    const [target, setTarget] = useState({});
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [bulkActionDialog, setBulkActionDialog] = useState({
        isOpen: false,
        action: null,
        selectedIds: [],
        actionType: '',
    });

    const tableStateRef = useRef({});

    const initialGlobalFilterState = {
        search: '',
        created_at: {
            start: null,
            end: null,
        },
    };

    const tableState = useMemo(
        () => ({
            sorting: [{ id: 'id', desc: true }],
            columnFilters: [],
            globalFilter: initialGlobalFilterState,
            columnVisibility: {
                created_at: false,
                user_agent: false,
            },
            rowSelection: {},
            pagination: { pageIndex: 0, pageSize: 10 },
            expanded: {},
        }),
        [initialGlobalFilterState],
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

                const currentTableStateRef = { pagination, columnFilters, globalFilter, sorting };
                tableStateRef.current = currentTableStateRef;

                const response = await fetch(route(route().current(), rawTableRequest));
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

    const closeBulkActionDialog = useCallback(() => {
        setBulkActionDialog({
            isOpen: false,
            action: null,
            selectedIds: [],
            actionType: '',
        });
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
                headerName: t('common:labels.created-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.created-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.created_at,
                    }),
                width: '170px',
            },
            {
                accessorFn: (row) => row.admin_id,
                id: 'admin_id',
                headerName: t('admin/common:labels.admin'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.admin')} />,
                cell: ({ row }) => row.original.admin?.username,
                width: '200px',
            },
            {
                accessorFn: (row) => row.content_key,
                id: 'content_key',
                headerName: t('common:labels.content'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.content')} />,
                cell: ({ row }) => {
                    const rawParams = row.original.content_params || {};
                    const translatedParams = Object.fromEntries(
                        Object.entries(rawParams).map(([key, value]) => {
                            if (typeof value === 'string') {
                                if (value.includes(',')) {
                                    const parts = value
                                        .split(',')
                                        .map((v) => v.trim())
                                        .filter(Boolean);
                                    const translatedParts = parts.map((v) => {
                                        const translated = t(v);
                                        return `<strong class="text-primary">${translated.replace(/_/g, '-')}</strong>`;
                                    });
                                    return [key, translatedParts.join(' - ')];
                                }
                                return [key, `<strong class="text-primary">${t(value.replace(/_/g, '-'))}</strong>`];
                            }
                            return [key, `<strong class="text-primary">${t(value)}</strong>`];
                        }),
                    );
                    return toHTML(t(row.original.content_key, translatedParams));
                },

                enableSorting: false,
            },
            {
                accessorFn: (row) => row.updated_columns,
                id: 'updated_columns',
                headerName: t('admin/common:labels.updated-columns'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.updated-columns')} />,
                cell: ({ row }) => {
                    const rawParams = row.original.updated_columns || {};
                    const data = typeof rawParams === 'string' ? JSON.parse(rawParams) : rawParams;
                    return (
                        <ol className="list-disc space-y-1 pl-4">
                            {Object.entries(data).map(([key, value]) => {
                                const fromValue = value?.from !== undefined ? value.from : '-';
                                const toValue = value?.to !== undefined ? value.to : '-';
                                return (
                                    <li key={key} className="text-primary">
                                        <div className="grid grid-cols-[200px_1fr] gap-1">
                                            <div className="text-primary font-medium">{key}</div>
                                            <div className="">
                                                : <span className="text-destructive">{fromValue}</span> →{' '}
                                                <span className="text-green-600">{toValue}</span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    );
                },
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.ip_address,
                id: 'ip_address',
                headerName: t('common:labels.ip-address'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.ip-address')} />,
                cell: (info) => info.getValue(),
                width: '170px',
            },
            {
                accessorFn: (row) => row.user_agent,
                id: 'user_agent',
                headerName: t('common:labels.user-agent'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.user-agent')} />,
                cell: (info) => info.getValue(),
                width: '170px',
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
                label: t('admin/common:labels.admin'),
                column: 'admin_id',
                options: pageProps?.admins?.filters || [],
            },
            // {
            //     column_filter: true,
            //     label: t('common:labels.type'),
            //     column: 'type',
            //     options: paymentMethodTypeOptions,
            // },
        ],
        [i18n.language, pageProps?.admins?.filters],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.logs'), t('common:labels.activity'), t('admin/common:labels.admin'))}
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
                        title: t('admin/common:labels.admin'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.activity'),
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
                        rowSelectionActions={[]}
                        onChange={fetchData}
                        isLoading={isLoading}
                        additionalButton={[]}
                    />
                </Deferred>
            </AppLayout>
        </>
    );
}
