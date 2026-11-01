import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { depositStatuses } from '@/enums/deposit';
import { toast } from '@/hooks/use-toast';
import { cn, copyText, createCurrencyFormatter, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Copy01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DepositDetail({ pageProps, lastDeposit, setLastDeposit, paymentTarget = {}, paymentGuides = [] }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('deposits');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [timeLeft, setTimeLeft] = useState({});
    const Icon = depositStatuses[lastDeposit.status].icon;

    const handleSwitch = async (id, columnName, columnValue) => {
        try {
            const response = await axios.post(
                route('user.deposits.switch', {
                    target: id,
                    columnName,
                    columnValue,
                }),
            );
            setLastDeposit({});
            toast({
                variant: 'success',
                description: toHTML(response.data.message),
            });
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        }
    };

    useEffect(() => {
        if (typeof lastDeposit === 'object' && lastDeposit !== null && Object.keys(lastDeposit).length !== 0 && lastDeposit.created_at) {
            const initialDate = new Date(lastDeposit.created_at);
            const targetDate = new Date(initialDate);
            targetDate.setHours(targetDate.getHours() + 3);

            const countdown = setInterval(() => {
                const now = Date.now();
                const difference = targetDate.getTime() - now;

                if (difference <= 0) {
                    clearInterval(countdown);
                    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                } else {
                    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((difference / (1000 * 60)) % 60);
                    const seconds = Math.floor((difference / 1000) % 60);

                    setTimeLeft({ hours, minutes, seconds });
                }
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [lastDeposit]);

    useEffect(() => {
        setLastDeposit(pageProps?.lastDeposit);
    }, [pageProps?.lastDeposit]);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-12">
                <Card className="backface-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('deposits:labels.complete-payment')}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                        <div>
                            <dl className="space-y-4 py-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('common:labels.id')}</dt>
                                    <dd className="text-foreground flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="flex h-5 gap-1 px-2"
                                            onClick={() => copyText(lastDeposit.id, t)}
                                        >
                                            <Copy01Icon className="h-3 w-3" />
                                            {t('common:actions.copy-item', {
                                                item: '',
                                            })}
                                        </Button>
                                        {lastDeposit.id}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('common:labels.payment-method')}</dt>
                                    <dd className="text-foreground">{lastDeposit.payment_method_name}</dd>
                                </div>
                                {lastDeposit.is_manual === '0' && lastDeposit.status === 'pending' && paymentTarget.virtual_account !== undefined && (
                                    <div className="flex justify-between">
                                        <dt className="text-foreground font-medium">
                                            {t('deposits:labels.virtual-account-number')}/{t('deposits:labels.payment-code')}
                                        </dt>
                                        <dd className="text-foreground flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="flex h-5 gap-1 px-2"
                                                onClick={() => copyText(paymentTarget.virtual_account, t)}
                                            >
                                                <Copy01Icon className="h-3 w-3" />
                                                {t('common:actions.copy-item', {
                                                    item: '',
                                                })}
                                            </Button>
                                            {paymentTarget.virtual_account}
                                        </dd>
                                    </div>
                                )}
                                {lastDeposit.is_manual === '0' && lastDeposit.status === 'pending' && paymentTarget.payment_code !== undefined && (
                                    <div className="flex justify-between">
                                        <dt className="text-foreground font-medium">{t('deposits:labels.payment-code')}</dt>
                                        <dd className="text-foreground flex gap-2">
                                            <Button
                                                size="xs"
                                                variant="default"
                                                className="flex gap-1 px-2"
                                                onClick={() => copyText(paymentTarget.payment_code, t)}
                                            >
                                                <Copy01Icon className="h-3 w-3" />
                                                {t('common:actions.copy-item', {
                                                    item: '',
                                                })}
                                            </Button>
                                            {paymentTarget.payment_code}
                                        </dd>
                                    </div>
                                )}
                                {lastDeposit.is_manual === 1 && lastDeposit.status === 'pending' && lastDeposit.payment_information !== undefined && (
                                    <div className="flex justify-between">
                                        <dt className="text-foreground font-medium">{t('deposits:labels.payment-target')}</dt>
                                        <dd className="text-foreground flex gap-2">
                                            <Button
                                                size="xs"
                                                variant="default"
                                                className="flex gap-1 px-2"
                                                onClick={() => copyText(lastDeposit.payment_information, t)}
                                            >
                                                <Copy01Icon className="h-3 w-3" />
                                                {t('common:actions.copy-item', {
                                                    item: '',
                                                })}
                                            </Button>
                                            {lastDeposit.payment_information}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('deposits:labels.deposit-amount')}</dt>
                                    <dd className="text-foreground">{formatCurrency(lastDeposit.amount)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('deposits:labels.unique-code')}</dt>
                                    <dd className="text-foreground">{formatCurrency(lastDeposit.unique_code)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('common:labels.bonus')}</dt>
                                    <dd className="text-foreground">{formatCurrency(lastDeposit.bonus)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('common:labels.admin-fee')}</dt>
                                    <dd className="text-foreground">{formatCurrency(lastDeposit.admin_fee)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('deposits:labels.total-balance')}</dt>
                                    <dd className="text-foreground">{formatCurrency(lastDeposit.total_balance)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground font-medium">{t('deposits:labels.payment-status')}</dt>
                                    <dd>
                                        <Button size="sm" variant={depositStatuses[lastDeposit.status].variant} className={cn('flex h-6')}>
                                            <Icon className="h-4 w-4" />
                                            {t(depositStatuses[lastDeposit.status].label)}
                                        </Button>
                                    </dd>
                                </div>
                                {lastDeposit.is_manual === '0' &&
                                    lastDeposit.status === 'pending' &&
                                    paymentTarget.e_wallet_checkout_url !== undefined && (
                                        <div className="flex justify-between">
                                            <dt className="text-foreground font-medium">{t('deposits:labels.payment-link')}</dt>
                                            <dd className="text-foreground">
                                                <Button
                                                    size="sm"
                                                    className="ml-auto h-6 lg:flex"
                                                    onClick={() => window.open(paymentTarget.e_wallet_checkout_url, '_blank')}
                                                >
                                                    Bayar Disini
                                                </Button>
                                            </dd>
                                        </div>
                                    )}
                                {lastDeposit.is_manual == '0' &&
                                    lastDeposit.status === 'pending' &&
                                    lastDeposit.payment_gateway_checkout_url !== null && (
                                        <div className="flex justify-between">
                                            <dt className="text-foreground font-medium">{t('deposits:labels.payment-link')}</dt>
                                            <dd className="text-foreground">
                                                <Button
                                                    size="sm"
                                                    className="ml-auto h-6 lg:flex"
                                                    onClick={() => window.open(lastDeposit.payment_gateway_checkout_url, '_blank')}
                                                >
                                                    Bayar Disini
                                                </Button>
                                            </dd>
                                        </div>
                                    )}
                                {lastDeposit.is_manual === '0' && lastDeposit.status === 'pending' && paymentTarget.qr_content !== undefined && (
                                    <div className="flex justify-between">
                                        <dt className="text-foreground font-medium">{t('deposits:labels.qr-code')}</dt>
                                        <dd className="text-foreground">
                                            <Button size="sm" className="ml-auto h-6 lg:flex" onClick={() => setOpenDialogQr(true)}>
                                                {t('deposits:labels.click-here')}
                                            </Button>
                                        </dd>
                                    </div>
                                )}
                                {lastDeposit.is_manual === '0' && lastDeposit.status === 'pending' && paymentGuides.length > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-foreground font-medium">{t('deposits:labels.how-to-pay')}</dt>
                                        <dd className="text-foreground">
                                            <Button size="sm" className="ml-auto h-6 lg:flex" onClick={() => setOpenDialog(true)}>
                                                {t('deposits:labels.pay-here')}
                                            </Button>
                                        </dd>
                                    </div>
                                )}
                                {lastDeposit.status === 'pending' && timeLeft.hours && timeLeft.minutes && timeLeft.seconds ? (
                                    <div className="flex justify-between text-red-600">
                                        <dt className="font-medium">{t('deposits:labels.expires-in')}</dt>
                                        <dd>
                                            {t('deposits:labels.expires-text', {
                                                hours: timeLeft.hours,
                                                minutes: timeLeft.minutes,
                                                seconds: timeLeft.seconds,
                                            })}
                                        </dd>
                                    </div>
                                ) : (
                                    ''
                                )}
                            </dl>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-3 text-lg font-semibold">
                        <div className="flex w-full items-center justify-between">
                            <span>{t('deposits:labels.total-payment')}</span>
                            <span>{formatCurrency(lastDeposit.total_payment)}</span>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" type="button">
                                    {t('deposits:detail.button')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('deposits:detail.cancel-dialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {toHTML(t('deposits:detail.cancel-dialog.description', { deposit_id: lastDeposit.id }))}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel>{t('deposits:detail.cancel-dialog.cancel-button')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSwitch(lastDeposit.id, 'status', 'canceled')}>
                                        {t('deposits:detail.cancel-dialog.confirm-button')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
