import { cn, formatAmount } from '@/lib/utils';
import { CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, Loading03Icon, ShoppingBag01Icon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';

export default function OrderSummary({ selectedService }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-2 rounded-xl border p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {[
                    {
                        label: t('common:summary.total'),
                        icon: <ShoppingBag01Icon className="text-primary h-6 w-6" />,
                        value: `${formatAmount(selectedService.summary.total.count)} ${t('common:labels.orders')}`,
                        percent: '',
                        bg: 'bg-gradient-to-b to-0% from-primary to-accent',
                        text: 'text-primary',
                    },
                    {
                        label: t('common:summary.pending'),
                        icon: <Clock05Icon className="h-6 w-6 text-yellow-500" />,
                        value: `${formatAmount(selectedService.summary.pending.count)} ${t('common:labels.orders')}`,
                        percent: `${Math.round(selectedService.summary.pending.percentage)}%`,
                        bg: 'bg-gradient-to-b to-0% from-yellow-100 to-accent',
                        text: 'text-yellow-600',
                    },
                    {
                        label: t('common:summary.processing'),
                        icon: <Loading03Icon className="h-6 w-6 text-blue-600" />,
                        value: `${formatAmount(selectedService.summary.processing.count)} ${t('common:labels.orders')}`,
                        percent: `${Math.round(selectedService.summary.processing.percentage)}%`,
                        bg: 'bg-gradient-to-b to-0% from-blue-100 to-accent',
                        text: 'text-blue-600',
                    },
                    {
                        label: t('common:summary.success'),
                        icon: <CheckmarkCircle01Icon className="h-6 w-6 text-green-600" />,
                        value: `${formatAmount(selectedService.summary.completed.count)} ${t('common:labels.orders')}`,
                        percent: `${Math.round(selectedService.summary.completed.percentage)}%`,
                        bg: 'bg-gradient-to-b to-0% from-green-100 to-accent',
                        text: 'text-green-600',
                    },
                    {
                        label: t('common:summary.fail'),
                        icon: <CancelCircleIcon className="h-6 w-6 text-red-600" />,
                        value: `${formatAmount(selectedService.summary.failed.count)} ${t('common:labels.orders')}`,
                        percent: `${Math.round(selectedService.summary.failed.percentage)}%`,
                        bg: 'bg-gradient-to-b to-0% from-red-100 to-accent',
                        text: 'text-red-600',
                    },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className={cn(
                            `flex items-center justify-between rounded-xl p-4 shadow-sm ${stat.bg}`,
                            stat.label === 'Total' && 'sm:col-span-2',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-transparent p-2 shadow-inner">{stat.icon}</div>
                            <div>
                                <div className={cn('text-sm font-semibold', stat.text)}>{stat.label}</div>
                                <div className={cn('text-xs', stat.text)}>
                                    {stat.percent} ({stat.value})
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
