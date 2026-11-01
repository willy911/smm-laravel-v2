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
import { userStatuses, userStatusOptions } from '@/enums/user';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert01Icon, ArrowDown01Icon, Delete04Icon, FileEditIcon, RestoreBinIcon } from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
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

const AdminGroupDropdown = ({ row, adminGroups, handleSwitch, t }) => {
    const currentGroup = adminGroups?.options?.find((item) => item.value == row.original.admin_group_id);

    if (row.original.deleted_at) {
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
                {adminGroups?.options
                    ?.filter((item) => item.value != row.original.admin_group_id)
                    .map((item) => (
                        <DropdownMenuItem key={item.value} onClick={() => handleSwitch([row.original.id], 'admin_group_id', item.value)}>
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

    if (row.original.deleted_at) {
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
    if (!row.original.deleted_at) {
        return (
            <TooltipProvider delayDuration={0}>
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
            </TooltipProvider>
        );
    }

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
                                                item: t('admin/common:labels.admin'),
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
                                                item: t('admin/common:labels.admin'),
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
                                        item: t('admin/common:labels.admin'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('admin/common:labels.admin')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'restore' &&
                                toHTML(
                                    t('admin/common:dialog.restore.description', {
                                        item: t('admin/common:labels.admin'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('admin/common:labels.admin')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'destroy' &&
                                toHTML(
                                    t('admin/common:dialog.destroy.description', {
                                        item: t('admin/common:labels.admin'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('admin/common:labels.admin')}`,
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
                    route('admin.admins.switch', {
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
                const response = await axios.post(route('admin.admins.action', { action }), {
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
                accessorKey: 'id',
                headerName: t('common:labels.id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.id')} />,
                cell: ({ row }) => row.getValue('id'),
                width: '32px',
            },
            {
                accessorFn: (row) => row.currency_code,
                id: 'currency_code',
                headerName: t('common:labels.currency'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.currency')} />,
                cell: ({ row }) => `${row.original.language_name} - ${row.original.currency_code} - ${row.original.currency_symbol}`,
            },
            {
                accessorFn: (row) => row.usd_rate,
                id: 'usd_rate',
                headerName: 'USD Rate',
                header: ({ column }) => <DataTableColumnHeader column={column} title={'USD Rate'} />,
                cell: ({ row }) => `${row.original.currency_symbol} ${formatAmount(row.original.usd_rate)} / USD`,
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
        [i18n.language, pageProps?.adminGroups?.options],
    );

    const filters = useMemo(() => [], [i18n.language, pageProps?.adminGroups?.filters]);

    const rowSelectionActions = useMemo(
        () => [
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.id'),
                }),
                type: 'copy',
            },
        ],
        [i18n.language, pageProps?.adminGroups?.options],
    );

    return (
        <>
            <AppLayout
                pageTitle={cn(t('common:labels.list'), t('common:labels.currency'))}
                breadcrumbs={[
                    {
                        title: config().name,
                        href: '/',
                    },
                    {
                        title: t('common:labels.currency'),
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

            <BulkActionDialog
                bulkActionDialog={bulkActionDialog}
                setBulkActionDialog={setBulkActionDialog}
                closeBulkActionDialog={closeBulkActionDialog}
                t={t}
            />
        </>
    );
}
