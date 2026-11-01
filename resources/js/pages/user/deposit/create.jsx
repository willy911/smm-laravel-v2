import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn, config, createCurrencyFormatter, formatAmount, getFile } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { Loading02Icon, WalletAdd01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DepositDetail from './partials/deposit-detail';

const getBonusFromConfigs = (amount, bonusConfigs = []) => {
    if (!Array.isArray(bonusConfigs) || bonusConfigs.length === 0) return 0;

    const configs = bonusConfigs.map((c) => ({
        min: Number(c.min),
        max: Number(c.max),
        bonus: Number(c.bonus),
    }));

    for (const cfg of configs) {
        if (amount >= cfg.min && amount <= cfg.max) {
            return cfg.bonus;
        }
    }

    const maxValue = Math.max(...configs.map((c) => c.max));
    if (amount > maxValue) {
        return Math.max(...configs.map((c) => c.bonus));
    }

    return 0;
};

export default function Create({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation('deposits');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const [lastDeposit, setLastDeposit] = useState(pageProps?.lastDeposit ?? {});

    const form = useForm('post', route('user.deposits.store'), {
        payment_method: {
            type: '',
            id: '',
            minimum: 0,
            maximum: 0,
            bonus_configs: [],
            admin_fee_type: 0,
            admin_fee_amount: 0,
        },
        deposit: {
            amount: 0,
            display_amount: 0,
            total_payment: 0,
            total_balance: 0,
            phone_number: '',
        },
    });

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => {
                toast({
                    variant: 'error',
                    description: t('common:toast.invalid-input'),
                });
            },
        });
    };

    useEffect(() => {
        setLastDeposit(pageProps?.lastDeposit);
    }, [pageProps?.lastDeposit]);

    useEffect(() => {
        form.reset();
        form.forgetError('deposit.display_amount');
    }, [i18n.language]);

    const computedBonus = useMemo(() => {
        return getBonusFromConfigs(Number(form.data.deposit.amount || 0), form.data.payment_method.bonus_configs);
    }, [form.data.deposit.amount, form.data.payment_method.bonus_configs]);

    return (
        <AppLayout
            pageTitle={cn(
                t('common:actions.create-item', {
                    item: t('common:labels.deposit'),
                }),
            )}
            breadcrumbs={[
                { title: config().name, href: '/' },
                { title: t('common:labels.deposits'), href: '/' },
                { title: t('common:actions.create-item', { item: '' }), href: '/' },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="container mx-auto max-w-2xl">
                    {typeof lastDeposit === 'object' && lastDeposit !== null && Object.keys(lastDeposit).length !== 0 && lastDeposit.created_at ? (
                        <DepositDetail pageProps={pageProps} lastDeposit={lastDeposit} setLastDeposit={setLastDeposit} />
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                            <Card>
                                <CardHeader>
                                    <CardTitle>1. {t('deposits:create.steps.select-payment-method')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" className="space-y-3" collapsible>
                                        {pageProps?.paymentMethods?.map((item, index) => (
                                            <AccordionItem className="bg-input rounded-xl shadow" value={item.value} key={index}>
                                                <AccordionTrigger className="px-4 py-3">{item.label}</AccordionTrigger>
                                                <AccordionContent className="bg-background/50 border-card grid grid-cols-1 gap-4 rounded-b-xl px-3 pt-3 md:grid-cols-2">
                                                    {item.options.map((paymentMethod, index) => {
                                                        const isSelected =
                                                            form.data.payment_method.id === paymentMethod.id && item.value == paymentMethod.type;
                                                        let bonusText = '';
                                                        if (Array.isArray(paymentMethod.bonus_configs) && paymentMethod.bonus_configs.length > 0) {
                                                            const bonusValues = paymentMethod.bonus_configs.map((b) => Number(b.bonus));
                                                            const minBonus = Math.min(...bonusValues);
                                                            const maxBonus = Math.max(...bonusValues);
                                                            bonusText =
                                                                minBonus === maxBonus
                                                                    ? `Bonus ${formatAmount(minBonus)}%`
                                                                    : `Bonus ${formatAmount(minBonus)}–${formatAmount(maxBonus)}%`;
                                                        }
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={index}
                                                                className={cn(
                                                                    'bg-input hover:bg-input/80 relative flex h-16 items-center justify-between overflow-hidden rounded-xl p-4 transition-all duration-200 md:h-20',
                                                                    isSelected && 'ring-primary ring-offset-muted ring-[2.5px] ring-offset-0',
                                                                )}
                                                                onClick={() => {
                                                                    form.setData((data) => {
                                                                        const { id, type, name, minimum, maximum, bonus_configs, admin_fee_configs } =
                                                                            paymentMethod;
                                                                        const amount = Number(minimum);
                                                                        const adminFee = Number(
                                                                            admin_fee_configs.type === 'fixed'
                                                                                ? admin_fee_configs.value
                                                                                : amount * (admin_fee_configs.value / 100),
                                                                        );
                                                                        return {
                                                                            ...data,
                                                                            payment_method: {
                                                                                ...data.payment_method,
                                                                                id,
                                                                                type,
                                                                                name,
                                                                                minimum,
                                                                                maximum,
                                                                                bonus_configs,
                                                                                admin_fee_type: admin_fee_configs.type,
                                                                                admin_fee_amount: admin_fee_configs.value,
                                                                            },
                                                                            deposit: {
                                                                                ...data.deposit,
                                                                                amount,
                                                                                display_amount:
                                                                                    locales.find((item) => item.locale === i18n.language).usd_rate *
                                                                                    minimum,
                                                                                total_balance: amount,
                                                                                total_payment: amount + adminFee,
                                                                            },
                                                                        };
                                                                    });
                                                                    form.forgetError('payment_method.id');
                                                                }}
                                                            >
                                                                <div>
                                                                    <img
                                                                        alt={paymentMethod.name}
                                                                        decoding="async"
                                                                        className="max-w-20 object-contain md:max-w-[90px]"
                                                                        src={getFile('payment-methods', paymentMethod.logo)}
                                                                    />
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="flex flex-col font-medium">
                                                                        {bonusText && <span className="text-xs text-green-600">{bonusText}</span>}
                                                                        <span className="text-xs">
                                                                            {Number(paymentMethod.admin_fee_configs.value) === 0
                                                                                ? t('common:labels.no-admin-fee')
                                                                                : paymentMethod.admin_fee_configs.type === 'fixed'
                                                                                  ? `${t('common:labels.admin-fee')} ${formatCurrency(paymentMethod.admin_fee_configs.value)}`
                                                                                  : `${t('common:labels.admin-fee')} ${formatAmount(paymentMethod.admin_fee_configs.value)}%`}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="bg-primary absolute top-0 right-0 rounded-bl-full p-1 pb-2 pl-2 text-white">
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                            {form.data.payment_method.type === 'e_wallet' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>2. {t('deposits:create.steps.enter-e-wallet-number')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-2 grid gap-2">
                                            <Label>{t('deposits:labels.e-wallet-number')}</Label>
                                            <Input
                                                type="number"
                                                value={form.data.deposit.phone_number}
                                                onChange={(e) =>
                                                    form.setData('deposit', {
                                                        ...form.data.deposit,
                                                        phone_number: e.target.value,
                                                    })
                                                }
                                                onBlur={() => form.validate('deposit.phone_number')}
                                                aria-invalid={form.invalid('deposit.phone_number')}
                                            />
                                            {form.invalid('deposit.phone_number') && <InputError message={form.errors['deposit.phone_number']} />}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {form.data.payment_method.type !== 'e_wallet' ? '2' : '3'}. {t('deposits:create.steps.enter-amount')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {form.data.payment_method.name && (
                                        <Card className="bg-muted border-muted mb-3 border p-3 pt-1 shadow-xs">
                                            <div className="space-y-3">
                                                <table className="mb-2 w-full border-collapse text-sm">
                                                    <tbody>
                                                        <tr className="border-muted/50 border-b">
                                                            <td className="text-muted-foreground w-1/3 py-2">{t('common:labels.minimum')}</td>
                                                            <td className="py-2 text-right font-normal">
                                                                {formatCurrency(form.data.payment_method.minimum)}
                                                            </td>
                                                        </tr>
                                                        <tr className="border-muted/50 border-b">
                                                            <td className="text-muted-foreground py-2">{t('common:labels.maximum')}</td>
                                                            <td className="py-2 text-right font-normal">
                                                                {formatCurrency(form.data.payment_method.maximum)}
                                                            </td>
                                                        </tr>
                                                        <tr className="border-muted/50 border-b">
                                                            <td className="text-muted-foreground py-2">{t('common:labels.admin-fee')}</td>
                                                            <td className="py-2 text-right font-normal">
                                                                {Number(form.data.payment_method.admin_fee_amount) === 0
                                                                    ? t('common:labels.no-admin-fee')
                                                                    : form.data.payment_method.admin_fee_type === 'fixed'
                                                                      ? `${t('common:labels.admin-fee')} ${formatCurrency(form.data.payment_method.admin_fee_amount)}`
                                                                      : `${t('common:labels.admin-fee')} ${formatAmount(form.data.payment_method.admin_fee_amount)}%`}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                {form.data.payment_method.bonus_configs?.length > 0 && (
                                                    <div className="mt-0">
                                                        <span className="text-muted-foreground mb-2 block text-sm">{t('common:labels.bonus')}</span>
                                                        <table className="w-full border-collapse text-sm">
                                                            <tbody>
                                                                {form.data.payment_method.bonus_configs.map((b, index) => {
                                                                    return (
                                                                        <tr key={index} className="border-muted/30 border-b last:border-0">
                                                                            <td className="py-0.5 font-normal">
                                                                                {formatCurrency(b.min)} - {formatCurrency(b.max)}
                                                                            </td>
                                                                            <td className="py-0.5 text-right font-medium text-green-600">
                                                                                +{b.bonus}%
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                    <div className="grid grid-cols-2 items-start gap-4">
                                        <div className="grid gap-2">
                                            <Label isRequired>{t('deposits:labels.deposit-amount')}</Label>
                                            <InputMask
                                                prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                                min={0}
                                                value={form.data.deposit.display_amount}
                                                onValueChange={(values) => {
                                                    const { admin_fee_type, admin_fee_amount, bonus_configs } = form.data.payment_method;
                                                    const rate = locales.find((item) => item.locale === i18n.language).usd_rate;
                                                    const amount = Number((values.floatValue ?? 0) / rate);
                                                    const adminFee =
                                                        admin_fee_type === 'fixed'
                                                            ? Number(admin_fee_amount)
                                                            : amount * (Number(admin_fee_amount) / 100);
                                                    const currentBonus = getBonusFromConfigs(amount, bonus_configs);
                                                    form.setData((data) => ({
                                                        ...data,
                                                        deposit: {
                                                            ...data.deposit,
                                                            amount,
                                                            display_amount: values.floatValue,
                                                            total_balance: amount + amount * (currentBonus / 100),
                                                            total_payment: amount + adminFee,
                                                        },
                                                    }));
                                                }}
                                                onBlur={() => form.validate('deposit.display_amount')}
                                                aria-invalid={form.invalid('deposit.display_amount')}
                                            />
                                            {form.invalid('deposit.display_amount') && <InputError message={form.errors['deposit.display_amount']} />}
                                            {form.invalid('payment_method.id') && <InputError message={form.errors['payment_method.id']} />}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.bonus')}</Label>
                                            <Input value={formatCurrency(form.data.deposit.total_balance - form.data.deposit.amount)} readOnly />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('deposits:labels.total-balance')}</Label>
                                            <Input value={formatCurrency(form.data.deposit.total_balance)} readOnly />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t('deposits:labels.total-payment')}</Label>
                                            <Input value={formatCurrency(form.data.deposit.total_payment)} readOnly />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button size="sm" type="submit" className="flex w-full gap-2" disabled={form.processing}>
                                {!form.processing ? (
                                    <>
                                        <WalletAdd01Icon className="h-4 w-4" /> {t('deposits:create.button')}
                                    </>
                                ) : (
                                    <>
                                        <Loading02Icon className="h-4 w-4 animate-spin" /> {t('common:loading.please-wait')}
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </Deferred>
        </AppLayout>
    );
}
