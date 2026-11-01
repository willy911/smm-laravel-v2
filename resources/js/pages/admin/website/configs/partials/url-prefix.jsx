import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function URLPrefix({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Prefix Admin URL</Label>
                <Input
                    value={form.data.prefix.admin_url}
                    onChange={(e) => {
                        form.setData('prefix', {
                            ...form.data.prefix,
                            admin_url: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('prefix.admin_url')}
                    aria-invalid={form.invalid('prefix.admin_url')}
                />
                <small className="text-xs">
                    Admin URL: {window.location.origin}/{form.data.prefix.admin_url}
                </small>
                {form.invalid('prefix.admin_url') && <InputError message={form.errors['prefix.admin_url']} />}
            </div>
            <div className="grid gap-2">
                <Label>Prefix Notif Forwarder Callback URL</Label>
                <Input
                    value={form.data.prefix.notif_forward}
                    onChange={(e) => {
                        form.setData('prefix', {
                            ...form.data.prefix,
                            notif_forward: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('prefix.notif_forward')}
                    aria-invalid={form.invalid('prefix.notif_forward')}
                />
                <small className="text-xs">
                    Callback URL: {window.location.origin}/callback/{form.data.prefix.notif_forward}
                </small>
                <small className="text-xs">
                    Download App:{' '}
                    <a
                        href="https://apkpure.com/id/push-notification-forward-http/com.jojoagogogo.nf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                    >
                        https://apkpure.com/id/push-notification-forward-http/com.jojoagogogo.nf
                    </a>
                </small>
                {form.invalid('prefix.notif_forward') && <InputError message={form.errors['prefix.notif_forward']} />}
            </div>
        </div>
    );
}
