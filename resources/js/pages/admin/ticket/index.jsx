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
import { ticketDepartments, ticketStatuses, ticketStatusOptions } from '@/enums/ticket';
import usePermissions from '@/hooks/use-permissions';
import { toast } from '@/hooks/use-toast';
import { cn, config, formatDate, toHTML } from '@/lib/utils';
import { Deferred, Link } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon, FileEditIcon, MailLove01Icon } from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon, XCircleIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Index({ pageProps }) {
    const { t, i18n } = useTranslation('tickets');
    const { hasRole } = usePermissions();
    const [tableData, setTableData] = useState([]);
    const tableStateRef = useRef({});
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
    const tableState = useMemo(
        () => ({
            sorting: [{ id: 'id', desc: true }],
            columnFilters: [],
            globalFilter: initialGlobalFilterState,
            columnVisibility: {
                created_at: false,
                updated_at: false,
                deleted_at: false,
                email: false,
            },
            rowSelection: {},
            pagination: { pageIndex: 0, pageSize: 10 },
            expanded: {},
        }),
        [initialGlobalFilterState],
    );
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
                accessorFn: (row) => row.user_id,
                id: 'user_id',
                headerName: t('common:labels.user'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.user')} />,
                cell: ({ row }) => row.original.user?.username,
                width: '170px',
            },
            {
                accessorFn: (row) => row.department,
                id: 'department',
                headerName: t('tickets:labels.department'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('tickets:labels.department')} />,
                cell: ({ row }) => t(ticketDepartments[row.original.department].label),
                width: '100px',
            },
            {
                accessorFn: (row) => row.subject,
                id: 'subject',
                headerName: t('tickets:labels.subject'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('tickets:labels.subject')} />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {row.original.is_read_user == '0' && <MailLove01Icon className="h-4 w-4 animate-bounce text-amber-500 duration-1000" />}
                        {row.original.subject}
                    </div>
                ),
            },
            {
                accessorFn: (row) => row.data_id,
                id: 'data_id',
                headerName: t('tickets:labels.data-id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('tickets:labels.data-id')} />,
                cell: ({ row }) => {
                    if (!row.original.data_id) return;
                    return (
                        <ul className="list-inside list-disc">
                            {row.original.data_id.split(',').map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    );
                },
            },
            {
                accessorKey: 'status',
                id: 'status',
                headerName: t('common:labels.status'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => {
                    const Icon = ticketStatuses[row.original.status].icon;
                    return (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant={ticketStatuses[row.original.status].variant} className={cn('flex h-6')}>
                                <Icon />
                                {t(ticketStatuses[row.original.status].label)}
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
                            {hasRole('ticket.update') && row.original.status !== 'closed' && (
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
                                                        <AlertDialogTitle className="text-base">
                                                            {t('admin/common:dialog.close.title')}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-sm">
                                                            {toHTML(
                                                                t('admin/common:dialog.close.description', {
                                                                    id: row.original.id,
                                                                }),
                                                            )}
                                                        </AlertDialogDescription>
                                                    </div>
                                                </div>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-4">
                                                <AlertDialogCancel>{t('admin/common:dialog.close.cancel-button')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleSwitch([row.original.id], 'status', 'closed')}>
                                                    {t('admin/common:dialog.close.confirm-button')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <TooltipContent
                                        className="bg-amber-500 hover:bg-amber-500/90"
                                        arrowClassName="bg-amber-500 fill-amber-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>{t('admin/common:actions.close')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {hasRole('ticket.update') && row.original.status !== 'closed' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={route('admin.tickets.edit', {
                                                target: row.original.id,
                                            })}
                                        >
                                            <Button size="icon" className="bg-primary hover:bg-primary/90 h-6 w-6">
                                                <FileEditIcon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-primary hover:bg-primary/90">
                                        <p>
                                            {t('common:actions.reply-item', {
                                                item: t('common:labels.ticket'),
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
                label: t('common:labels.user'),
                column: 'user_id',
                options: pageProps?.users || [],
            },
            {
                column_filter: true,
                label: t('tickets:labels.department'),
                column: 'department',
                options: pageProps?.departments || [],
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: ticketStatusOptions,
            },
        ],
        [i18n.language, pageProps?.users, pageProps?.departments],
    );

    const handleSwitch = useCallback(
        async (selectedIds, columnName, columnValue) => {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    route('admin.tickets.switch', {
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

    const handleAction = useCallback(
        async (action, selectedIds) => {
            try {
                setIsLoading(true);
                const response = await axios.post(route('admin.tickets.action', { action }), {
                    action,
                    id: selectedIds,
                });
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

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.tickets'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.tickets'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.list'),
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
                        additionalButton={[]}
                    />
                </Deferred>
            </AppLayout>
        </>
    );
}
