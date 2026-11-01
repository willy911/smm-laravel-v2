import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Cryptomus({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Merchant UUID</Label>
                <Input
                    value={form.data.payment_gateway.cryptomus.merchant_uuid}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            cryptomus: {
                                ...form.data.payment_gateway.cryptomus,
                                merchant_uuid: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.cryptomus.merchant_uuid')}
                    aria-invalid={form.invalid('payment_gateway.cryptomus.merchant_uuid')}
                />
                {form.invalid('payment_gateway.cryptomus.merchant_uuid') && (
                    <InputError message={form.errors['payment_gateway.cryptomus.merchant_uuid']} />
                )}
            </div>
            <div className="grid gap-2">
                <Label>Payment Key</Label>
                <Input
                    value={form.data.payment_gateway.cryptomus.payment_key}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            cryptomus: {
                                ...form.data.payment_gateway.cryptomus,
                                payment_key: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.cryptomus.payment_key')}
                    aria-invalid={form.invalid('payment_gateway.cryptomus.payment_key')}
                />
                {form.invalid('payment_gateway.cryptomus.payment_key') && (
                    <InputError message={form.errors['payment_gateway.cryptomus.payment_key']} />
                )}
            </div>
            <div className="grid gap-2">
                <Label>Prefix Callback URL</Label>
                <Input
                    value={form.data.payment_gateway.cryptomus.prefix_callback_url}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            cryptomus: {
                                ...form.data.payment_gateway.cryptomus,
                                prefix_callback_url: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.cryptomus.prefix_callback_url')}
                    aria-invalid={form.invalid('payment_gateway.cryptomus.prefix_callback_url')}
                />
                <small className="text-xs">
                    Callback URL: {window.location.origin}/callback/{form.data.payment_gateway.cryptomus.prefix_callback_url}
                </small>
                {form.invalid('payment_gateway.cryptomus.prefix_callback_url') && (
                    <InputError message={form.errors['payment_gateway.cryptomus.prefix_callback_url']} />
                )}
            </div>
        </div>
    );
}
