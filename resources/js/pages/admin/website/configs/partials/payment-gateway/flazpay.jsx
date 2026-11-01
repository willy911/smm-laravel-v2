import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Flazpay({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Merchant ID</Label>
                <Input
                    value={form.data.payment_gateway.flazpay.merchant_id}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            flazpay: {
                                ...form.data.payment_gateway.flazpay,
                                merchant_id: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.flazpay.merchant_id')}
                    aria-invalid={form.invalid('payment_gateway.flazpay.merchant_id')}
                />
                {form.invalid('payment_gateway.flazpay.merchant_id') && (
                    <InputError message={form.errors['payment_gateway.flazpay.merchant_id']} />
                )}
            </div>
            <div className="grid gap-2">
                <Label>Client ID</Label>
                <Input
                    value={form.data.payment_gateway.flazpay.client_id}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            flazpay: {
                                ...form.data.payment_gateway.flazpay,
                                client_id: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.flazpay.client_id')}
                    aria-invalid={form.invalid('payment_gateway.flazpay.client_id')}
                />
                {form.invalid('payment_gateway.flazpay.client_id') && (
                    <InputError message={form.errors['payment_gateway.flazpay.client_id']} />
                )}
            </div>
            <div className="grid gap-2">
                <Label>Client Secret</Label>
                <Input
                    value={form.data.payment_gateway.flazpay.client_secret}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            flazpay: {
                                ...form.data.payment_gateway.flazpay,
                                client_secret: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.flazpay.client_secret')}
                    aria-invalid={form.invalid('payment_gateway.flazpay.client_secret')}
                />
                {form.invalid('payment_gateway.flazpay.client_secret') && (
                    <InputError message={form.errors['payment_gateway.flazpay.client_secret']} />
                )}
            </div>
            <div className="grid gap-2">
                <Label>Prefix Callback URL</Label>
                <Input
                    value={form.data.payment_gateway.flazpay.prefix_callback_url}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            flazpay: {
                                ...form.data.payment_gateway.flazpay,
                                prefix_callback_url: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.flazpay.prefix_callback_url')}
                    aria-invalid={form.invalid('payment_gateway.flazpay.prefix_callback_url')}
                />
                <small className="text-xs">
                    Callback URL: {window.location.origin}/callback/{form.data.payment_gateway.flazpay.prefix_callback_url}
                </small>
                {form.invalid('payment_gateway.flazpay.prefix_callback_url') && (
                    <InputError message={form.errors['payment_gateway.flazpay.prefix_callback_url']} />
                )}
            </div>
        </div>
    );
}
