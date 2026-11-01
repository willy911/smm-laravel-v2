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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, config, formatDate, toHTML } from '@/lib/utils';
import { Deferred } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon, EyeIcon, StarIcon } from 'hugeicons-react';
import { CheckCircle, XCircleIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const reviewStatuses = {
    0: {
        label: 'Tidak Ditampilkan',
        variant: 'warning',
        textColor: 'text-amber-600',
    },
    1: {
        label: 'Ditampilkan',
        variant: 'success',
        textColor: 'text-green-600',
    },
};

const reviewReadStatuses = {
    0: {
        label: 'Belum Dibaca',
        variant: 'warning',
        textColor: 'text-amber-600',
    },
    1: {
        label: 'Sudah Dibaca',
        variant: 'info',
        textColor: 'text-blue-500',
    },
};

export default function Index({ pageProps }) {
    const { t, i18n } = useTranslation(['orders', 'admin/orders', 'admin/common']);
    const [tableData, setTableData] = useState([]);
    const tableStateRef = useRef({});
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
            created_at: false,
            updated_at: false,
            service_id: false,
            message: false,
            is_read_admin: false,
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSwitch = useCallback(
        async (selectedIds, columnName, columnValue) => {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    route('admin.orders.reviews.switch', {
                        columnName,
                        columnValue,
                    }),
                    {
                        id: selectedIds,
                    },
                );
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message),
                });
                fetchData(tableStateRef.current);
            } catch (error) {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [fetchData],
    );

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
                accessorFn: (row) => row.user_id,
                id: 'user_id',
                headerName: t('common:labels.user'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.user')} />,
                cell: ({ row }) => row.original.user?.username,
            },
            {
                accessorKey: 'service_id',
                headerName: t('common:labels.service'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.service')} />,
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
                                    {row.original.service?.name ?? row.original.service_name}
                                </span>
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'order_id',
                headerName: t('common:labels.order-id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.order-id')} />,
                cell: ({ row }) => row.original.order_id,
                width: '32px',
            },
            {
                accessorKey: 'rating',
                headerName: 'Penilaian',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Penilaian" />,
                cell: ({ row }) => {
                    const rating = Number(row.original.rating);
                    return (
                        <div className="flex items-center gap-1.5">
                            <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{rating}</span>
                        </div>
                    );
                },
                width: '80px',
            },
            {
                accessorKey: 'message',
                headerName: t('common:labels.message'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.message')} />,
                cell: ({ row }) => (
                    <div className="grid">
                        <span className="block max-h-[24px] overflow-hidden transition-all duration-500 hover:max-h-[200px] sm:max-w-lg">
                            <span
                                className="block overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {row.original.message ?? '-'}
                            </span>
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                headerName: t('common:labels.status'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant={reviewStatuses[row.original.status]?.variant ?? 'outline'} className={cn('flex h-6')}>
                                {reviewStatuses[row.original.status]?.label ?? row.original.status}
                            </Button>
                        </div>
                    );
                },
                width: '120px',
            },
            {
                accessorKey: 'is_read_admin',
                headerName: 'Dibaca',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Dibaca" />,
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                variant={reviewReadStatuses[row.original.is_read_admin]?.variant ?? 'outline'}
                                className={cn('flex h-6')}
                            >
                                {reviewReadStatuses[row.original.is_read_admin]?.label ?? row.original.is_read_admin}
                            </Button>
                        </div>
                    );
                },
                width: '120px',
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-center gap-2">
                        <TooltipProvider delayDuration={0}>
                            {row.original.status === '0' && (
                                <Tooltip>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="success" className="size-6">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent isBlur>
                                            <AlertDialogHeader className="text-left">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-green-100 p-1.5 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900/40">
                                                        <CheckCircle />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <AlertDialogTitle className="text-base">Tampilkan Ulasan?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-sm">
                                                            Ulasan dengan ID <b>{row.original.id}</b> akan ditampilkan (disetujui).
                                                        </AlertDialogDescription>
                                                    </div>
                                                </div>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-4">
                                                <AlertDialogCancel>Batalkan</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleSwitch([row.original.id], 'status', '1')}>
                                                    Ya, Tampilkan!
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <TooltipContent
                                        className="bg-green-500 hover:bg-green-500/90"
                                        arrowClassName="bg-green-500 fill-green-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>Tampilkan</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {row.original.status === '1' && (
                                <Tooltip>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="warning" className="size-6">
                                                    <XCircleIcon className="h-4 w-4" />
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
                                                        <AlertDialogTitle className="text-base">Sembunyikan Ulasan?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-sm">
                                                            Ulasan dengan ID <b>{row.original.id}</b> akan disembunyikan.
                                                        </AlertDialogDescription>
                                                    </div>
                                                </div>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-4">
                                                <AlertDialogCancel>Batalkan</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleSwitch([row.original.id], 'status', '0')}>
                                                    Ya, Sembunyikan!
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <TooltipContent
                                        className="bg-amber-500 hover:bg-amber-500/90"
                                        arrowClassName="bg-amber-500 fill-amber-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>Sembunyikan</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {row.original.is_read_admin === '0' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="info"
                                            className="size-6"
                                            onClick={() => handleSwitch([row.original.id], 'is_read_admin', '1')}
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="bg-blue-500 hover:bg-blue-500/90"
                                        arrowClassName="bg-blue-500 fill-blue-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>Tandai Sudah Dibaca</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </TooltipProvider>
                    </div>
                ),
                width: '120px',
            },
        ],
        [i18n.language, handleSwitch],
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
                label: t('common:labels.service'),
                column: 'service_id',
                options: pageProps?.services || [],
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: [
                    { value: '0', label: 'Tidak Ditampilkan' },
                    { value: '1', label: 'Ditampilkan' },
                ],
            },
            {
                column_filter: true,
                label: 'Dibaca',
                column: 'is_read_admin',
                options: [
                    { value: '0', label: 'Belum Dibaca' },
                    { value: '1', label: 'Sudah Dibaca' },
                ],
            },
        ],
        [i18n.language, pageProps?.users, pageProps?.services],
    );

    const rowSelectionActions = useMemo(
        () => [
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.id'),
                }),
                type: 'copy',
            },
            {
                label: <span className="text-green-600">Tampilkan Ulasan</span>,
                type: 'review-approve',
                onClick: (selectedIds) => handleSwitch(selectedIds, 'status', '1'),
            },
            {
                label: <span className="text-amber-600">Sembunyikan Ulasan</span>,
                type: 'review-hide',
                onClick: (selectedIds) => handleSwitch(selectedIds, 'status', '0'),
            },
            {
                label: 'Tandai Sudah Dibaca',
                type: 'review-read',
                onClick: (selectedIds) => handleSwitch(selectedIds, 'is_read_admin', '1'),
            },
        ],
        [i18n.language, handleSwitch],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn('Daftar', 'Ulasan')}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: 'Pesanan',
                        href: '/',
                    },
                    {
                        title: 'Ulasan',
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
