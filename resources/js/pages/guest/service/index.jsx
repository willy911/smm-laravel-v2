import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, formatDuration, toHTML } from '@/lib/utils';
import { Deferred, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { HeartCheckIcon, HeartRemoveIcon, ShoppingBagAddIcon, ViewIcon } from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Index({ pageProps }) {
    const { locales, auth } = usePage().props;
    const { t, i18n } = useTranslation('services');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [serviceCategories, setServiceCategories] = useState([]);
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
            service_category_group_id: false,
            created_at: false,
            updated_at: false,
            service_category_id: false,
            type: false,
            other: false,
        },
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        expanded: {},
    };
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async ({ pagination, columnFilters, globalFilter, sorting }) => {
        if (columnFilters.length > 0) {
            columnFilters.map((columnFilter, index) => {
                if (columnFilter.id === 'service_category_group_id') {
                    setServiceCategories(pageProps?.serviceCategories.filter((item) => columnFilter.value.includes(item.service_category_group_id)));
                }
            });
        } else {
            setServiceCategories(pageProps?.serviceCategories);
        }
        setIsLoading(true);
        try {
            const response = await axios.get(
                route('guest.services.index', {
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
            setTableData(response.data.data);
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
                id: 'service_category_group_id',
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: 'other',
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: 'type',
                enableSorting: false,
                enableHiding: false,
            },
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
                cell: ({ row }) => row.original.id,
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
                accessorFn: (row) => row.updated_at,
                id: 'updated_at',
                headerName: t('common:labels.updated-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.updated-at')} />,
                cell: ({ row }) => formatDate({ date: row.original.updated_at }),
                width: '170px',
            },
            {
                accessorKey: 'service_category_id',
                headerName: t('common:labels.category'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.category')} />,
                cell: ({ row }) => {
                    return (
                        <div className="flex space-x-2">
                            <span className="max-w-48 truncate">{row.original.service_category?.name}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'name',
                headerName: t('common:labels.name'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.name')} />,
                cell: ({ row }) => {
                    return (
                        <div className="grid text-wrap">
                            {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                            <span className="">{row.original.name}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'price',
                headerName: t('common:labels.price'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.price')} />,
                cell: ({ row }) => formatCurrency(row.original.price),
                width: '32px',
            },
            {
                accessorKey: 'min',
                headerName: t('common:labels.minimum'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.minimum')} />,
                cell: ({ row }) => formatAmount(row.original.min),
                width: '32px',
            },
            {
                accessorKey: 'max',
                headerName: t('common:labels.maximum'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.maximum')} />,
                cell: ({ row }) => formatAmount(row.original.max),
                width: '32px',
            },
            {
                accessorKey: 'avg',
                headerName: t('common:labels.average-time'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.average-time')} />,
                cell: ({ row }) => (
                    <>
                        {!row.original.avg_time ? (
                            <span className="text-destructive">{t('common:empty.no-data-yet')}</span>
                        ) : (
                            <>
                                <span className="text-primary font-medium">{formatDuration(row.original.avg_time)}</span>
                            </>
                        )}
                    </>
                ),
                enableSorting: false,
                width: '150px',
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
                            {auth.user && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="success"
                                                className="h-6 w-6"
                                                onClick={() => {
                                                    router.visit(
                                                        route('user.orders.create', {
                                                            target: row.original.id,
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
                                    {row.original.is_favorite ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        handleServiceFavorites('remove', [row.original.id]);
                                                    }}
                                                >
                                                    <HeartRemoveIcon className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                className="bg-red-500 hover:bg-red-500/90"
                                                arrowClassName="bg-red-500 fill-red-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                            >
                                                <p>{t('common:actions.service-favorite.remove')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    className="h-6 w-6 bg-green-500 hover:bg-green-500/90"
                                                    onClick={() => {
                                                        handleServiceFavorites('add', [row.original.id]);
                                                    }}
                                                >
                                                    <HeartCheckIcon className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                className="bg-green-500 hover:bg-green-500/90"
                                                arrowClassName="bg-green-500 fill-green-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                                            >
                                                <p>{t('common:actions.service-favorite.add')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </>
                            )}
                        </TooltipProvider>
                    </div>
                ),
                width: '100px',
            },
            // {
            //     id: 'actions',
            //     cell: ({ row }) => (
            //         <TooltipProvider>
            //             <DropdownMenu>
            //                 <Tooltip>
            //                     <TooltipTrigger asChild>
            //                         <DropdownMenuTrigger asChild>
            //                             <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
            //                                 <MoreHorizontal className="text-primary" />
            //                                 <span className="sr-only">Open menu</span>
            //                             </Button>
            //                         </DropdownMenuTrigger>
            //                     </TooltipTrigger>
            //                     <TooltipContent>Aksi</TooltipContent>
            //                 </Tooltip>
            //                 <DropdownMenuContent align="end">
            //                     <DropdownMenuItem className="text-primary focus:text-primary items-center" onClick={() => row.toggleExpanded()}>
            //                         <ViewIcon className="text-primary" />
            //                         Detail
            //                     </DropdownMenuItem>
            //                     {auth.user && (
            //                         <>
            //                             <DropdownMenuItem
            //                                 className="items-center text-green-500 focus:text-green-500"
            //                                 onClick={() =>
            //                                     router.visit(
            //                                         route('user.orders.create', {
            //                                             target: row.original.id,
            //                                         }),
            //                                     )
            //                                 }
            //                             >
            //                                 <ShoppingBagAddIcon className="text-green-500" />
            //                                 Buat Pesanan
            //                             </DropdownMenuItem>
            //                             {row.original.is_favorite ? (
            //                                 <DropdownMenuItem
            //                                     className="text-destructive focus:text-destructive items-center"
            //                                     onClick={() => handleServiceFavorites('remove', [row.original.id])}
            //                                 >
            //                                     <HeartRemoveIcon className="text-destructive" />
            //                                     Hapus dari Favorit
            //                                 </DropdownMenuItem>
            //                             ) : (
            //                                 <DropdownMenuItem
            //                                     className="items-center text-green-500 focus:text-green-500"
            //                                     onClick={() => handleServiceFavorites('add', [row.original.id])}
            //                                 >
            //                                     <HeartCheckIcon className="text-green-500" />
            //                                     Tambahkan ke Favorit
            //                                 </DropdownMenuItem>
            //                             )}
            //                         </>
            //                     )}
            //                 </DropdownMenuContent>
            //             </DropdownMenu>
            //         </TooltipProvider>
            //     ),
            // },
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
                label: t('common:labels.category'),
                column: 'service_category_id',
                options: pageProps?.serviceCategories?.filters || [],
            },
            {
                column_filter: true,
                label: t('common:labels.type'),
                column: 'type',
                options: pageProps?.serviceTypes || [],
            },
            {
                column_filter: true,
                label: t('common:labels.others'),
                column: 'other',
                options: (pageProps?.others || []).filter(Boolean),
            },
        ],
        [i18n.language, pageProps?.serviceCategories, serviceCategories, pageProps?.serviceTypes, pageProps?.others],
    );

    const handleServiceFavorites = async (type, serviceIds) => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                route('ajax.services.favorite', {
                    type,
                }),
                {
                    service_id: serviceIds,
                },
            );
            setTableData((prevData) => ({
                ...prevData,
                data: prevData.data.map((item) => (serviceIds.includes(item.id) ? { ...item, is_favorite: type === 'add' } : item)),
            }));
            toast({
                variant: 'success',
                description: toHTML(response.data.message),
            });
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
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
                label: t('common:actions.service-favorite.add'),
                type: 'favorite_add',
                onClick: (selectedIds) => handleServiceFavorites('add', selectedIds),
            },
            {
                label: t('common:actions.service-favorite.remove'),
                type: 'favorite_remove',
                onClick: (selectedIds) => handleServiceFavorites('remove', selectedIds),
            },
        ],
        [i18n.language],
    );

    useEffect(() => {
        setServiceCategories(pageProps?.serviceCategories);
    }, [pageProps?.serviceCategories]);

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.services'))}
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
                    />
                </Deferred>
            </AppLayout>
        </>
    );
}
