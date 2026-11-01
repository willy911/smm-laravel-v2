import { DataTableViewOptions } from '@/components/datatable/data-table-view-options';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { FilterAddIcon, FilterRemoveIcon, PencilEdit02Icon } from 'hugeicons-react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SearchInput({ table }) {
    const { t } = useTranslation();
    const searchValue = table.getState().globalFilter?.search || '';

    return (
        <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input
                placeholder={t('common:placeholders.search')}
                value={searchValue}
                onChange={(event) =>
                    table.setGlobalFilter((data) => ({
                        ...data,
                        search: event.target.value,
                    }))
                }
                className="h-8 rounded-md pr-8 pl-8"
            />
            {searchValue && (
                <button
                    type="button"
                    onClick={() =>
                        table.setGlobalFilter((data) => ({
                            ...data,
                            search: '',
                        }))
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

function MassActionsDropdown({ table, rowSelectionActions, auth, t }) {
    const handleCopyToClipboard = (selectedIds) => {
        navigator.clipboard
            .writeText(selectedIds.join(', '))
            .then(() => {
                toast({
                    variant: 'success',
                    description: t('common:toast.text-copied'),
                });
            })
            .catch(() => {
                toast({
                    variant: 'error',
                    description: t('common:toast.copy-failed'),
                });
            });
    };

    const selectedRowCount = Object.keys(table.getState().rowSelection).length;

    if (selectedRowCount === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-md">
                    <PencilEdit02Icon className="h-4 w-4" />
                    {t('common:actions.mass-actions')}
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-md">
                {rowSelectionActions.map((action, index) => {
                    if (['favorite_add', 'favorite_remove'].includes(action.type) && !auth.user) return null;
                    return (
                        <DropdownMenuItem
                            key={index}
                            className="cursor-pointer"
                            onClick={() => {
                                let selectedIds = Object.keys(table.getState().rowSelection).map(Number);

                                if (action.column !== undefined) {
                                    selectedIds = table
                                        .getSelectedRowModel()
                                        .rows.filter((row) => row.getValue(action.column) !== null)
                                        .map((row) => row.getValue(action.column));
                                }

                                if (action.type === 'copy') {
                                    handleCopyToClipboard(selectedIds);
                                    return;
                                }

                                if (action.type === 'edit-order') {
                                    const selectedData = table.getSelectedRowModel().rows.map((row) => {
                                        const { id, target, start_count, remains, status, user } = row.original;

                                        return {
                                            id,
                                            target,
                                            start_count,
                                            remains,
                                            status,
                                            user,
                                        };
                                    });

                                    action.onClick?.(selectedData);
                                    return;
                                }

                                if (action.type === 'edit-service') {
                                    const selectedData = table.getSelectedRowModel().rows.map((row) => {
                                        const { id, name, service_category_id, description } = row.original;

                                        return {
                                            id,
                                            name,
                                            service_category_id,
                                            description,
                                        };
                                    });

                                    action.onClick?.(selectedData);
                                    return;
                                }
                                action.onClick?.(selectedIds);
                            }}
                        >
                            {action.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function DataTableToolbar({ table, isFilterCardOpen, setIsFilterCardOpen, rowSelectionActions = [], additionalButton = false }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    return (
        <div className="flex flex-1 flex-col gap-2 xl:flex-row xl:justify-between">
            <div className="flex flex-1 items-center gap-2">
                <div className="w-full xl:w-[250px]">
                    <SearchInput table={table} />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('hidden rounded-md xl:flex')}
                    onClick={() => setIsFilterCardOpen(!isFilterCardOpen)}
                >
                    {isFilterCardOpen ? <FilterRemoveIcon className="h-4 w-4" /> : <FilterAddIcon className="h-4 w-4" />}
                    {isFilterCardOpen ? t('common:actions.filter.close') : t('common:actions.filter.open')}
                </Button>
                {Object.keys(table.getState().rowSelection).length > 0 && (
                    <div className="hidden xl:flex">
                        <MassActionsDropdown table={table} rowSelectionActions={rowSelectionActions} auth={auth} t={t} />
                    </div>
                )}
                {additionalButton && <div className="hidden flex-1 xl:flex">{additionalButton}</div>}
            </div>

            <div className="flex flex-wrap gap-2">
                {additionalButton && <div className="flex-1 xl:hidden">{additionalButton}</div>}
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('flex-1 rounded-md xl:hidden')}
                    onClick={() => setIsFilterCardOpen(!isFilterCardOpen)}
                >
                    {isFilterCardOpen ? <FilterRemoveIcon className="h-4 w-4" /> : <FilterAddIcon className="h-4 w-4" />}
                    {isFilterCardOpen ? t('common:actions.filter.close') : t('common:actions.filter.open')}
                </Button>
                {Object.keys(table.getState().rowSelection).length > 0 && (
                    <div className="flex xl:hidden">
                        <MassActionsDropdown table={table} rowSelectionActions={rowSelectionActions} auth={auth} t={t} />
                    </div>
                )}
                <div className="flex-1">
                    <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
                        <SelectTrigger size="sm" className="w-full rounded-md text-xs">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top" className="rounded-md">
                            {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {t('common:datatable.rows-per-page', { count: pageSize })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <DataTableViewOptions table={table} />
                </div>
            </div>
        </div>
    );
}
