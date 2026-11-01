import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDown02Icon, ArrowUp02Icon, ArrowUpDownIcon } from 'hugeicons-react';

export function DataTableColumnHeader({ column, title, className }) {
    if (!column.getCanSort()) {
        return <div className={cn('text-[13px]', className)}>{title}</div>;
    }
    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <Button
                variant="ghost"
                size="sm"
                className="data-[state=open]:bg-accent dark:hover:bg-muted/0 -ml-3 flex h-8 w-full justify-between text-[13px]"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc' ? true : false)}
            >
                <span>{title}</span>
                {column.getIsSorted() === 'desc' ? (
                    <ArrowDown02Icon className={column.getIsSorted() === 'asc' ? 'text-muted-foreground' : ''} />
                ) : column.getIsSorted() === 'asc' ? (
                    <ArrowUp02Icon className={column.getIsSorted() === 'desc' ? 'text-muted-foreground' : ''} />
                ) : (
                    <ArrowUpDownIcon className="text-muted-foreground" />
                )}
            </Button>
        </div>
    );
}
