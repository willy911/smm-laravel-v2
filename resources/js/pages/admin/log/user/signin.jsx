import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Signin({ pageProps }) {
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
                accessorFn: (row) => row.user_id,
                id: 'user_id',
                headerName: t('common:labels.user'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.user')} />,
                cell: ({ row }) => row.original.user?.username,
                width: '200px',
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
                label: t('common:labels.user'),
                column: 'user_id',
                options: pageProps?.users?.filters || [],
            },
            // {
            //     column_filter: true,
            //     label: t('common:labels.type'),
            //     column: 'type',
            //     options: paymentMethodTypeOptions,
            // },
        ],
        [i18n.language, pageProps?.users?.filters],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.logs'), t('common:labels.signin'), t('common:labels.user'))}
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
                        title: t('common:labels.signin'),
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
