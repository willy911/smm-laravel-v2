import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Crisp({ form }) {
    return (
        <div className="grid gap-2">
            <Label>Website ID</Label>
            <Input
                value={form.data.third_party_plugin.crisp.website_id}
                onChange={(e) => {
                    form.setData('third_party_plugin', {
                        ...form.data.third_party_plugin,
                        crisp: {
                            ...form.data.third_party_plugin.crisp,
                            website_id: e.target.value,
                        },
                    });
                }}
                onBlur={() => form.validate('third_party_plugin.crisp.website_id')}
                aria-invalid={form.invalid('third_party_plugin.crisp.website_id')}
            />
            {form.invalid('third_party_plugin.crisp.website_id') && <InputError message={form.errors['third_party_plugin.crisp.website_id']} />}
        </div>
    );
}
