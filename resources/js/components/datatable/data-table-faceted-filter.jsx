import { Check, PlusCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn, formatAmount, getFile } from '@/lib/utils';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Fragment } from 'react/jsx-runtime';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export function DataTableFacetedFilter({ column, label, options }) {
    const { t } = useTranslation();
    const facets = column?.getFacetedUniqueValues();
    const selectedValues = new Set(column?.getFilterValue());

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-full gap-2 border-dashed text-left">
                    <PlusCircle />
                    {/* {label} */}
                    {t('common:placeholders.select')}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                {selectedValues.size} {t('common:placeholders.selected')}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                        {selectedValues.size} {t('common:placeholders.selected')}
                                    </Badge>
                                ) : (
                                    options.flatMap((option) => {
                                        if (Array.isArray(option.items) && option.items.length > 0) {
                                            return option.items
                                                .filter((item) => selectedValues.has(item.value))
                                                .map((item) => (
                                                    <Badge
                                                        variant="secondary"
                                                        key={item.value}
                                                        className="max-w-24 truncate rounded-sm px-1 font-normal"
                                                    >
                                                        {t(item.label)}
                                                    </Badge>
                                                ));
                                        }

                                        if (selectedValues.has(option.value)) {
                                            return (
                                                <Badge
                                                    variant="secondary"
                                                    key={option.value}
                                                    className="max-w-24 truncate rounded-sm px-1 font-normal"
                                                >
                                                    {t(option.label)}
                                                </Badge>
                                            );
                                        }

                                        return [];
                                    })
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="popover-content p-0" align="start">
                <Command
                    filter={(value, search, keywords) => {
                        const extendValue = value + ' ' + keywords.join(' ');
                        if (extendValue.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                    }}
                >
                    {/* <CommandInput placeholder={`${t('common:labels.search')} ${label}...`} /> */}
                    <CommandInput
                        placeholder={t('common:placeholders.search-item', {
                            item: label,
                        })}
                    />
                    <CommandList>
                        <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                        {Array.isArray(options) &&
                            options.map((option, index) => {
                                const isLast = index === options.length - 1;
                                const renderItem = (item) => {
                                    const isSelected = selectedValues.has(item.value);
                                    return (
                                        <CommandItem
                                            key={item.value}
                                            onSelect={() => {
                                                if (isSelected) {
                                                    selectedValues.delete(item.value);
                                                } else {
                                                    selectedValues.add(item.value);
                                                }
                                                const filterValues = Array.from(selectedValues);
                                                column?.setFilterValue(filterValues.length ? filterValues : undefined);
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                                    isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                                                )}
                                            >
                                                <Check className="text-primary-foreground" />
                                            </div>
                                            {item.type === 'emoji' && item.emoji && <span className="-mt-1 h-4 w-4">{item.emoji}</span>}
                                            {item.type === 'icon' && item.icon && (
                                                <DynamicIcon className="h-4 w-4" iconName={item.icon.trim()} size={12} />
                                            )}
                                            {item.type === 'image' && item.image && (
                                                <img
                                                    alt={item.image}
                                                    decoding="async"
                                                    className="max-w-20 object-contain md:max-h-5"
                                                    src={getFile('service-category-groups', item.image)}
                                                />
                                            )}
                                            <span>{t(item.label)}</span>
                                            {item.count !== undefined && item.count !== 0 && (
                                                <Badge variant="secondary" className="ml-auto rounded-sm px-1 font-normal">
                                                    {formatAmount(item.count)}
                                                </Badge>
                                            )}
                                        </CommandItem>
                                    );
                                };
                                if (Array.isArray(option.items) && option.items.length > 0) {
                                    return (
                                        <Fragment key={option.value}>
                                            <CommandGroup
                                                heading={
                                                    <div className={cn('flex items-center', option.type === 'image' ? 'space-x-1' : 'space-x-2')}>
                                                        {option.type === 'emoji' && option.emoji && (
                                                            <span className="-mt-px mr-1.5">{option.emoji}</span>
                                                        )}
                                                        {option.type === 'icon' && option.icon && (
                                                            <DynamicIcon className="-mt-px h-4 w-4" iconName={option.icon.trim()} size={12} />
                                                        )}
                                                        {option.type === 'image' && option.image && (
                                                            <img
                                                                alt={option.image}
                                                                decoding="async"
                                                                className="-mt-px max-w-20 object-contain md:max-h-5"
                                                                src={getFile('service-category-groups', option.image)}
                                                            />
                                                        )}
                                                        <span>{option.label}</span>
                                                    </div>
                                                }
                                            >
                                                {option.items.map((item) => renderItem(item))}
                                            </CommandGroup>
                                            {!isLast && <CommandSeparator />}
                                        </Fragment>
                                    );
                                }
                                return <Fragment key={option.value}>{renderItem(option)}</Fragment>;
                            })}
                    </CommandList>
                    {selectedValues.size > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => column?.setFilterValue(undefined)}
                                    className="from-destructive/75 dark:from-destructive/50 to-destructive data-[selected=true]:from-destructive data-[selected=true]:to-destructive/90 data-[selected=true]:text-primary-foreground hover:data-[selected=true]:text-primary-foreground text-primary-foreground flex items-center justify-center bg-gradient-to-b text-center text-xs dark:bg-gradient-to-t"
                                >
                                    <XCircle className="text-primary-foreground -mr-1" />
                                    {t('common:actions.filter.clear')}
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
