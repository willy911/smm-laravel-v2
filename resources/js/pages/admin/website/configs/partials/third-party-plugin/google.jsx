import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Google({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Google Tags Manager</Label>
                <Textarea
                    className="h-[250px]"
                    value={form.data.third_party_plugin.google.tags}
                    onChange={(e) => {
                        form.setData('third_party_plugin', {
                            ...form.data.third_party_plugin,
                            google: {
                                ...form.data.third_party_plugin.google,
                                tags: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('third_party_plugin.google.tags')}
                    aria-invalid={form.invalid('third_party_plugin.google.tags')}
                    rows="5"
                />
                {form.invalid('third_party_plugin.google.tags') && <InputError message={form.errors['third_party_plugin.google.tags']} />}
            </div>
            <div className="grid gap-2">
                <Label>Google Search Console Token</Label>
                <Input
                    value={form.data.third_party_plugin.google.token}
                    onChange={(e) => {
                        form.setData('third_party_plugin', {
                            ...form.data.third_party_plugin,
                            google: {
                                ...form.data.third_party_plugin.google,
                                token: e.target.value,
                            },
                        });
                    }}
                    onBlur={() => form.validate('third_party_plugin.google.token')}
                    aria-invalid={form.invalid('third_party_plugin.google.token')}
                />
                {form.invalid('third_party_plugin.google.token') && <InputError message={form.errors['third_party_plugin.google.token']} />}
            </div>
        </div>
    );
}
