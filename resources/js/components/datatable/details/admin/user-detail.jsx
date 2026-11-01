import { createCurrencyFormatter, formatAmount } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function UserDetail({ row }) {
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
                <div className="font-medium">{t('common:labels.id')}</div>
                <div>: {row.original.id}</div>
            </div>
        </div>
    );
}
