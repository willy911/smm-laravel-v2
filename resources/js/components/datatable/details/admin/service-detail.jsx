import { Badge } from '@/components/ui/badge';
import { serviceTypes } from '@/enums/service';
import { createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function AdminServiceDetail({ row }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('admin/services');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const originalPrice = Number(row.original.original_price ?? 0);
    const sellPrice = Number(row.original.price ?? 0);
    const profit = Number(row.original.profit ?? 0);

    return (
        <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium"></div>
                <div className="ml-1 flex w-full flex-wrap gap-2">
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
                    {row.original.is_refill_support === 1 && (
                        <Badge variant="green" className="rounded-sm text-[10px]">
                            {t('common:labels.refill')} {row.original.refill_days > 0 ? `${formatAmount(row.original.refill_days)} ${t('common:labels.day')}` : ''}
                        </Badge>
                    )}
                    {row.original.is_cancel_support === 1 && (
                        <Badge variant="red" className="rounded-sm text-[10px]">
                            {t('common:labels.cancel')}
                        </Badge>
                    )}
                    {row.original.is_auto_update_price === 1 && (
                        <Badge variant="outline" className="rounded-sm text-[10px]">
                            auto update price
                        </Badge>
                    )}
                    {row.original.is_manual_profit === 1 && (
                        <Badge variant="outline" className="rounded-sm text-[10px]">
                            manual profit
                        </Badge>
                    )}
                </div>
                <div className="font-medium">{t('common:labels.id')}</div>
                <div>: {row.original.id}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.created-at')}</div>
                <div>: {formatDate({ date: row.original.created_at, forHuman: true, isFlex: true })}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.updated-at')}</div>
                <div>: {formatDate({ date: row.original.updated_at, forHuman: true, isFlex: true })}</div>
            </div>
            {row.original.deleted_at && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium text-destructive">Trashed</div>
                    <div>: {formatDate({ date: row.original.deleted_at, forHuman: true, isFlex: true })}</div>
                </div>
            )}
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('admin/common:labels.provider')}</div>
                <div>: {row.original.service_provider?.name ?? '-'} (ID {row.original.service_provider_id})</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('admin/services:labels.api-service-id')}</div>
                <div>: {row.original.service_provider_service_id}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.category')}</div>
                <div>: {row.original.service_category?.name ?? '-'}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.name')}</div>
                <div style={{ whiteSpace: 'pre-line' }}>: {row.original.name}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('admin/common:labels.original-price')}</div>
                <div>: {formatCurrency(originalPrice)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('admin/common:labels.sell-price')}</div>
                <div>: {formatCurrency(sellPrice)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('admin/common:labels.profit-value')}</div>
                <div>
                    : {formatCurrency(profit)} ({originalPrice > 0 ? `${formatAmount((profit / originalPrice) * 100)}%` : '-'})
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">
                    {t('common:labels.minimum')} & {t('common:labels.maximum')}
                </div>
                <div>: {formatAmount(row.original.min)} - {formatAmount(row.original.max)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.description')}</div>
                <div className="flex flex-row gap-1">
                    <span>:</span>
                    <div style={{ whiteSpace: 'pre-line' }}>
                        {toHTML(row.original.description)}
                    </div>
                </div>
            </div>
        </div>
    );
}
