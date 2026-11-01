import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Duitku({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Merchant ID</Label>
                <Input
                    value={form.data.payment_gateway.duitku.merchant_id}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            duitku: {
                                ...form.data.payment_gateway.duitku,
                                merchant_id: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.duitku.merchant_id')}
                    aria-invalid={form.invalid('payment_gateway.duitku.merchant_id')}
                />
                {form.invalid('payment_gateway.duitku.merchant_id') && <InputError message={form.errors['payment_gateway.duitku.merchant_id']} />}
            </div>
            <div className="grid gap-2">
                <Label>API Key</Label>
                <Input
                    value={form.data.payment_gateway.duitku.api_key}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            duitku: {
                                ...form.data.payment_gateway.duitku,
                                api_key: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.duitku.api_key')}
                    aria-invalid={form.invalid('payment_gateway.duitku.api_key')}
                />
                {form.invalid('payment_gateway.duitku.api_key') && <InputError message={form.errors['payment_gateway.duitku.api_key']} />}
            </div>
            <div className="grid gap-2">
                <Label>Prefix Callback URL</Label>
                <Input
                    value={form.data.payment_gateway.duitku.prefix_callback_url}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            duitku: {
                                ...form.data.payment_gateway.duitku,
                                prefix_callback_url: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.duitku.prefix_callback_url')}
                    aria-invalid={form.invalid('payment_gateway.duitku.prefix_callback_url')}
                />
                <small className="text-xs">
                    Callback URL: {window.location.origin}/callback/{form.data.payment_gateway.duitku.prefix_callback_url}
                </small>
                {form.invalid('payment_gateway.duitku.prefix_callback_url') && (
                    <InputError message={form.errors['payment_gateway.duitku.prefix_callback_url']} />
                )}
            </div>
        </div>
    );
}
