import React from 'react';

import { DataTableFacetedFilter } from '@/components/datatable/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DataTableDatePickerWithRange from './data-table-datepicker-with-range';

export function DataTableFilterCard({ isOpen, table, isFiltered, filters, initialGlobalFilterState }) {
    const { t } = useTranslation();
    const [date, setDate] = React.useState({
        from: null,
        to: null,
    });
    return (
        <Transition
            show={isOpen}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-0"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className={cn('space-y-4 lg:col-span-4')}>
                <Card>
                    <CardContent>
                        <div className="flex items-center">
                            <div className="flex flex-1 flex-col items-center space-y-2.5">
                                {filters.map((filter, index) => {
                                    if (filter.column_filter) {
                                        return (
                                            <div className="grid w-full gap-1" key={index}>
                                                <Label className="text-[13px]">{filter.label}</Label>
                                                <DataTableFacetedFilter
                                                    column={table.getColumn(filter.column)}
                                                    label={filter.label}
                                                    options={filter.options}
                                                />
                                            </div>
                                        );
                                    }
                                    if (filter.type == 'daterange') {
                                        return (
                                            <div className="grid w-full gap-1" key={index}>
                                                <Label className="text-[13px]">{filter.label}</Label>
                                                <DataTableDatePickerWithRange
                                                    key={index}
                                                    table={table}
                                                    label={filter.label}
                                                    from={filter.from}
                                                    to={filter.to}
                                                />
                                            </div>
                                        );
                                    }
                                })}
                                <div className="grid w-full gap-2">
                                    <Label>{t('common:labels.search')}</Label>
                                    <Textarea
                                        className="min-h-28"
                                        placeholder={t('common:placeholders.search')}
                                        value={table.getState().globalFilter.search ?? ''}
                                        onChange={(event) => {
                                            table.setGlobalFilter((data) => ({
                                                ...data,
                                                search: event.target.value,
                                            }));
                                        }}
                                    />
                                </div>
                                {isFiltered && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            table.resetColumnFilters();
                                            // table.resetGlobalFilter();
                                            // table.setState((data) => ({
                                            //     ...data,
                                            //     globalFilter: initialGlobalFilterState,
                                            // }));
                                            table.setGlobalFilter(initialGlobalFilterState);
                                        }}
                                        className="w-full"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        {t('common:actions.filter.clear')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Transition>
    );
}
