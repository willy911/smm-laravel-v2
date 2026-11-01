import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Main({ form }) {
    return (
        <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
                <Label>Nama</Label>
                <Input
                    value={form.data.website.name}
                    onChange={(e) => {
                        form.setData('website', {
                            ...form.data.website,
                            name: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('website.name')}
                    aria-invalid={form.invalid('website.name')}
                />
                {form.invalid('website.name') && <InputError message={form.errors['website.name']} />}
            </div>
            <div className="grid gap-2">
                <Label>Sub Nama</Label>
                <Input
                    value={form.data.website.sub_name}
                    onChange={(e) => {
                        form.setData('website', {
                            ...form.data.website,
                            sub_name: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('website.sub_name')}
                    aria-invalid={form.invalid('website.sub_name')}
                />
                {form.invalid('website.sub_name') && <InputError message={form.errors['website.sub_name']} />}
            </div>
        </div>
    );
}
