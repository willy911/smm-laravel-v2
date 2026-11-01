import { Button } from '@/components/ui/button';
import { orderStatuses } from '@/enums/order';
import { cn, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function OrderDetail({ row }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('orders');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    return (
        <div className="space-y-2 text-sm">
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
                <div className="font-medium">{t('common:labels.user')}</div>
                <div>: {row.original.user?.username}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.service')}</div>
                <div>
                    : #{row.original.service_id} - {row.original.service ? row.original.service.name : row.original.service_name}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.target')}</div>
                <div>: {row.original.target}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.quantity')}</div>
                <div>: {formatAmount(row.original.quantity)}</div>
            </div>
            {row.original.additional_input && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium">{row.original.additional_input.label}</div>
                    <div>
                        :{' '}
                        <span
                            style={{
                                whiteSpace: 'pre-line',
                            }}
                        >
                            {toHTML(row.original.additional_input.value)}
                        </span>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.start-count')}</div>
                <div>: {formatAmount(row.original.start_count)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.remains')}</div>
                <div>: {formatAmount(row.original.remains)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.price')}</div>
                <div>: {formatCurrency(row.original.price)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.initial-balance')}</div>
                <div>: {formatCurrency(row.original.initial_balance)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.final-balance')}</div>
                <div>: {formatCurrency(row.original.final_balance)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.ip-address')}</div>
                <div>: {row.original.ip_address}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.user-agent')}</div>
                <div>: {row.original.user_agent}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.status')}</div>
                <div className="flex items-center gap-1">
                    :
                    <Button size="sm" variant={orderStatuses[row.original.status].variant} className={cn('flex h-5')}>
                        {t(orderStatuses[row.original.status].label)}
                    </Button>
                </div>
            </div>
            {/* {['partial', 'canceled', 'error'].includes(row.original.status) && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium">{t('common:labels.refund')}</div>
                    <div className="flex items-center gap-1">
                        :{' '}
                        <Button
                            size="sm"
                            variant={cn(row.original.is_refunded === 1 && 'success', row.original.is_refunded === 0 && 'destructive')}
                            className={cn('flex h-5')}
                        >
                            {orderRefundStatuses[row.original.is_refunded].label}
                        </Button>
                    </div>
                </div>
            )} */}
        </div>
    );
}
