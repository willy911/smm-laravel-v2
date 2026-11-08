import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { orderedVia, orderedViaOptions, orderStatuses, orderStatusOptions } from '@/enums/order';
import usePermissions from '@/hooks/use-permissions';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, Loading03Icon, ShoppingBag01Icon, ViewIcon } from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Form from './form';

export default function Index({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['orders', 'admin/orders', 'admin/common']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const { hasRole } = usePermissions();
    const [tableData, setTableData] = useState([]);
    const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
    const [targets, setTargets] = useState([]);
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
    const tableState = {
        sorting: [{ id: 'id', desc: true }],
        columnFilters: [],
        globalFilter: initialGlobalFilterState,
        columnVisibility: {
            created_at: false,
            updated_at: false,
            service_id: false,
            start_count: false,
            remains: false,
            initial_balance: false,
            final_balance: false,
            ordered_via: false,
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        total: { amount: 0, count: 0 },
        pending: { amount: 0, count: 0 },
        processing: { amount: 0, count: 0 },
        completed: { amount: 0, count: 0 },
        failed: { amount: 0, count: 0 },
    });
    const fetchData = useCallback(
        async ({ pagination, columnFilters, globalFilter, sorting }) => {
            setIsLoading(true);
            setSummary({
                total: { amount: 0, count: 0 },
                pending: { amount: 0, count: 0 },
                processing: { amount: 0, count: 0 },
                completed: { amount: 0, count: 0 },
                failed: { amount: 0, count: 0 },
            });

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
                setSummary(data.summary);
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
                    route('admin.orders.switch', {
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
            },
            {
                accessorFn: (row) => row.service_provider_id,
                id: 'service_provider_id',
                headerName: t('admin/common:labels.provider'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.provider')} />,
                cell: ({ row }) => row.original.service_provider?.alias,
            },
            {
                accessorFn: (row) => row.service_provider_order_id,
                id: 'service_provider_order_id',
                headerName: t('admin/orders:labels.service-provider-order-id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/orders:labels.service-provider-order-id')} />,
                cell: ({ row }) => row.original.service_provider_order_id,
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
            },
            {
                accessorKey: 'quantity',
                headerName: t('common:labels.quantity'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.quantity')} />,
                cell: ({ row }) => formatAmount(row.original.quantity),
                width: '32px',
            },
            {
                accessorKey: 'start_count',
                headerName: t('common:labels.start-count'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.start-count')} />,
                cell: ({ row }) => formatAmount(row.original.start_count),
                width: '32px',
            },
            {
                accessorKey: 'remains',
                headerName: t('common:labels.remains'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.remains')} />,
                cell: ({ row }) => formatAmount(row.original.remains),
                width: '32px',
            },
            {
                accessorKey: 'price',
                headerName: t('common:labels.price'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.price')} />,
                cell: ({ row }) => formatCurrency(row.original.price),
                width: '32px',
            },
            {
                accessorKey: 'profit',
                headerName: t('admin/common:labels.profit-value'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.profit-value')} />,
                cell: ({ row }) => formatCurrency(row.original.profit),
                width: '32px',
            },
            {
                accessorKey: 'ordered_via',
                headerName: t('common:labels.ordered-via'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.ordered-via')} />,
                cell: ({ row }) => orderedVia[row.original.ordered_via],
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
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => {
                    const Icon = orderStatuses[row.original.status].icon;
                    const total = row.original.quantity;
                    const remains = row.original.remains;
                    const progress = ((total - remains) / total) * 100;
                    return (
                        <div className="flex flex-col gap-2">
                            {['in_progress', 'processing'].includes(row.original.status) ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="relative">
                                            <Progress variant="info" value={progress} className="h-6 rounded-md" />
                                            <span className="text-primary-foreground absolute inset-0 flex items-center justify-center text-xs font-medium">
                                                <Icon className="mr-1 size-4" />
                                                {t(orderStatuses[row.original.status].label)}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="text-primary-foreground bg-gradient-to-b from-blue-400 to-blue-500 shadow-md hover:from-blue-400 hover:to-blue-600 dark:bg-gradient-to-t dark:from-blue-400/50 dark:hover:to-blue-500/40"
                                        arrowClassName="bg-blue-500 fill-blue-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>
                                            {t('common:tooltips.remaining-of', {
                                                percent: formatAmount(Math.round(progress)),
                                                remains: formatAmount(remains),
                                                of: formatAmount(total),
                                            })}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Button size="sm" variant={orderStatuses[row.original.status].variant} className={cn('flex h-6')}>
                                    <Icon />
                                    {t(orderStatuses[row.original.status].label)}
                                </Button>
                            )}
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
                            {hasRole('order.update') &&
                            ['pending', 'processing', 'in_progress'].includes(row.original.status) &&
                            row.original.service &&
                            row.original.service.is_cancel_support ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-6 w-6"
                                            onClick={() => {
                                                if (!row.original.order_cancel_button_label_info) {
                                                    handleOrderAction([row.original.id], 'cancels');
                                                }
                                            }}
                                            disabled={row.original.order_cancel_button_label_info ? true : false}
                                            style={{
                                                pointerEvents: 'all',
                                            }}
                                        >
                                            <CancelCircleIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="bg-red-500 hover:bg-red-500/90"
                                        arrowClassName="bg-red-500 fill-red-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>
                                            {row.original.order_cancel_button_label_info
                                                ? row.original.order_cancel_button_label_info
                                                : t('common:labels.cancel')}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                ''
                            )}
                            {hasRole('order.update') &&
                            row.original.status === 'completed' &&
                            row.original.service &&
                            row.original.service.is_refill_support ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="success"
                                            className="h-6 w-6"
                                            onClick={() => {
                                                if (!row.original.order_refill_button_label_info) {
                                                    handleOrderAction([row.original.id], 'refills');
                                                }
                                            }}
                                            disabled={row.original.order_refill_button_label_info ? true : false}
                                            style={{
                                                pointerEvents: 'all',
                                            }}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="bg-green-500 hover:bg-green-500/90"
                                        arrowClassName="bg-green-500 fill-green-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                    >
                                        <p>
                                            {row.original.order_refill_button_label_info
                                                ? row.original.order_refill_button_label_info
                                                : t('common:labels.refill')}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                ''
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
                label: t('admin/common:labels.provider'),
                column: 'service_provider_id',
                options: pageProps?.serviceProviders || [],
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
                options: orderStatusOptions,
            },
            {
                column_filter: true,
                label: t('common:labels.ordered-via'),
                column: 'ordered_via',
                options: orderedViaOptions,
            },
        ],
        [i18n.language, pageProps?.users, pageProps?.serviceProviders, pageProps?.services],
    );

    const handleOrderAction = async (orderIds, action = 'refills') => {
        try {
            setIsLoading(true);
            const routeName = action === 'refills' ? 'admin.orders.refills.store' : 'admin.orders.cancels.store';
            const response = await axios.post(route(routeName), {
                order_id: orderIds,
            });
            toast({
                variant: 'success',
                description: toHTML(response.data.message),
            });
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
            {
                label: t('common:actions.copy-item', {
                    item: t('admin/orders:labels.service-provider-order-id'),
                }),
                type: 'copy',
                column: 'service_provider_order_id',
            },
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.target'),
                }),
                type: 'copy',
                column: 'target',
            },
            ...(hasRole('order.update')
                ? [
                      {
                          label: t('admin/common:actions.edit-item', {
                              item: t('common:labels.start-count'),
                          }),
                          type: 'edit-order',
                          column: 'id',
                          onClick: (selectedIds) => {
                              setIsCreateDialogOpened(true);
                              setTargets(selectedIds);
                          },
                          // selectedIds: selectedIds,
                          targets: targets,
                          setTargets: setTargets,
                          fetchData: fetchData,
                          tableStateRef: tableStateRef,
                          pageProps: pageProps,
                          isCreateDialogOpened: isCreateDialogOpened,
                          setIsCreateDialogOpened: setIsCreateDialogOpened,
                      },
                  ]
                : []),
            ...(hasRole('order.update') && orderStatusOptions
                ? orderStatusOptions.map((item) => ({
                      label: (
                          <Trans
                              i18nKey="admin/common:actions.mark-item-as"
                              values={{ as: t(item.label) }}
                              components={{ item: <span className={cn('-ml-[5px]', item.textColor)} /> }}
                          />
                      ),
                      type: `mark_item_as_status_${item.value}`,
                      onClick: (selectedIds) => handleSwitch(selectedIds, 'status', item.value),
                  }))
                : []),
            ...(hasRole('order.update')
                ? [
                      {
                          label: <span className="text-green-600">{t('common:actions.order-request.refill')}</span>,
                          type: 'refill',
                          onClick: (selectedIds) => handleOrderAction(selectedIds, 'refills'),
                      },
                      {
                          label: <span className="text-destructive">{t('common:actions.order-request.cancel')}</span>,
                          type: 'cancel',
                          onClick: (selectedIds) => handleOrderAction(selectedIds, 'cancels'),
                      },
                  ]
                : []),
        ],
        [i18n.language],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.orders'))}
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
                        title: t('common:labels.list'),
                        href: '/',
                    },
                ]}
            >
                <Form
                    key={targets?.length > 0 ? `edit-${targets.length}` : 'create'}
                    pageProps={pageProps}
                    isCreateDialogOpened={isCreateDialogOpened}
                    setIsCreateDialogOpened={setIsCreateDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                    targets={targets}
                    setTargets={setTargets}
                />
                <Deferred data="pageProps" fallback={<AppSkeleton />}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {[
                            {
                                label: t('common:summary.total'),
                                icon: <ShoppingBag01Icon className="text-primary h-6 w-6" />,
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
                                label: t('common:summary.processing'),
                                icon: <Loading03Icon className="h-6 w-6 text-blue-600" />,
                                amount: formatCurrency(summary.processing.amount),
                                count: formatAmount(summary.processing.count),
                                bg: 'bg-gradient-to-b to-0% from-blue-100 to-accent',
                                text: 'text-blue-600',
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
                                            {stat.amount} ({stat.count} {t('common:labels.orders')})
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
