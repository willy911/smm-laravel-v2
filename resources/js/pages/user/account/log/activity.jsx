import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { toast } from '@/hooks/use-toast';
import { config, formatDate, toHTML } from '@/lib/utils';
import { Deferred } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Activity({ pageProps }) {
    const { t, i18n } = useTranslation(['account', 'deposits', 'tickets', 'orders']);
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
            user_agent: false,
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
                route('user.account.logs.activity', {
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
                accessorFn: (row) => row.created_at,
                id: 'created_at',
                headerName: t('common:labels.created-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.created-at')} />,
                cell: ({ row }) => formatDate({ date: row.original.created_at }),
                width: '170px',
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
            {
                accessorFn: (row) => row.content_key,
                id: 'content_key',
                headerName: t('common:labels.content'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.content')} />,
                cell: ({ row }) => toHTML(t(row.original.content_key, row.original.content_params)),
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
        ],
        [i18n.language],
    );

    return (
        <>
            <AppLayout
                pageTitle={t('common:labels.activity-logs')}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.account'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.activity-logs'),
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
                    />
                </Deferred>
            </AppLayout>
        </>
    );
}
