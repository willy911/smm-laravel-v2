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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    CancelCircleIcon,
    CheckmarkCircle01Icon,
    Delete02Icon,
    Delete04Icon,
    FileEditIcon,
    RestoreBinIcon,
    UserAccountIcon,
} from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, ChevronsUpDown, MinusCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Form from './form';

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

const UserGroupDropdown = ({ row, userGroups, handleSwitch, t }) => {
    const currentGroup = userGroups?.options?.find((item) => item.value == row.original.user_group_id);
    const { hasRole } = usePermissions();

    if (row.original.deleted_at || !hasRole('user.update')) {
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
                        item: t('common:labels.group'),
                    })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userGroups?.options
                    ?.filter((item) => item.value != row.original.user_group_id)
                    .map((item) => (
                        <DropdownMenuItem key={item.value} onClick={() => handleSwitch([row.original.id], 'user_group_id', item.value)}>
                            <Trans
                                i18nKey="admin/common:actions.mark-item-as"
                                values={{ as: item.label }}
                                components={{ item: <span className="text-primary -ml-[5px]" /> }}
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

    if (row.original.deleted_at || !hasRole('user.update')) {
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
    if (!row.original.deleted_at && (hasRole('user.update') || hasRole('user.delete'))) {
        return (
            <TooltipProvider delayDuration={0}>
                {hasRole('user.update') && (
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
                {hasRole('user.delete') && (
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
                                                        item: t('common:labels.user'),
                                                        value: row.original.full_name,
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

    if (row.original.deleted_at && hasRole('user.delete')) {
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
                                                    item: t('common:labels.user'),
                                                    value: row.original.full_name,
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
                                                    item: t('common:labels.user'),
                                                    value: row.original.full_name,
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

const SummaryCards = ({ summary, formatCurrency, formatAmount, t }) => {
    const summaryData = [
        {
            label: t('common:summary.total'),
            icon: <UserAccountIcon className="text-primary h-6 w-6" />,
            amount: formatCurrency(summary.total.amount),
            count: formatAmount(summary.total.count),
            bg: 'bg-gradient-to-b to-0% from-primary to-accent',
            text: 'text-primary',
        },
        {
            label: t('common:summary.active'),
            icon: <CheckmarkCircle01Icon className="h-6 w-6 text-green-600" />,
            amount: formatCurrency(summary.active.amount),
            count: formatAmount(summary.active.count),
            bg: 'bg-gradient-to-b to-0% from-green-100 to-accent',
            text: 'text-green-600',
        },
        {
            label: t('common:summary.inactive'),
            icon: <CancelCircleIcon className="h-6 w-6 text-red-600" />,
            amount: formatCurrency(summary.inactive.amount),
            count: formatAmount(summary.inactive.count),
            bg: 'bg-gradient-to-b to-0% from-red-100 to-accent',
            text: 'text-red-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {summaryData.map((stat, index) => (
                <div key={index} className={cn(`flex items-center justify-between rounded-xl p-4 shadow-sm ${stat.bg}`)}>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-transparent p-2 shadow-inner">{stat.icon}</div>
                        <div>
                            <div className={cn('text-sm font-semibold', stat.text)}>{stat.label}</div>
                            <div className={cn('text-xs', stat.text)}>
                                {stat.amount} ({stat.count} {t('common:labels.users')})
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
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
                                        item: t('common:labels.user'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.user')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'restore' &&
                                toHTML(
                                    t('admin/common:dialog.restore.description', {
                                        item: t('common:labels.user'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.user')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'destroy' &&
                                toHTML(
                                    t('admin/common:dialog.destroy.description', {
                                        item: t('common:labels.user'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.user')}`,
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
    const { t, i18n } = useTranslation(['admin/common', 'admin/users']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const { hasRole } = usePermissions();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
    const [target, setTarget] = useState({});
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        total: { amount: 0, count: 0 },
        active: { amount: 0, count: 0 },
        inactive: { amount: 0, count: 0 },
    });
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
                referred_by: false,
                referral_code: false,
                total_referrals: false,
                email: false,
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
            setSummary({
                total: { amount: 0, count: 0 },
                active: { amount: 0, count: 0 },
                inactive: { amount: 0, count: 0 },
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
                    route('admin.users.switch', {
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
                const response = await axios.post(route('admin.users.action', { action }), {
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
                accessorFn: (row) => row.user_group_id,
                id: 'user_group_id',
                headerName: t('common:labels.group'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.group')} />,
                cell: ({ row }) => <UserGroupDropdown row={row} userGroups={pageProps?.userGroups} handleSwitch={handleSwitch} t={t} />,
            },
            {
                accessorFn: (row) => row.username,
                id: 'username',
                headerName: t('common:labels.username'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.username')} />,
                cell: ({ row }) => row.original.username,
            },
            {
                accessorFn: (row) => row.full_name,
                id: 'full_name',
                headerName: t('common:labels.full-name'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.full-name')} />,
                cell: ({ row }) => row.original.full_name,
            },
            {
                accessorFn: (row) => row.email,
                id: 'email',
                headerName: t('common:labels.email'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.email')} />,
                cell: ({ row }) => (
                    <div className="flex items-center space-x-1">
                        {row.original.email_verified_at ? (
                            <CheckmarkCircle01Icon className="h-4 w-4 rounded-2xl bg-green-500 text-white" />
                        ) : (
                            <CancelCircleIcon className="h-4 w-4 rounded-2xl bg-red-500 text-white" />
                        )}
                        <span>{row.original.email}</span>
                    </div>
                ),
            },
            {
                accessorFn: (row) => row.whatsapp,
                id: 'whatsapp',
                headerName: t('common:labels.whatsapp'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.whatsapp')} />,
                cell: ({ row }) => (
                    <div className="flex items-center space-x-1">
                        {row.original.whatsapp_verified_at ? (
                            <CheckmarkCircle01Icon className="h-4 w-4 rounded-2xl bg-green-500 text-white" />
                        ) : (
                            <CancelCircleIcon className="h-4 w-4 rounded-2xl bg-red-500 text-white" />
                        )}
                        <span>{row.original.whatsapp}</span>
                    </div>
                ),
            },
            {
                accessorFn: (row) => row.balance,
                id: 'balance',
                headerName: t('common:labels.balance'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.balance')} />,
                cell: ({ row }) => formatCurrency(row.original.balance),
            },
            {
                accessorFn: (row) => row.service_discount,
                id: 'service_discount',
                headerName: t('common:labels.service-discount'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.service-discount')} />,
                cell: ({ row }) => `${formatAmount(row.original.service_discount)} %`,
            },
            {
                accessorFn: (row) => row.user_signin_log,
                id: 'user_signin_log',
                headerName: t('common:labels.last-signin'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.last-signin')} />,
                cell: ({ row }) =>
                    !row.original.user_signin_log ? (
                        <span className="text-destructive">{t('common:empty.no-data-yet')}</span>
                    ) : (
                        formatDate({ date: row.original.user_signin_log?.created_at })
                    ),
                enableSorting: false,
            },
            {
                accessorFn: (row) => row.referred_by,
                id: 'referred_by',
                headerName: t('common:labels.referred-by'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.referred-by')} />,
                cell: ({ row }) => row.original.upline?.username,
            },
            {
                accessorFn: (row) => row.referral_code,
                id: 'referral_code',
                headerName: t('common:labels.referral-code'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.referral-code')} />,
                cell: ({ row }) => row.original.referral_code,
            },
            {
                accessorFn: (row) => row.total_referrals,
                id: 'total_referrals',
                headerName: t('common:labels.referrals'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.referrals')} />,
                cell: ({ row }) => formatAmount(row.original.total_referrals),
                enableSorting: false,
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
        [i18n.language, pageProps?.userGroups?.options],
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
                label: t('common:labels.group'),
                column: 'user_group_id',
                options: pageProps?.userGroups?.filters || [],
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: userStatusOptions,
            },
        ],
        [i18n.language, pageProps?.userGroups?.filters],
    );

    const rowSelectionActions = useMemo(
        () => [
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.id'),
                }),
                type: 'copy',
            },

            ...(hasRole('user.update')
                ? [
                      {
                          label: (
                              <Trans
                                  i18nKey="admin/common:actions.mark-item-as"
                                  values={{ as: t('common:status.active') }}
                                  components={{
                                      item: <span className={cn('-ml-[5px]', userStatuses[1].textColor)} />,
                                  }}
                              />
                          ),
                          type: 'mark_item_as_active',
                          onClick: (selectedIds) => handleSwitch(selectedIds, 'status', 1),
                      },
                      {
                          label: (
                              <Trans
                                  i18nKey="admin/common:actions.mark-item-as"
                                  values={{ as: t('common:status.inactive') }}
                                  components={{
                                      item: <span className={cn('-ml-[5px]', userStatuses[0].textColor)} />,
                                  }}
                              />
                          ),
                          type: 'mark_item_as_inactive',
                          onClick: (selectedIds) => handleSwitch(selectedIds, 'status', 0),
                      },
                  ]
                : []),

            ...(hasRole('user.update') && pageProps?.userGroups?.options
                ? pageProps.userGroups.options.map((group) => ({
                      label: (
                          <Trans
                              i18nKey="admin/common:actions.mark-item-as"
                              values={{ as: group.label }}
                              components={{
                                  item: <span className="text-primary -ml-[5px]" />,
                              }}
                          />
                      ),
                      type: `mark_item_as_group_${group.value}`,
                      onClick: (selectedIds) => handleSwitch(selectedIds, 'user_group_id', group.value),
                  }))
                : []),

            ...(hasRole('user.delete')
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
        [i18n.language, pageProps?.userGroups?.options],
    );

    const form = useForm('post', route('admin.users.balance-reduction'), {
        user: {
            id: '',
        },
        deposit: {
            amount: 0,
        },
    });

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpenDialog(false);
                fetchData();
            },
            onError: (errors) => {
                toast({
                    variant: 'error',
                    description: 'Periksa input.',
                });
            },
        });
    };

    const getUsers = async function () {
        if (search == '') return setUsers([]);
        if (search) setUsers([]);
        await axios
            .get(
                route('admin.users.options', {
                    search,
                }),
            )
            .then((response) => {
                if (response.data.status) {
                    setUsers(response.data.list);
                }
            });
    };

    useEffect(() => {
        const getData = setTimeout(() => {
            getUsers();
        }, 100);
        return () => clearTimeout(getData);
    }, [search]);

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.users'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.users'),
                        href: '/',
                    },
                    {
                        title: t('common:labels.list'),
                        href: '/',
                    },
                ]}
            >
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
                    <SummaryCards summary={summary} formatCurrency={formatCurrency} formatAmount={formatAmount} t={t} />
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
                                {hasRole('user.create') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpened(true)}>
                                        <AddCircleIcon className="h-4 w-4" />
                                        {t('admin/common:actions.create-item', {
                                            item: t('common:labels.user'),
                                        })}
                                    </Button>
                                )}
                                {hasRole('user.update') && (
                                    <Button variant="outline" size="sm" onClick={() => setOpenDialog(true)}>
                                        <MinusCircle className="h-4 w-4" />
                                        {/* {t('admin/common:actions.deduct-item', {
                                            item: t('common:labels.balance'),
                                        })} */}
                                        Kurangi Saldo Pengguna
                                    </Button>
                                )}
                            </div>
                        }
                    />
                </Deferred>
            </AppLayout>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <form className="grid" onSubmit={handleSubmit} autoComplete="off">
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Kurangi Saldo Pengguna</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4 grid gap-2">
                            <Label isInvalid={form.invalid('user.id')}>Pengguna</Label>
                            <Popover className="p-0">
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            form.invalid('user.role.id') ? 'border-red-500 focus-visible:ring-red-500/50' : '',
                                            !form.data.user.id && 'text-muted-foreground',
                                        )}
                                    >
                                        {form.data.user.id ? users.find((option) => option.value == form.data.user.id)?.label : 'Pilih...'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Cari Pengguna..."
                                            className="h-9"
                                            value={search}
                                            onValueChange={(value) => setSearch(value)}
                                        />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada data.</CommandEmpty>
                                            <CommandGroup>
                                                {users.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData('user', {
                                                                ...form.data.user,
                                                                id: option.value,
                                                            }).validate('user.id');
                                                        }}
                                                    >
                                                        {option.label}
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === form.data.user.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('user.id') && <InputError message={form.errors['user.id']} />}
                        </div>
                        <div className="mb-4 grid gap-2">
                            <Label isInvalid={form.invalid('deposit.amount')}>Jumlah</Label>
                            <InputMask
                                min={0}
                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                value={form.data.deposit.display_amount}
                                onValueChange={(values) => {
                                    const amount = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                    form.setData((data) => ({
                                        ...data,
                                        deposit: {
                                            ...data.deposit,
                                            amount,
                                            display_amount: values.floatValue,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate(`deposit.amount`)}
                                aria-invalid={form.invalid(`deposit.display_amount`)}
                            />
                            {form.invalid('deposit.amount') && <InputError message={form.errors['deposit.amount']} />}
                        </div>
                        <div className="flex justify-between">
                            {/* <AlertDialogCancel>Batalkan</AlertDialogCancel> */}
                            <Button type="submit" className={cn('')} disabled={form.processing} onClick={handleSubmit}>
                                {!form.processing ? 'Submit' : 'Mohon Tunggu...'}
                            </Button>
                        </div>
                        {/* <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter> */}
                    </DialogContent>
                </form>
            </Dialog>

            {/* <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kurangi Saldo Pengguna</AlertDialogTitle>
                    </AlertDialogHeader>
                    <form className="grid" onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-2 mb-4">
                            <Label isInvalid={form.invalid('user.id')}>Pengguna</Label>
                            <Popover className="p-0">
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'justify-between',
                                            form.invalid('user.role.id') ? 'border-red-500 focus-visible:ring-red-500/50' : '',
                                            !form.data.user.id && 'text-muted-foreground'
                                        )}>
                                        {form.data.user.id ? users.find((option) => option.value == form.data.user.id)?.label : 'Pilih...'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari Pengguna..." className="h-9" value={search} onValueChange={(value) => setSearch(value)} />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada data.</CommandEmpty>
                                            <CommandGroup>
                                                {users.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            form.setData('user', {
                                                                ...form.data.user,
                                                                id: option.value,
                                                            }).validate('user.id');
                                                        }}>
                                                        {option.label}
                                                        <CheckIcon className={cn('ml-auto h-4 w-4', option.value === form.data.user.id ? 'opacity-100' : 'opacity-0')} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.invalid('user.id') && <InputError message={form.errors['user.id']} />}
                        </div>
                        <div className="grid gap-2 mb-4">
                            <Label isInvalid={form.invalid('deposit.amount')}>Jumlah</Label>
                            <InputMask
                                min={0}
                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                value={form.data.deposit.display_amount}
                                onValueChange={(values) => {
                                    const amount = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                                    form.setData((data) => ({
                                        ...data,
                                        deposit: {
                                            ...data.deposit,
                                            amount,
                                            display_amount: values.floatValue,
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate(`deposit.amount`)}
                                aria-invalid={form.invalid(`deposit.display_amount`)}
                            />
                            {form.invalid('deposit.amount') && <InputError message={form.errors['deposit.amount']} />}
                        </div>
                        <div className="flex justify-between">
                            <AlertDialogCancel>Batalkan</AlertDialogCancel>
                            <Button type="submit" className={cn('')} disabled={form.processing}>
                                {!form.processing ? 'Submit' : 'Mohon Tunggu...'}
                            </Button>
                        </div>
                    </form>
                </AlertDialogContent>
            </AlertDialog> */}
            <BulkActionDialog
                bulkActionDialog={bulkActionDialog}
                setBulkActionDialog={setBulkActionDialog}
                closeBulkActionDialog={closeBulkActionDialog}
                t={t}
            />
        </>
    );
}
