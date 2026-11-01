import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Midtrans({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Server Key</Label>
                <Input
                    value={form.data.payment_gateway.midtrans.server_key}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            midtrans: {
                                ...form.data.payment_gateway.midtrans,
                                server_key: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.midtrans.server_key')}
                    aria-invalid={form.invalid('payment_gateway.midtrans.server_key')}
                />
                {form.invalid('payment_gateway.midtrans.server_key') && <InputError message={form.errors['payment_gateway.midtrans.server_key']} />}
            </div>
            <div className="grid gap-2">
                <Label>Prefix Callback URL</Label>
                <Input
                    value={form.data.payment_gateway.midtrans.prefix_callback_url}
                    onChange={(e) => {
                        form.setData('payment_gateway', {
                            ...form.data.payment_gateway,
                            midtrans: {
                                ...form.data.payment_gateway.midtrans,
                                prefix_callback_url: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('payment_gateway.midtrans.prefix_callback_url')}
                    aria-invalid={form.invalid('payment_gateway.midtrans.prefix_callback_url')}
                />
                <small className="text-xs">
                    Callback URL: {window.location.origin}/callback/{form.data.payment_gateway.midtrans.prefix_callback_url}
                </small>
                {form.invalid('payment_gateway.midtrans.prefix_callback_url') && (
                    <InputError message={form.errors['payment_gateway.midtrans.prefix_callback_url']} />
                )}
            </div>
        </div>
    );
}
