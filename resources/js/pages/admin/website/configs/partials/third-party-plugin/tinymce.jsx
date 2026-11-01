import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function TinyMCE({ form }) {
    return (
        <div className="grid gap-2">
            <Label>API Key</Label>
            <Input
                value={form.data.third_party_plugin.tinymce.api_key}
                onChange={(e) => {
                    form.setData('third_party_plugin', {
                        ...form.data.third_party_plugin,
                        tinymce: {
                            ...form.data.third_party_plugin.tinymce,
                            api_key: e.target.value,
                        },
                    });
                }}
                onBlur={() => form.validate('third_party_plugin.tinymce.api_key')}
                aria-invalid={form.invalid('third_party_plugin.tinymce.api_key')}
            />
            {form.invalid('third_party_plugin.tinymce.api_key') && <InputError message={form.errors['third_party_plugin.tinymce.api_key']} />}
        </div>
    );
}
