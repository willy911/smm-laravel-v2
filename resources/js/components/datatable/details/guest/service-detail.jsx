import { Badge } from '@/components/ui/badge';
import { serviceTypes } from '@/enums/service';
import { serviceUpdateTypes } from '@/enums/service-update';
import { createCurrencyFormatter, formatAmount, formatDate, formatDuration, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function ServiceDetail({ row }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('services');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const formatContentParams = (params) => {
        if (!params?.type || !params?.from || !params?.to) return params;
        const formattedParams = { ...params };
        if (params.type === 'amount') {
            formattedParams.from = formatAmount(params.from);
            formattedParams.to = formatAmount(params.to);
        } else if (params.type === 'currency') {
            formattedParams.from = formatCurrency(params.from);
            formattedParams.to = formatCurrency(params.to);
        }
        return formattedParams;
    };

    return (
        <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium"></div>
                <div className="ml-1 flex w-full gap-2">
                    <Badge variant="outline" className="rounded-sm text-[10px]">
                        {serviceTypes[row.original.type]}
                    </Badge>
                    {row.original.is_recommended === 1 && (
                        <Badge variant="indigo" className="rounded-sm text-[10px]">
                            {t('common:labels.recommended')}
                        </Badge>
                    )}
                    {row.original.is_best_seller === 1 && (
                        <Badge variant="amber" className="rounded-sm text-[10px]">
                            {t('common:labels.best-seller')}
                        </Badge>
                    )}
                    {row.original.refill_days > 0 && row.original.is_refill_support === 1 && (
                        <Badge variant="green" className="rounded-sm text-[10px]">
                            {row.original.refill_days} {t('common:labels.day')}
                        </Badge>
                    )}
                    {row.original.is_cancel_support === 1 && (
                        <Badge variant="red" className="rounded-sm text-[10px]">
                            {t('common:labels.cancel')}
                        </Badge>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.id')}</div>
                <div>: {row.original.id}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.created-at')}</div>
                <div className="flex gap-1">
                    :
                    {formatDate({
                        date: row.original.created_at,
                        forHuman: true,
                        isFlex: true,
                    })}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.updated-at')}</div>
                <div className="flex gap-1">
                    :
                    {formatDate({
                        date: row.original.updated_at,
                        forHuman: true,
                        isFlex: true,
                    })}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.category')}</div>
                <div>: {row.original.service_category?.name}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.name')}</div>
                <div>: {row.original.name}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.price')}</div>
                <div>: {formatCurrency(row.original.price)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">
                    {t('common:labels.minimum')} & {t('common:labels.maximum')}
                </div>
                <div>
                    : {formatAmount(row.original.min)} - {formatAmount(row.original.max)}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.average-time')}</div>
                <div className="">
                    : {` `}
                    {!row.original.avg_time ? (
                        <span className="text-destructive">{t('common:empty.no-data-yet')}</span>
                    ) : (
                        <>
                            <span className="text-primary font-medium">{formatDuration(row.original.avg_time)}</span>
                            {/* <span className="text-primary font-medium">{row.original.avg_time}</span> dengan jumlah rata-rata pesanan{' '} */}
                            {/* <span className="text-primary font-medium">{formatAmount(row.original.avg_quantity)}</span> */}
                        </>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.description')}</div>
                <div className="flex flex-row gap-1">
                    <span>:</span>
                    <div
                        style={{
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {toHTML(row.original.description)}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.refill')}</div>
                <div>
                    : {` `}
                    {row.original.is_refill_support == 0 ? (
                        <span className="text-destructive">{t('common:labels.no')}</span>
                    ) : (
                        <span className="text-green-500">
                            {formatAmount(row.original.refill_days)} {t('common:labels.day')}
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.cancel')}</div>
                <div>
                    : {` `}
                    {row.original.is_cancel_support == 0 ? (
                        <span className="text-destructive">{t('common:labels.no')}</span>
                    ) : (
                        <span className="text-green-500">{t('common:labels.yes')}</span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.last-update')}</div>
                <div className="flex items-center gap-1">
                    :
                    {row.original.service_update && (
                        <div className="flex items-center gap-2">
                            {(() => {
                                const type = row.original.service_update.type;
                                const update = serviceUpdateTypes[type];
                                if (!update) return null;
                                const Icon = update.icon;
                                return (
                                    <>
                                        {/* {Icon && (
                                        <Icon
                                            className={`h-4 w-4 text-${update.color}`}
                                        />
                                    )} */}
                                        <span className={update.textColor}>
                                            {t(
                                                row.original.service_update.content_key,
                                                formatContentParams(row.original.service_update.content_params),
                                            )}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    {!row.original.service_update && <span className="text-destructive">{t('common:empty.no-data-yet')}</span>}
                </div>
            </div>
        </div>
    );
}
