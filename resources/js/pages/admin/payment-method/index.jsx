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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { paymentMethodPaymentGatewayOptions, paymentMethodTypeOptions } from '@/enums/payment-method';
import { userStatuses, userStatusOptions } from '@/enums/user';
import usePermissions from '@/hooks/use-permissions';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AddCircleIcon,
    Alert01Icon,
    ArrowDown01Icon,
    Delete02Icon,
    Delete04Icon,
    FileEditIcon,
    RestoreBinIcon,
    SortByDown01Icon,
} from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Form from './form';
import Sort from './sort';

const RowExpander = ({ row, t }) => (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className={cn('h-auto p-0')} onClick={() => row.toggleExpanded()}>
                    {row.getIsExpanded() ? <ChevronDownIcon className="text-destructive" /> : <ChevronRightIcon className="text-primary" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{row.getIsExpanded() ? t('common:tooltips.close-detail') : t('common:tooltips.open-detail')}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const RowSelector = ({ table, row }) => (
    <>
        {table && (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        )}
        {row && (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        )}
    </>
);

const PaymentMethodTypeDropdown = ({ row, paymentMethodTypeOptions, handleSwitch, t }) => {
    const currentGroup = paymentMethodTypeOptions.find((item) => item.value == row.original.type);
    const { hasRole } = usePermissions();

    if (row.original.deleted_at || !hasRole('payment_method.update')) {
        return (
            <Button size="sm" variant="outline" className={cn('focus-visible:ring-none flex h-6 focus-visible:outline-none')}>
                {currentGroup?.label}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className={cn('focus-visible:ring-none flex h-6 focus-visible:outline-none')}>
                    {currentGroup?.label}
                    <ArrowDown01Icon className="-mr-1 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dropdown-menu-content" align="end">
                <DropdownMenuLabel>
                    {t('admin/common:actions.edit-item', {
                        item: t('common:labels.type'),
                    })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {paymentMethodTypeOptions
                    ?.filter((item) => item.value != row.original.type)
                    .map((item) => (
                        <DropdownMenuItem key={item.value} onClick={() => handleSwitch([row.original.id], 'type', item.value)}>
                            <Trans
                                i18nKey="admin/common:actions.mark-item-as"
                                values={{ as: item.label }}
                                components={{ item: <span className="-ml-[5px]" /> }}
                            />
                        </DropdownMenuItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const StatusDropdown = ({ row, handleSwitch, t }) => {
    const currentStatus = userStatuses[row.original.status];
    const { hasRole } = usePermissions();

    if (row.original.deleted_at || !hasRole('payment_method.update')) {
        return (
            <Button size="sm" variant={currentStatus.variant} className={cn('focus-visible:ring-none flex h-6 focus-visible:outline-none')}>
                <currentStatus.icon />
                {t(currentStatus.label)}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant={currentStatus.variant} className={cn('focus-visible:ring-none flex h-6 focus-visible:outline-none')}>
                    <currentStatus.icon />
                    {t(currentStatus.label)}
                    <ArrowDown01Icon className="-mr-1 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dropdown-menu-content" align="end">
                <DropdownMenuLabel>
                    {t('admin/common:actions.edit-item', {
                        item: t('common:labels.status'),
                    })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userStatusOptions
                    .filter((item) => item.value != row.original.status)
                    .map((item) => {
                        const statusDef = userStatuses[item.value];
                        return (
                            <DropdownMenuItem key={item.value} onClick={() => handleSwitch([row.original.id], 'status', item.value)}>
                                <statusDef.icon className={cn('h-4 w-4', userStatuses[item.value].textColor)} />
                                <Trans
                                    i18nKey="admin/common:actions.mark-item-as"
                                    values={{ as: t(item.label) }}
                                    components={{ item: <span className={cn('-ml-[5px]', statusDef.textColor)} /> }}
                                />
                            </DropdownMenuItem>
                        );
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const ActionButtons = ({ row, setTarget, setIsCreateDialogOpened, handleAction, t }) => {
    const { hasRole } = usePermissions();
    if (!row.original.deleted_at && (hasRole('payment_method.update') || hasRole('payment_method.delete'))) {
        return (
            <TooltipProvider delayDuration={0}>
                {hasRole('payment_method.update') && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                className="size-6"
                                onClick={() => {
                                    setTarget(row.original);
                                    setIsCreateDialogOpened(true);
                                }}
                            >
                                <FileEditIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary hover:bg-primary/90">
                            <p>
                                {t('admin/common:actions.edit-item', {
                                    item: null,
                                })}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                )}
                {hasRole('payment_method.delete') && (
                    <Tooltip>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="warning" className="size-6">
                                        <Delete02Icon className="h-4 w-4" />
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
                                            <AlertDialogTitle className="text-base">{t('admin/common:dialog.trash.title')}</AlertDialogTitle>
                                            <AlertDialogDescription className="text-sm">
                                                {toHTML(
                                                    t('admin/common:dialog.trash.description', {
                                                        item: t('common:labels.payment-method'),
                                                        value: row.original.name,
                                                    }),
                                                )}
                                            </AlertDialogDescription>
                                        </div>
                                    </div>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel>{t('admin/common:dialog.trash.cancel-button')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAction('trash', [row.original.id])}>
                                        {t('admin/common:dialog.trash.confirm-button')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <TooltipContent
                            className="bg-amber-500 hover:bg-amber-500/90"
                            arrowClassName="bg-amber-500 fill-amber-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                        >
                            <p>{t('admin/common:actions.trash')}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        );
    }

    if (row.original.deleted_at && hasRole('payment_method.delete')) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="success" className="size-6">
                                    <RestoreBinIcon className="h-4 w-4" />
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
                                        <AlertDialogTitle className="text-base">{t('admin/common:dialog.restore.title')}</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm">
                                            {toHTML(
                                                t('admin/common:dialog.restore.description', {
                                                    item: t('common:labels.payment-method'),
                                                    value: row.original.name,
                                                }),
                                            )}
                                        </AlertDialogDescription>
                                    </div>
                                </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                                <AlertDialogCancel>{t('admin/common:dialog.restore.cancel-button')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleAction('restore', [row.original.id])}>
                                    {t('admin/common:dialog.restore.confirm-button')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <TooltipContent
                        className="bg-green-500 hover:bg-green-500/90"
                        arrowClassName="bg-green-500 fill-green-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                    >
                        <p>{t('admin/common:actions.restore')}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="destructive" className="size-6">
                                    <Delete04Icon className="h-4 w-4" />
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
                                        <AlertDialogTitle className="text-base">{t('admin/common:dialog.destroy.title')}</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm">
                                            {toHTML(
                                                t('admin/common:dialog.destroy.description', {
                                                    item: t('common:labels.payment-method'),
                                                    value: row.original.name,
                                                }),
                                            )}
                                        </AlertDialogDescription>
                                    </div>
                                </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                                <AlertDialogCancel>{t('admin/common:dialog.destroy.cancel-button')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleAction('destroy', [row.original.id])}>
                                    {t('admin/common:dialog.destroy.confirm-button')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <TooltipContent
                        className="bg-red-500 hover:bg-red-500/90"
                        arrowClassName="bg-red-500 fill-red-500 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                    >
                        <p>{t('admin/common:actions.destroy')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
};

const BulkActionDialog = ({ bulkActionDialog, setBulkActionDialog, closeBulkActionDialog, t }) => (
    <AlertDialog open={bulkActionDialog.isOpen} onOpenChange={setBulkActionDialog}>
        <AlertDialogContent isBlur>
            <AlertDialogHeader className="text-left">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-amber-100 p-1.5 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-900/40">
                        <Alert01Icon />
                    </div>
                    <div className="space-y-1">
                        <AlertDialogTitle className="text-base">
                            {bulkActionDialog.actionType === 'trash' && t('admin/common:dialog.trash.title')}
                            {bulkActionDialog.actionType === 'restore' && t('admin/common:dialog.restore.title')}
                            {bulkActionDialog.actionType === 'destroy' && t('admin/common:dialog.destroy.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            {bulkActionDialog.actionType === 'trash' &&
                                toHTML(
                                    t('admin/common:dialog.trash.description', {
                                        item: t('common:labels.payment-method'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.payment-method')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'restore' &&
                                toHTML(
                                    t('admin/common:dialog.restore.description', {
                                        item: t('common:labels.payment-method'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.payment-method')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'destroy' &&
                                toHTML(
                                    t('admin/common:dialog.destroy.description', {
                                        item: t('common:labels.payment-method'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.payment-method')}`,
                                    }),
                                )}
                        </AlertDialogDescription>
                    </div>
                </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel onClick={closeBulkActionDialog}>
                    {bulkActionDialog.actionType === 'trash' && t('admin/common:dialog.trash.cancel-button')}
                    {bulkActionDialog.actionType === 'restore' && t('admin/common:dialog.restore.cancel-button')}
                    {bulkActionDialog.actionType === 'destroy' && t('admin/common:dialog.destroy.cancel-button')}
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => {
                        if (bulkActionDialog.action) {
                            bulkActionDialog.action();
                        }
                        closeBulkActionDialog();
                    }}
                >
                    {bulkActionDialog.actionType === 'trash' && t('admin/common:dialog.trash.confirm-button')}
                    {bulkActionDialog.actionType === 'restore' && t('admin/common:dialog.restore.confirm-button')}
                    {bulkActionDialog.actionType === 'destroy' && t('admin/common:dialog.destroy.confirm-button')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default function Index({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['admin/common', 'admin/payment-methods']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const { hasRole } = usePermissions();

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
        updated_at: {
            start: null,
            end: null,
        },
        deleted_at: {
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
                sort_number: false,
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

    const handleSwitch = useCallback(
        async (selectedIds, columnName, columnValue) => {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    route('admin.payment-methods.switch', {
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

    const handleAction = useCallback(
        async (action, selectedIds) => {
            try {
                setIsLoading(true);
                const response = await axios.post(route('admin.payment-methods.action', { action }), {
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

    const handleBulkActionDialog = useCallback(
        (actionType, selectedIds) => {
            setBulkActionDialog({
                isOpen: true,
                action: () => handleAction(actionType, selectedIds),
                selectedIds,
                actionType,
            });
        },
        [handleAction],
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
                id: 'expander',
                header: () => null,
                cell: ({ row }) => <RowExpander row={row} t={t} />,
                enableSorting: false,
                enableHiding: false,
                width: '32px',
            },
            {
                id: 'select',
                header: ({ table }) => <RowSelector table={table} />,
                cell: ({ row }) => <RowSelector row={row} />,
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
                accessorKey: 'sort_number',
                headerName: t('common:labels.sort-number'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.sort-number')} />,
                cell: ({ row }) => row.getValue('sort_number'),
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
                accessorFn: (row) => row.deleted_at,
                id: 'deleted_at',
                headerName: t('common:labels.deleted-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.deleted-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.deleted_at,
                    }),
                width: '170px',
            },
            {
                accessorFn: (row) => row.payment_gateway,
                id: 'payment_gateway',
                headerName: t('admin/payment-methods:labels.payment-gateway'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/payment-methods:labels.payment-gateway')} />,
                cell: ({ row }) => paymentMethodPaymentGatewayOptions.find((item) => item.value == row.original.payment_gateway)?.label ?? null,
            },
            {
                accessorFn: (row) => row.type,
                id: 'type',
                headerName: t('common:labels.type'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.type')} />,
                cell: ({ row }) => (
                    <PaymentMethodTypeDropdown row={row} paymentMethodTypeOptions={paymentMethodTypeOptions} handleSwitch={handleSwitch} t={t} />
                ),
            },
            {
                accessorFn: (row) => row.name,
                id: 'name',
                headerName: t('common:labels.name'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.name')} />,
                cell: ({ row }) => row.original.name,
            },
            {
                accessorFn: (row) => row.minimum,
                id: 'minimum',
                headerName: t('admin/payment-methods:labels.min-and-max-payment'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/payment-methods:labels.min-and-max-payment')} />,
                cell: ({ row }) => `${formatCurrency(row.original.minimum)} & ${formatCurrency(row.original.maximum)}`,
            },
            {
                accessorFn: (row) => row.admin_fee_configs,
                id: 'admin_fee_configs',
                headerName: t('common:labels.admin-fee'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.admin-fee')} />,
                // cell: ({ row }) => row.original.admin_fee_configs,
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.admin_fee_configs.type == 'fixed'
                                ? formatCurrency(row.original.admin_fee_configs.value)
                                : cn(formatAmount(row.original.admin_fee_configs.value), '%')}
                        </>
                    );
                },
            },
            {
                accessorFn: (row) => row.status,
                id: 'status',
                headerName: t('common:labels.status'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => <StatusDropdown row={row} handleSwitch={handleSwitch} t={t} />,
                width: '100px',
            },
            {
                id: 'actions',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Aksi" />,
                cell: ({ row }) => (
                    <div className="flex flex-grow items-center justify-center gap-2 align-middle">
                        <ActionButtons
                            row={row}
                            setTarget={setTarget}
                            setIsCreateDialogOpened={setIsCreateDialogOpened}
                            handleAction={handleAction}
                            t={t}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
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
                column_filter: false,
                type: 'daterange',
                label: t('common:labels.deleted-at'),
                from: 'deleted_at.start',
                to: 'deleted_at.end',
            },
            {
                column_filter: true,
                label: t('common:labels.type'),
                column: 'type',
                options: paymentMethodTypeOptions,
            },
            {
                column_filter: true,
                label: t('admin/payment-methods:labels.payment-gateway'),
                column: 'payment_gateway',
                options: paymentMethodPaymentGatewayOptions,
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: userStatusOptions,
            },
        ],
        [i18n.language],
    );

    const rowSelectionActions = useMemo(
        () => [
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.id'),
                }),
                type: 'copy',
            },
            ...(hasRole('payment_method.update')
                ? [
                      {
                          label: (
                              <Trans
                                  i18nKey="admin/common:actions.mark-item-as"
                                  values={{ as: t('admin/common:status.active') }}
                                  components={{ item: <span className={cn('-ml-[5px]', userStatuses[1].textColor)} /> }}
                              />
                          ),
                          type: 'mark_item_as_active',
                          onClick: (selectedIds) => handleSwitch(selectedIds, 'status', 1),
                      },
                      {
                          label: (
                              <Trans
                                  i18nKey="admin/common:actions.mark-item-as"
                                  values={{ as: t('admin/common:status.inactive') }}
                                  components={{ item: <span className={cn('-ml-[5px]', userStatuses[0].textColor)} /> }}
                              />
                          ),
                          type: 'mark_item_as_inactive',
                          onClick: (selectedIds) => handleSwitch(selectedIds, 'status', 0),
                      },
                  ]
                : []),
            ...(hasRole('payment_method.delete')
                ? [
                      {
                          label: <span className="text-amber-500">{t('admin/common:actions.trash')}</span>,
                          type: 'trash',
                          onClick: (selectedIds) => handleBulkActionDialog('trash', selectedIds),
                      },

                      {
                          label: <span className="text-green-500">{t('admin/common:actions.restore')}</span>,
                          type: 'restore',
                          onClick: (selectedIds) => handleBulkActionDialog('restore', selectedIds),
                      },

                      {
                          label: <span className="text-red-500">{t('admin/common:actions.destroy')}</span>,
                          type: 'destroy',
                          onClick: (selectedIds) => handleBulkActionDialog('destroy', selectedIds),
                      },
                  ]
                : []),
        ],
        [i18n.language],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.payment-methods'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.payment-methods'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.list'),
                        href: '/',
                    },
                ]}
            >
                <Sort
                    pageProps={pageProps}
                    isSortDialogOpened={isSortDialogOpened}
                    setIsSortDialogOpened={setIsSortDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                />
                <Form
                    key={target?.id ? `edit-${target.id}` : 'create'}
                    pageProps={pageProps}
                    isCreateDialogOpened={isCreateDialogOpened}
                    setIsCreateDialogOpened={setIsCreateDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                    target={target}
                    setTarget={setTarget}
                />
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
                        additionalButton={
                            <div className="flex gap-2">
                                {hasRole('payment_method.create') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpened(true)}>
                                        <AddCircleIcon className="h-4 w-4" />
                                        {t('admin/common:actions.create-item', {
                                            item: t('common:labels.payment-method'),
                                        })}
                                    </Button>
                                )}
                                {hasRole('payment_method.update') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsSortDialogOpened(true)}>
                                        <SortByDown01Icon className="h-4 w-4" />
                                        {t('admin/common:actions.sort-item', {
                                            item: t('common:labels.payment-method'),
                                        })}
                                    </Button>
                                )}
                            </div>
                        }
                    />
                </Deferred>
            </AppLayout>

            <BulkActionDialog
                bulkActionDialog={bulkActionDialog}
                setBulkActionDialog={setBulkActionDialog}
                closeBulkActionDialog={closeBulkActionDialog}
                t={t}
            />
        </>
    );
}
