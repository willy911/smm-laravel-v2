import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { addDays, format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { Calendar03Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const localeMap = {
    id: id,
    en: enUS,
};

function DataTableDatePickerWithRange({ table, label, from, to }) {
    const { t, i18n } = useTranslation();
    const currentLocale = localeMap[i18n.language] || id;
    const [date, setDate] = useState({ from: null, to: null });
    const getStateValue = (path) => {
        const keys = path.split('.');
        let value = table.getState().globalFilter;

        for (const key of keys) {
            if (value && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    };

    useEffect(() => {
        setDate({ from: null, to: null });
        const fromDate = getStateValue(from);
        const toDate = getStateValue(to);

        if (fromDate || toDate) {
            setDate({ from: fromDate, to: toDate });
        }
    }, [table.getState().globalFilter]);

    const handleDateSelect = (selectedDate) => {
        if (
            selectedDate !== undefined &&
            selectedDate.from !== undefined &&
            selectedDate.to !== undefined &&
            new Date(selectedDate.from) > new Date(selectedDate.to)
        ) {
            return toast({
                variant: 'error',
                description: t('common:toast.date-invalid-range'),
            });
        }
        const newState = { ...table.getState().globalFilter };

        const keysFrom = from.split('.');
        const keysTo = to.split('.');

        let tempState = newState;
        for (let i = 0; i < keysFrom.length - 1; i++) {
            tempState = tempState[keysFrom[i]];
        }
        tempState[keysFrom[keysFrom.length - 1]] = selectedDate?.from ?? '';

        tempState = newState;
        for (let i = 0; i < keysTo.length - 1; i++) {
            tempState = tempState[keysTo[i]];
        }
        tempState[keysTo[keysTo.length - 1]] = selectedDate?.to ?? '';

        table.setGlobalFilter(newState);
        setDate(selectedDate ?? { from: null, to: null });
        table.setState((prevState) => ({
            ...prevState,
            pagination: {
                ...prevState.pagination,
                pageIndex: 0,
            },
        }));
    };

    return (
        <div className="grid gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-full gap-2 border-dashed text-left">
                        <Calendar03Icon />
                        {date.from
                            ? date.to
                                ? `${format(date.from, 'dd LLL y', { locale: currentLocale })} - ${format(date.to, 'dd LLL y', { locale: currentLocale })}`
                                : format(date.from, 'dd LLL y', { locale: currentLocale })
                            : // : label}
                              `${t('common:placeholders.start')} - ${t('common:placeholders.end')}`}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto space-y-2 p-2">
                    <div className="flex w-full gap-2">
                        <Select
                            onValueChange={(value) => {
                                handleDateSelect({
                                    from: addDays(new Date(), parseInt(value)),
                                    to: date.from,
                                });
                                // table.setGlobalFilter((data) => ({
                                //     ...data,
                                //     created_at: {
                                //         ...data.created_at,
                                //         from: addDays(new Date(), parseInt(value)),
                                //     },
                                // }));
                            }}
                        >
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue placeholder={t('common:placeholders.quick-select.title')} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="-60">{t('common:placeholders.quick-select.60-days-ago')}</SelectItem>
                                <SelectItem value="-30">{t('common:placeholders.quick-select.30-days-ago')}</SelectItem>
                                <SelectItem value="-7">{t('common:placeholders.quick-select.7-days-ago')}</SelectItem>
                                <SelectItem value="-1">{t('common:placeholders.quick-select.yesterday')}</SelectItem>
                                <SelectItem value="0">{t('common:placeholders.quick-select.today')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(value) => {
                                handleDateSelect({
                                    from: date.from,
                                    to: addDays(new Date(), parseInt(value)),
                                });
                            }}
                        >
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue placeholder={t('common:placeholders.quick-select.title')} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="-60">{t('common:placeholders.quick-select.60-days-ago')}</SelectItem>
                                <SelectItem value="-30">{t('common:placeholders.quick-select.30-days-ago')}</SelectItem>
                                <SelectItem value="-7">{t('common:placeholders.quick-select.7-days-ago')}</SelectItem>
                                <SelectItem value="-1">{t('common:placeholders.quick-select.yesterday')}</SelectItem>
                                <SelectItem value="0">{t('common:placeholders.quick-select.today')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md border">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DataTableDatePickerWithRange;
