import { Button } from '@/components/ui/button';
import { cn, formatAmount } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DataTablePagination({ table, tableData }) {
    const { t } = useTranslation();

    const from = formatAmount(tableData.from);
    const to = formatAmount(tableData.to);
    const total = formatAmount(table.getRowCount());
    const selectedCount = Object.keys(table.getState().rowSelection).length;

    const handlePageChange = (url) => {
        if (!url) return;

        const pageMatch = url.match(/page=(\d+)/);
        if (pageMatch) {
            const pageNumber = parseInt(pageMatch[1], 10);
            table.setPageIndex(pageNumber - 1);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            {tableData !== undefined && (
                <div className="text-muted-foreground flex-1 text-sm">
                    {t('common:datatable.showing-entries', { from, to, total })}{' '}
                    {selectedCount > 0 && t('common:datatable.rows-selected', { count: selectedCount })}
                </div>
            )}

            {tableData !== undefined && (
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 md:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    {tableData.links?.map((link, index) => {
                        const label = link.label;
                        const isPrevious = index === 0;
                        const isNext = index === tableData.links.length - 1;
                        if (label === '...') {
                            return (
                                <span key={index} className="px-2">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="xs"
                                className={cn('h-8 w-8 p-0', (isPrevious || isNext) && 'hidden h-8 w-8 md:flex')}
                                onClick={() => {
                                    if (isPrevious) {
                                        table.previousPage();
                                    } else if (isNext) {
                                        table.nextPage();
                                    } else {
                                        table.setPageIndex(parseInt(label) - 1);
                                    }
                                }}
                                disabled={link.active || (isPrevious && !table.getCanPreviousPage()) || (isNext && !table.getCanNextPage())}
                            >
                                {isPrevious ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : label}
                            </Button>
                        );
                    })}
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 md:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
