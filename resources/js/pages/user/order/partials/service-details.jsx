import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { config, createCurrencyFormatter, formatAmount, formatDuration, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ServiceDetails({ selectedService }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('orders');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const platforms = [
        'instagram',
        'youtube',
        'facebook',
        'twitter',
        'tiktok',
        'shopee',
        'website',
        'discord',
        'soundcloud',
        'spotify',
        'telegram',
        'snapchat',
        'linkedin',
        'pinterest',
    ];

    const categoryName = selectedService.service_category.name.toLowerCase();

    const matchedPlatform = platforms.find((platform) => categoryName.includes(platform));

    return (
        <div className="-mb-4 space-y-2">
            <div className="space-y-2 rounded-xl border p-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-2">
                    <div>
                        <p className="text-muted-foreground text-xs">{t('common:labels.price')}</p>
                        <h2 className="text-primary font-semibold">{formatCurrency(selectedService.price)}</h2>
                    </div>
                    <div>
                        <div className="grid items-center">
                            <div className="grid grid-cols-[40px_1fr] items-center gap-0.5">
                                <div className="text-muted-foreground text-xs">{t('common:labels.refill')}</div>
                                <div className="flex items-center gap-1">
                                    <div className="text-muted-foreground text-xs">:</div>
                                    <span
                                        className={`flex items-center text-[13px] font-medium ${
                                            selectedService.refill_days > 0 && selectedService.is_refill_support === 1
                                                ? 'text-green-500'
                                                : 'text-rose-500'
                                        }`}
                                    >
                                        {/* <CheckmarkCircle02Icon className="h-4" /> */}
                                        {selectedService.refill_days > 0 && selectedService.is_refill_support === 1
                                            ? `${selectedService.refill_days} ${t('common:labels.day')}`
                                            : t('common:labels.no')}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-[40px_1fr] items-center gap-0.5">
                                <div className="text-muted-foreground text-xs">{t('common:labels.cancel')}</div>
                                <div className="flex items-center gap-1">
                                    <div className="text-muted-foreground text-xs">:</div>
                                    <span
                                        className={`flex items-center text-[13px] font-medium ${
                                            selectedService.is_cancel_support === 1 ? 'text-green-500' : 'text-rose-500'
                                        }`}
                                    >
                                        {/* {selectedService.is_cancel_support === 1 && <CancelCircleIcon className="h-4" />} */}
                                        {selectedService.is_cancel_support === 1 ? t('common:labels.yes') : t('common:labels.no')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-4 border-b pb-2">
                    <div className="text-sm">
                        <p className="text-muted-foreground text-xs">{t('common:labels.average-time')}</p>
                        {selectedService.avg_quantity == 0 || selectedService.avg_time == null ? (
                            <span className="text-destructive">{t('common:empty.no-data-yet')}</span>
                        ) : (
                            <>
                                {toHTML(
                                    t('orders:labels.average-time-and-quantity', {
                                        time: formatDuration(selectedService.avg_time),
                                        quantity: formatAmount(selectedService.avg_quantity),
                                    }),
                                )}
                                {/* <span className="font-medium text-green-600">{formatDuration(selectedService.avg_time)}</span> */}
                                {/* dengan jumlah rata-rata pesanan <span className="font-medium text-green-600">{formatAmount(selectedService.avg_quantity)}</span> */}
                            </>
                        )}
                    </div>
                </div>
                <div className="">
                    <p className="text-muted-foreground text-xs">{t('common:labels.description')}</p>
                    <div
                        className="text-primary text-sm font-medium"
                        style={{
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {toHTML(selectedService.description)}
                    </div>
                </div>
            </div>
            <Accordion
                type="single"
                // defaultValue={isSmallScreen ? '' : 'item-0'}
                collapsible
            >
                <AccordionItem className="bg-card text-card-foreground mb-4 rounded-xl border shadow" value={`item-0`}>
                    <AccordionTrigger className="px-6">
                        <div className="flex items-center">{t('orders:labels.order-target-example')}</div>
                    </AccordionTrigger>
                    <AccordionContent className="prose prose-sm border-t px-6 pt-4 text-sm">
                        {matchedPlatform && toHTML(config('order_example_target')[matchedPlatform])}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
