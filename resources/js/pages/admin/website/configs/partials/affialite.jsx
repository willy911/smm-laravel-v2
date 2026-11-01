import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Affiliate({ form }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation();
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Commission / Deposit</Label>
                <InputMask
                    min={0}
                    suffix=" %"
                    value={form.data.affiliate.commission}
                    onValueChange={(values) => {
                        form.setData((data) => ({
                            ...data,
                            affiliate: {
                                ...data.affiliate,
                                commission: values.floatValue,
                            },
                        }));
                    }}
                    onBlur={() => form.validate(`affiliate.commission`)}
                    aria-invalid={form.invalid(`affiliate.commission`)}
                />
                {form.invalid('affiliate.commission') && <InputError message={form.errors['affiliate.commission']} />}
            </div>
            <div className="grid gap-2">
                <Label>Min. Withdrawal</Label>
                <InputMask
                    min={0}
                    prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                    value={form.data.affiliate.display_min_withdrawal}
                    onValueChange={(values) => {
                        const min_withdrawal = values.floatValue / locales.find((item) => item.locale === i18n.language).usd_rate;
                        form.setData((data) => ({
                            ...data,
                            affiliate: {
                                ...data.affiliate,
                                min_withdrawal,
                                display_min_withdrawal: values.floatValue,
                            },
                        }));
                    }}
                    onBlur={() => form.validate(`affiliate.display_min_withdrawal`)}
                    aria-invalid={form.invalid(`affiliate.display_min_withdrawal`)}
                />
                {form.invalid('affiliate.display_min_withdrawal') && <InputError message={form.errors['affiliate.display_min_withdrawal']} />}
            </div>
        </div>
    );
}
