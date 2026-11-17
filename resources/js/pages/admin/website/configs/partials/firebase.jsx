import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const DEFAULT_FIREBASE = {
    enabled: false,
    api_key: '',
    project_id: '',
    server_key: '',
    sender_id: '',
    app_id: '',
    measurement_id: '',
    js_sdk_version: '10.12.2',
};

export default function Firebase({ form }) {
    const fb = form.data.firebase ?? DEFAULT_FIREBASE;

    const setFirebase = (field, value) => {
        form.setData('firebase', {
            ...fb,
            [field]: value,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                <div className="space-y-1.5">
                    <Label htmlFor="firebaseEnabled">Aktifkan Firebase</Label>
                </div>
                <Switch
                    id="firebaseEnabled"
                    checked={fb.enabled === true || fb.enabled == '1'}
                    onCheckedChange={(checked) => {
                        form.setData('firebase', {
                            ...fb,
                            enabled: checked,
                        });
                        form.validate('firebase.enabled');
                    }}
                />
            </div>
            <div className="grid gap-2">
                <Label>API Key</Label>
                <Input
                    placeholder="AIza...."
                    value={fb.api_key ?? ''}
                    onChange={(e) => setFirebase('api_key', e.target.value)}
                    onBlur={() => form.validate('firebase.api_key')}
                    aria-invalid={form.invalid('firebase.api_key')}
                />
                {form.invalid('firebase.api_key') && <InputError message={form.errors['firebase.api_key']} />}
            </div>
            <div className="grid gap-2">
                <Label>Project ID</Label>
                <Input
                    placeholder="sited-xxxxxxxx"
                    value={fb.project_id ?? ''}
                    onChange={(e) => setFirebase('project_id', e.target.value)}
                    onBlur={() => form.validate('firebase.project_id')}
                    aria-invalid={form.invalid('firebase.project_id')}
                />
                {form.invalid('firebase.project_id') && <InputError message={form.errors['firebase.project_id']} />}
            </div>
            <div className="grid gap-2">
                <Label>Server Key</Label>
                <Input
                    placeholder="kosongkan bila pakai HTTP v1"
                    value={fb.server_key ?? ''}
                    onChange={(e) => setFirebase('server_key', e.target.value)}
                    onBlur={() => form.validate('firebase.server_key')}
                    aria-invalid={form.invalid('firebase.server_key')}
                />
                {form.invalid('firebase.server_key') && <InputError message={form.errors['firebase.server_key']} />}
            </div>
            <div className="grid gap-2">
                <Label>Sender ID</Label>
                <Input
                    placeholder="hanya angka"
                    value={fb.sender_id ?? ''}
                    onChange={(e) => setFirebase('sender_id', e.target.value.replace(/[^\d]+/g, ''))}
                    onBlur={() => form.validate('firebase.sender_id')}
                    aria-invalid={form.invalid('firebase.sender_id')}
                />
                {form.invalid('firebase.sender_id') && <InputError message={form.errors['firebase.sender_id']} />}
            </div>
            <div className="grid gap-2">
                <Label>App ID</Label>
                <Input
                    placeholder="1:1234567890:android:abcdef"
                    value={fb.app_id ?? ''}
                    onChange={(e) => setFirebase('app_id', e.target.value)}
                    onBlur={() => form.validate('firebase.app_id')}
                    aria-invalid={form.invalid('firebase.app_id')}
                />
                {form.invalid('firebase.app_id') && <InputError message={form.errors['firebase.app_id']} />}
            </div>
            <div className="grid gap-2">
                <Label>Measurement ID</Label>
                <Input
                    placeholder="G-XXXXXXXXXX"
                    value={fb.measurement_id ?? ''}
                    onChange={(e) => setFirebase('measurement_id', e.target.value)}
                    onBlur={() => form.validate('firebase.measurement_id')}
                    aria-invalid={form.invalid('firebase.measurement_id')}
                />
                {form.invalid('firebase.measurement_id') && <InputError message={form.errors['firebase.measurement_id']} />}
            </div>
            <div className="grid gap-2">
                <Label>Versi JS SDK</Label>
                <Input
                    placeholder="10.12.2"
                    value={fb.js_sdk_version ?? ''}
                    onChange={(e) => setFirebase('js_sdk_version', e.target.value.replace(/[^0-9.]+/g, ''))}
                    onBlur={() => form.validate('firebase.js_sdk_version')}
                    aria-invalid={form.invalid('firebase.js_sdk_version')}
                />
                <small className="text-muted-foreground text-xs">
                    Preview URL: https://www.gstatic.com/firebasejs/{fb.js_sdk_version || DEFAULT_FIREBASE.js_sdk_version}/firebase-app.js
                </small>
                {form.invalid('firebase.js_sdk_version') && <InputError message={form.errors['firebase.js_sdk_version']} />}
            </div>
        </div>
    );
}
