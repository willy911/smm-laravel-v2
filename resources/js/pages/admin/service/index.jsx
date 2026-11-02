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
import { serviceRecommendationOptions, serviceRecommendations } from '@/enums/service';
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
    Loading03Icon,
    RefreshIcon,
    RestoreBinIcon,
    SortByDown01Icon,
    TagsIcon,
} from 'hugeicons-react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import EditCategory from './edit-category';
import EditDescription from './edit-descripton';
import Fetch from './fetch';
import Form from './form';
import Sort from './sort';
import SyncDescription from './sync-description';

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

const StatusDropdown = ({ row, handleSwitch, t }) => {
    const currentStatus = userStatuses[row.original.status];
    const { hasRole } = usePermissions();

    if (row.original.deleted_at || !hasRole('service.update')) {
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

const RecommendationDropdown = ({ row, handleSwitch, t }) => {
    const currentStatus = serviceRecommendations[row.original.is_recommended];
    const { hasRole } = usePermissions();

    if (row.original.deleted_at || !hasRole('service.update')) {
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
                        item: t('common:labels.recommended'),
                    })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {serviceRecommendationOptions
                    .filter((item) => item.value != row.original.is_recommended)
                    .map((item) => {
                        const statusDef = serviceRecommendations[item.value];
                        return (
                            <DropdownMenuItem key={item.value} onClick={() => handleSwitch([row.original.id], 'is_recommended', item.value)}>
                                <statusDef.icon className={cn('h-4 w-4', serviceRecommendations[item.value].textColor)} />
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

const BestSellerDropdown = ({ row, handleSwitch, t }) => {
    const currentStatus = serviceRecommendations[row.original.is_best_seller];
    const { hasRole } = usePermissions();

    if (row.original.deleted_at || !hasRole('service.update')) {
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
                        item: t('common:labels.best-seller'),
                    })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {serviceRecommendationOptions
                    .filter((item) => item.value != row.original.is_best_seller)
                    .map((item) => {
                        const statusDef = serviceRecommendations[item.value];
                        return (
                            <DropdownMenuItem key={item.value} onClick={() => handleSwitch([row.original.id], 'is_best_seller', item.value)}>
                                <statusDef.icon className={cn('h-4 w-4', serviceRecommendations[item.value].textColor)} />
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
    if (!row.original.deleted_at && (hasRole('service.update') || hasRole('service.delete'))) {
        return (
            <TooltipProvider delayDuration={0}>
                {hasRole('service.update') && (
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
                {hasRole('service.delete') && (
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
                                                        item: t('common:labels.service'),
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

    if (row.original.deleted_at && hasRole('service.delete')) {
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
                                                    item: t('common:labels.service'),
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
                                                    item: t('common:labels.service'),
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
                                        item: t('common:labels.service'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.service')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'restore' &&
                                toHTML(
                                    t('admin/common:dialog.restore.description', {
                                        item: t('common:labels.service'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.service')}`,
                                    }),
                                )}
                            {bulkActionDialog.actionType === 'destroy' &&
                                toHTML(
                                    t('admin/common:dialog.destroy.description', {
                                        item: t('common:labels.service'),
                                        value: `${bulkActionDialog.selectedIds.length} ${t('common:labels.service')}`,
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
    const { t, i18n } = useTranslation(['admin/common', 'admin/services']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const { hasRole } = usePermissions();

    const [isFetchDialogOpened, setIsFetchDialogOpened] = useState(false);
    const [isSyncDescriptionDialogOpened, setIsSyncDescriptionDialogOpened] = useState(false);
    const [isSortDialogOpened, setIsSortDialogOpened] = useState(false);
    const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
    const [isEditCategoryDialogOpened, setIsEditCategoryDialogOpened] = useState(false);
    const [isEditDescriptionDialogOpened, setIsEditDescriptionDialogOpened] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [targets, setTargets] = useState([]);

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
                service_category_id: false,
                min: false,
                max: false,
                service_provider_service_id: false,
                type: false,
                other: false,
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
                    route('admin.services.switch', {
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
                const response = await axios.post(route('admin.services.action', { action }), {
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

    const handleSyncServices = useCallback(async () => {
        setIsSyncing(true);
        try {
            const { data } = await axios.post(route('admin.services.sync'));
            if (data?.status) {
                const s = data.summary ?? {};
                toast({
                    variant: 'success',
                    description: toHTML(
                        data.message +
                            (s.fetched ? ` — ${s.fetched} layanan diproses` : '') +
                            (s.enabled ? `, ${s.enabled} aktif` : '') +
                            (s.disabled ? `, ${s.disabled} nonaktif` : '') +
                            (s.price_changed ? `, ${s.price_changed} harga berubah` : ''),
                    ),
                });
            } else {
                toast({ variant: 'error', description: toHTML(data?.message ?? 'Sync gagal.') });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        } finally {
            setIsSyncing(false);
            if (tableStateRef.current) {
                fetchData(tableStateRef.current);
            }
        }
    }, [fetchData]);

    const columns = useMemo(
        () => [
            {
                id: 'other',
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorFn: (row) => row.type,
                id: 'type',
                headerName: t('common:labels.type'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.type')} />,
                cell: ({ row }) => (!row.original.type ? '-' : (row.original.type_labels?.[row.original.type] ?? row.original.type)),
                width: '140px',
            },
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
                accessorFn: (row) => row.service_provider_id,
                id: 'service_provider_id',
                headerName: t('admin/common:labels.provider'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.provider')} />,
                cell: ({ row }) => row.original.service_provider?.alias,
            },
            {
                accessorFn: (row) => row.service_provider_service_id,
                id: 'service_provider_service_id',
                headerName: t('admin/services:labels.service-provider-service-id'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/services:labels.service-provider-service-id')} />,
                cell: ({ row }) => row.original.service_provider_service_id,
            },
            {
                accessorFn: (row) => row.service_category_id,
                id: 'service_category_id',
                headerName: t('common:labels.category'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.category')} />,
                cell: ({ row }) => row.original.service_category?.name,
                // cell: ({ row }) => (
                //     <UserGroupDropdown row={row} serviceCategoryGroups={pageProps?.serviceCategoryGroups} handleSwitch={handleSwitch} t={t} />
                // ),
            },
            {
                accessorFn: (row) => row.name,
                id: 'name',
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
                accessorFn: (row) => row.min,
                id: 'min',
                headerName: t('common:labels.minimum'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.minimum')} />,
                cell: ({ row }) => formatAmount(row.original.min),
            },
            {
                accessorFn: (row) => row.max,
                id: 'max',
                headerName: t('common:labels.maximum'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.maximum')} />,
                cell: ({ row }) => formatAmount(row.original.max),
            },
            {
                accessorFn: (row) => row.original_price,
                id: 'original_price',
                headerName: t('admin/common:labels.original-price'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.original-price')} />,
                cell: ({ row }) => formatCurrency(row.original.original_price),
            },
            {
                accessorFn: (row) => row.price,
                id: 'price',
                headerName: t('admin/common:labels.sell-price'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.sell-price')} />,
                cell: ({ row }) => formatCurrency(row.original.price),
            },
            {
                accessorFn: (row) => row.profit,
                id: 'profit',
                headerName: t('admin/common:labels.profit-value'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('admin/common:labels.profit-value')} />,
                cell: ({ row }) => formatCurrency(row.original.profit),
            },
            {
                accessorFn: (row) => row.is_recommended,
                id: 'is_recommended',
                headerName: t('common:labels.recommended'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.recommended')} />,
                cell: ({ row }) => <RecommendationDropdown row={row} handleSwitch={handleSwitch} t={t} />,
                width: '100px',
            },
            {
                accessorFn: (row) => row.is_best_seller,
                id: 'is_best_seller',
                headerName: t('common:labels.best-seller'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.best-seller')} />,
                cell: ({ row }) => <BestSellerDropdown row={row} handleSwitch={handleSwitch} t={t} />,
                width: '100px',
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
                label: t('admin/common:labels.provider'),
                column: 'service_provider_id',
                options: pageProps?.serviceProviders?.filters || [],
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
                options: pageProps?.serviceTypes?.filters || [],
            },
            {
                column_filter: true,
                label: t('common:labels.others'),
                column: 'other',
                options: (pageProps?.others || []).filter(Boolean),
            },
            {
                column_filter: true,
                label: t('common:labels.status'),
                column: 'status',
                options: userStatusOptions,
            },
        ],
        [i18n.language, pageProps?.serviceProviders, pageProps?.serviceCategories, pageProps?.serviceTypes, pageProps?.others],
    );

    const rowSelectionActions = useMemo(
        () => [
            {
                label: t('common:actions.copy-item', {
                    item: t('common:labels.id'),
                }),
                type: 'copy',
            },
            ...(hasRole('service.update')
                ? [
                      {
                          label: t('admin/common:actions.edit-item', {
                              item: t('common:labels.category'),
                          }),
                          type: 'edit-service',
                          column: 'id',
                          onClick: (selectedIds) => {
                              setIsEditCategoryDialogOpened(true);
                              setTargets(selectedIds);
                          },
                          // selectedIds: selectedIds,
                          targets: targets,
                          setTargets: setTargets,
                          fetchData: fetchData,
                          tableStateRef: tableStateRef,
                          pageProps: pageProps,
                          isEditCategoryDialogOpened: isEditCategoryDialogOpened,
                          setIsEditCategoryDialogOpened: setIsEditCategoryDialogOpened,
                      },
                      {
                          label: t('admin/common:actions.edit-item', {
                              item: t('common:labels.description'),
                          }),
                          type: 'edit-service',
                          column: 'id',
                          onClick: (selectedIds) => {
                              setIsEditDescriptionDialogOpened(true);
                              setTargets(selectedIds);
                          },
                          // selectedIds: selectedIds,
                          targets: targets,
                          setTargets: setTargets,
                          fetchData: fetchData,
                          tableStateRef: tableStateRef,
                          pageProps: pageProps,
                          isEditDescriptionDialogOpened: isEditDescriptionDialogOpened,
                          setIsEditDescriptionDialogOpened: setIsEditDescriptionDialogOpened,
                      },
                      {
                          label: (
                              <Trans
                                  i18nKey="admin/common:actions.mark-item-as"
                                  values={{ as: t('common:status.active') }}
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
                                  values={{ as: t('common:status.inactive') }}
                                  components={{ item: <span className={cn('-ml-[5px]', userStatuses[0].textColor)} /> }}
                              />
                          ),
                          type: 'mark_item_as_inactive',
                          onClick: (selectedIds) => handleSwitch(selectedIds, 'status', 0),
                      },
                  ]
                : []),
            ...(hasRole('service.delete')
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

    useEffect(() => {
        if (tableStateRef.current.columnFilters !== undefined) {
            const filterData = tableStateRef.current.columnFilters.reduce((acc, item) => {
                const key = item.id === 'name' ? 'search' : item.id;
                const value = Array.isArray(item.value) ? item.value.join(',') : item.value;
                acc[key] = value;
                return acc;
            }, {});
        }
    }, [tableStateRef.current.columnFilters]);

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
                <Fetch
                    pageProps={pageProps}
                    isFetchDialogOpened={isFetchDialogOpened}
                    setIsFetchDialogOpened={setIsFetchDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                />
                <SyncDescription
                    pageProps={pageProps}
                    isSyncDescriptionDialogOpened={isSyncDescriptionDialogOpened}
                    setIsSyncDescriptionDialogOpened={setIsSyncDescriptionDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                />
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
                <EditCategory
                    key={targets?.length > 0 ? `edit-category-${targets.length}` : 'create-category'}
                    pageProps={pageProps}
                    isEditCategoryDialogOpened={isEditCategoryDialogOpened}
                    setIsEditCategoryDialogOpened={setIsEditCategoryDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                    targets={targets}
                    setTargets={setTargets}
                />
                <EditDescription
                    key={targets?.length > 0 ? `edit-description-${targets.length}` : 'create-description'}
                    pageProps={pageProps}
                    isEditDescriptionDialogOpened={isEditDescriptionDialogOpened}
                    setIsEditDescriptionDialogOpened={setIsEditDescriptionDialogOpened}
                    fetchData={fetchData}
                    tableStateRef={tableStateRef}
                    targets={targets}
                    setTargets={setTargets}
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
                                {hasRole('service.create') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpened(true)}>
                                        <AddCircleIcon className="h-4 w-4" />
                                        {t('admin/common:actions.create-item', {
                                            item: t('common:labels.service'),
                                        })}
                                    </Button>
                                )}
                                {hasRole('service.update') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsSortDialogOpened(true)}>
                                        <SortByDown01Icon className="h-4 w-4" />
                                        {t('admin/common:actions.sort-item', {
                                            item: t('common:labels.service'),
                                        })}
                                    </Button>
                                )}
                                {hasRole('service.create') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsFetchDialogOpened(true)}>
                                        <TagsIcon className="h-4 w-4" />
                                        {t('admin/common:actions.fetch-item', {
                                            item: t('common:labels.services'),
                                        })}
                                    </Button>
                                )}
                                {hasRole('service.update') && (
                                    <Button variant="outline" size="sm" onClick={handleSyncServices} disabled={isSyncing}>
                                        {isSyncing ? <Loading03Icon className="h-4 w-4 animate-spin" /> : <RefreshIcon className="h-4 w-4" />}
                                        {t('admin/common:actions.sync-services')}
                                    </Button>
                                )}
                                {hasRole('service.update') && (
                                    <Button variant="outline" size="sm" onClick={() => setIsSyncDescriptionDialogOpened(true)}>
                                        <FileEditIcon className="h-4 w-4" />
                                        {t('admin/common:actions.sync-descriptions')}
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
