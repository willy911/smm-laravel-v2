import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CheckIcon, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DataTableViewOptions({ table }) {
    const { t } = useTranslation();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" role="combobox" className="ml-auto h-8 w-full">
                    <Settings2 />
                    {t('common:datatable.columns')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Command>
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {table
                                .getAllColumns()
                                .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                                .map((column) => (
                                    <CommandItem
                                        key={column.id}
                                        value={column.id}
                                        className="capitalize"
                                        onSelect={(value) => {
                                            column.toggleVisibility(!column.getIsVisible());
                                        }}
                                    >
                                        {column.columnDef.headerName}
                                        <CheckIcon className={cn('ml-auto', column.getIsVisible() ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
