import { Button } from '@/components/ui/button';
import { depositStatuses } from '@/enums/deposit';
import { cn, createCurrencyFormatter, formatDate } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function DepositDetail({ row }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('deposits');
    // Deposit ditagih memakai kurs beli snapshot saat transaksi dibuat (deposits.kurs_rate);
    // fallback ke kurs locale bila snapshot tidak ada (deposit lama).
    const kursSnapshot = Number(row.original.kurs_rate) > 0 ? Number(row.original.kurs_rate) : null;
    const formatCurrency = createCurrencyFormatter(locales, i18n.language, kursSnapshot);
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
                <div className="font-medium">{t('common:labels.payment-method')}</div>
                <div>: {row.original.payment_method_name}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.amount')}</div>
                <div>: {formatCurrency(row.original.amount)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.bonus')}</div>
                <div>: {formatCurrency(row.original.bonus)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.admin-fee')}</div>
                <div>: {formatCurrency(row.original.admin_fee)}</div>
            </div>
            {row.original.unique_code && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium">{t('deposits:labels.unique-code')}</div>
                    <div>: {formatCurrency(row.original.unique_code)}</div>
                </div>
            )}
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('deposits:labels.total-payment')}</div>
                <div>: {formatCurrency(row.original.total_payment)}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('deposits:labels.total-balance')}</div>
                <div>: {formatCurrency(row.original.total_balance)}</div>
            </div>
            {row.original.status === 'pending' && row.original.payment_gateway_checkout_url && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium">{t('deposits:labels.payment-link')}</div>
                    <div>
                        :{' '}
                        <a
                            href={row.original.payment_gateway_checkout_url}
                            target="_blank"
                            className="text-primary font-medium underline underline-offset-4"
                        >
                            Bayar Disini
                        </a>
                    </div>
                </div>
            )}
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
                    <Button size="sm" variant={depositStatuses[row.original.status].variant} className={cn('flex h-5')}>
                        {t(depositStatuses[row.original.status].label)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
