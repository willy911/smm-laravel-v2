import { cn, formatAmount } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function OrderData({ orderData, type = 'single' }) {
    const { t } = useTranslation();
    if (type === 'single') {
        return (
            <div className="bg-pattern-size mb-2 w-full rounded-lg border bg-green-500/15 bg-[url('/assets/images/bg-pattern.png')] bg-center p-4 text-green-800 dark:text-green-400">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <InfoCircleIcon />
                        <span className="sr-only">{t('common:toast.success')}</span>
                        <h3 className="text-base font-medium">{t('orders:toast.order-created')}</h3>
                    </div>
                </div>
                <div className="mt-2 mb-1 truncate text-sm">
                    <div className="grid items-center">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-0.5">
                            <div className="flex items-center">
                                <CheckboxCircleIcon />
                                <strong>{t('common:labels.id')}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                                <strong>:</strong>
                                {orderData.id}
                            </div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-0.5">
                            <div className="flex items-center">
                                <CheckboxCircleIcon />
                                <strong>{t('common:labels.service')}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                                <strong>:</strong>
                                {orderData.service_name}
                            </div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-0.5">
                            <div className="flex items-center">
                                <CheckboxCircleIcon />
                                <strong>{t('common:labels.target')}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                                <strong>:</strong>
                                {orderData.target}
                            </div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-0.5">
                            <div className="flex items-center">
                                <CheckboxCircleIcon />
                                <strong>{t('common:labels.quantity')}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                                <strong>:</strong>
                                {formatAmount(orderData.quantity)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-pattern-size mb-2 w-full rounded-lg border bg-green-500/15 bg-[url('/assets/images/bg-pattern.png')] bg-center p-4 text-green-800 dark:text-green-400">
            <div className="flex items-center">
                <InfoCircleIcon />
                <span className="sr-only">{t('common:toast.success')}</span>
                <h3 className="text-base font-medium">{t('orders:toast.order-created')}</h3>
            </div>
            <div className="mt-2 mb-1 truncate text-sm">
                <div className="grid items-center">
                    <div className="grid grid-cols-[100px_1fr] items-center gap-0.5">
                        <div className="flex items-center">
                            <CheckboxCircleIcon />
                            <strong>{t('common:labels.service')}</strong>
                        </div>
                        <div className="flex items-center gap-1">
                            <strong>:</strong>
                            {orderData.service_name}
                        </div>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-center gap-0.5">
                        <div className="flex items-center">
                            <CheckboxCircleIcon />
                            <strong>{t('common:labels.total')}</strong>
                        </div>
                        <div className="flex items-center gap-1">
                            <strong>:</strong>
                            {formatAmount(orderData.rows)}
                        </div>
                    </div>
                </div>
                <ul className="list-inside">
                    {orderData.orders.map((order, index) => (
                        <li className={cn('flex items-center', order.type === 'fail' && 'text-red-800')} key={index}>
                            {order.type === 'success' ? (
                                <svg
                                    className="me-2 h-3.5 w-3.5 flex-shrink-0 text-green-800 dark:text-green-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                                </svg>
                            ) : (
                                <svg
                                    className="me-2 h-3.5 w-3.5 flex-shrink-0 text-red-800 dark:text-red-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm2.828 6.586a1 1 0 1 1 1.414 1.414L11.414 10l2.828 2.828a1 1 0 0 1-1.414 1.414L10 11.414l-2.828 2.828a1 1 0 0 1-1.414-1.414L8.586 10 5.757 7.172a1 1 0 0 1 1.414-1.414L10 8.586l2.828-2.828Z" />
                                </svg>
                            )}
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: t(order.label, {
                                        order_id: order.data.order_id,
                                        order_target: order.data.order_target,
                                    }),
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const CheckboxCircleIcon = () => {
    return (
        <svg
            className="me-2 h-3.5 w-3.5 flex-shrink-0 text-green-800 dark:text-green-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
    );
};

const InfoCircleIcon = () => {
    return (
        <svg className="me-2 h-4 w-4 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
    );
};
