import { DataTableFilterCard } from '@/components/datatable/data-table-filter-card';
import { DataTablePagination } from '@/components/datatable/data-table-pagination';
import { DataTableToolbar } from '@/components/datatable/data-table-toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { flexRender, getCoreRowModel, getExpandedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Loading01Icon } from 'hugeicons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderDetail as AdminOrderDetail } from './details/admin/order-detail';
import { UserDetail } from './details/admin/user-detail';
import { ServiceDetail } from './details/guest/service-detail';
import { DepositDetail } from './details/user/deposit-detail';
import { OrderDetail } from './details/user/order-detail';
import { TicketDetail } from './details/user/ticket-detail';

export function DataTable({
    title = null,
    tableState,
    columns,
    filters,
    initialGlobalFilterState,
    tableData,
    onChange,
    isLoading,
    rowSelectionActions = [],
    additionalButton = false,
}) {
    const { t } = useTranslation();
    const [isFilterCardOpen, setIsFilterCardOpen] = React.useState(false);
    const STORAGE_KEY = `table_state_${route().current()}`;
    const getInitialState = React.useCallback(
        (key, fallback) => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed[key] !== undefined) return parsed[key];
                }
            } catch (e) {
                console.error(`Gagal memuat ${key} dari localStorage`, e);
            }
            return fallback;
        },
        [STORAGE_KEY],
    );
    const [rowSelection, setRowSelection] = React.useState(() => getInitialState('rowSelection', tableState.rowSelection));
    const [columnVisibility, setColumnVisibility] = React.useState(() => getInitialState('columnVisibility', tableState.columnVisibility));
    const [columnFilters, setColumnFilters] = React.useState(() => getInitialState('columnFilters', tableState.columnFilters));
    const [globalFilter, setGlobalFilter] = React.useState(() => getInitialState('globalFilter', tableState.globalFilter));
    const [sorting, setSorting] = React.useState(() => getInitialState('sorting', tableState.sorting));
    const [expanded, setExpanded] = React.useState(() => getInitialState('expanded', tableState.expanded));
    const [pagination, setPagination] = React.useState(() => getInitialState('pagination', tableState.pagination));

    React.useEffect(() => {
        try {
            const updatedState = {
                sorting,
                columnVisibility,
                rowSelection,
                columnFilters,
                pagination,
                expanded,
                globalFilter,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
        } catch (error) {
            console.error('Gagal menyimpan data ke localStorage:', error);
        }
    }, [sorting, columnVisibility, rowSelection, columnFilters, pagination, expanded, globalFilter, STORAGE_KEY]);
    // ==========================================

    const handleChange = React.useCallback(() => {
        if (onChange) {
            onChange({
                pagination,
                columnFilters,
                globalFilter,
                sorting,
                columnVisibility,
            });
        }
    }, [pagination, columnFilters, globalFilter, sorting]);

    React.useEffect(() => {
        const delay = setTimeout(handleChange, 200);
        return () => clearTimeout(delay);
    }, [handleChange]);

    const table = useReactTable({
        data: tableData?.data || [],
        columns,
        getRowId: (row) => row.id,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
            expanded,
            globalFilter,
        },
        onExpandedChange: setExpanded,
        getExpandedRowModel: getExpandedRowModel(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // getFacetedRowModel: getFacetedRowModel(),
        // getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        manualFiltering: true,
        enableGlobalFilter: true,
        manualSorting: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        rowCount: tableData?.total || 0,
        // pageCount: serverPagination?.last_page || -1,
    });

    function countActiveFilters(filters) {
        let count = 0;

        const keysToCheck = ['start', 'end'];

        for (const key in filters) {
            if (typeof filters[key] === 'object' && filters[key] !== null) {
                const subKeys = Object.keys(filters[key]);
                for (const subKey of subKeys) {
                    if (keysToCheck.includes(subKey) && filters[key][subKey] !== null) {
                        count++;
                    }
                }
                count += countActiveFilters(filters[key]);
            } else if (filters[key] === true) {
                count++;
            }
        }

        return count;
    }

    const isFiltered =
        table.getState().columnFilters.length > 0 || countActiveFilters(table.getState().globalFilter) > 0 || table.getState().globalFilter.search;

    return (
        <div className="flex flex-1 flex-col gap-4 lg:grid lg:flex-none lg:grid-cols-12">
            <DataTableFilterCard
                isOpen={isFilterCardOpen}
                table={table}
                isFiltered={isFiltered}
                filters={filters}
                initialGlobalFilterState={initialGlobalFilterState}
            />
            <Card className={cn('lg:self-start', isFilterCardOpen ? 'lg:col-span-8' : 'lg:col-span-12')}>
                {title && (
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="space-y-2 lg:space-y-4">
                        <DataTableToolbar
                            table={table}
                            isFilterCardOpen={isFilterCardOpen}
                            setIsFilterCardOpen={setIsFilterCardOpen}
                            rowSelectionActions={rowSelectionActions}
                            additionalButton={additionalButton}
                        />
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {!isLoading ? (
                                        table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <React.Fragment key={row.id}>
                                                    <TableRow
                                                        className={cn(row.original.deleted_at && 'bg-red-300/50 hover:bg-red-300/60')}
                                                        data-state={cn(
                                                            row.getIsSelected() ? 'selected' : undefined,
                                                            row.original.deleted_at ? 'deleted' : undefined,
                                                        )}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell width={cell.column.columnDef.width ?? 'auto'} key={cell.id}>
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                    {row.getIsExpanded() && (
                                                        <TableRow>
                                                            <TableCell colSpan={row.getVisibleCells().length}>
                                                                <div className="bg-muted/40 rounded-lg p-4">
                                                                    {route().current('guest.services.index') && <ServiceDetail row={row} />}
                                                                    {route().current('user.orders.index') && <OrderDetail row={row} />}
                                                                    {route().current('user.deposits.index') && <DepositDetail row={row} />}
                                                                    {route().current('user.tickets.index') && <TicketDetail row={row} />}
                                                                    {route().current('admin.users.index') && <UserDetail row={row} />}
                                                                    {route().current('admin.orders.index') && <AdminOrderDetail row={row} />}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                    {t('common:empty.no-data-found')}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-[4rem] text-center">
                                                <div className="flex items-center justify-center">
                                                    <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                                    {t('common:loading.please-wait')}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <DataTablePagination table={table} tableData={tableData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
