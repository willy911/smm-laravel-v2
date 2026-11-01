import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

export default function Social({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Whatsapp</Label>
                <Input
                    placeholder="6285349680016"
                    value={form.data.social.whatsapp}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            whatsapp: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.whatsapp')}
                    aria-invalid={form.invalid('social.whatsapp')}
                />
                {form.invalid('social.whatsapp') && <InputError message={form.errors['social.whatsapp']} />}
            </div>
            <div className="grid gap-2">
                <Label>Facebook</Label>
                <Input
                    placeholder="jhondelton"
                    value={form.data.social.facebook}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            facebook: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.facebook')}
                    aria-invalid={form.invalid('social.facebook')}
                />
                {form.invalid('social.facebook') && <InputError message={form.errors['social.facebook']} />}
            </div>
            <div className="grid gap-2">
                <Label>Instagram</Label>
                <Input
                    placeholder="jhondelton"
                    value={form.data.social.instagram}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            instagram: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.instagram')}
                    aria-invalid={form.invalid('social.instagram')}
                />
                {form.invalid('social.instagram') && <InputError message={form.errors['social.instagram']} />}
            </div>
            <div className="grid gap-2">
                <Label>TikTok</Label>
                <Input
                    placeholder="jhondelton"
                    value={form.data.social.tiktok}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            tiktok: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.tiktok')}
                    aria-invalid={form.invalid('social.tiktok')}
                />
                {form.invalid('social.tiktok') && <InputError message={form.errors['social.tiktok']} />}
            </div>
            <div className="grid gap-2">
                <Label>Telegram</Label>
                <Input
                    placeholder="jhondelton"
                    value={form.data.social.telegram}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            telegram: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.telegram')}
                    aria-invalid={form.invalid('social.telegram')}
                />
                {form.invalid('social.telegram') && <InputError message={form.errors['social.telegram']} />}
            </div>
            <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                    type="email"
                    placeholder="jhondelton@jhonroot.dev"
                    value={form.data.social.email}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            email: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.email')}
                    aria-invalid={form.invalid('social.email')}
                />
                {form.invalid('social.email') && <InputError message={form.errors['social.email']} />}
            </div>
            <div className="grid gap-2">
                <Label>Google Maps</Label>
                <Input
                    type="url"
                    placeholder="https://maps.app.goo.gl/xxxxx"
                    value={form.data.social.google_maps}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            google_maps: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.google_maps')}
                    aria-invalid={form.invalid('social.google_maps')}
                />
                {form.invalid('social.google_maps') && <InputError message={form.errors['social.google_maps']} />}
            </div>
            <div className="grid gap-2">
                <Label>Whatsapp Channel</Label>
                <Input
                    type="url"
                    placeholder="https://wa.me/xxxxx"
                    value={form.data.social.whatsapp_channel}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            whatsapp_channel: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.whatsapp_channel')}
                    aria-invalid={form.invalid('social.whatsapp_channel')}
                />
                {form.invalid('social.whatsapp_channel') && <InputError message={form.errors['social.whatsapp_channel']} />}
            </div>
            <div className="grid gap-2">
                <Label>Telegram Channel</Label>
                <Input
                    type="url"
                    placeholder="https://t.me/xxxxx"
                    value={form.data.social.telegram_channel}
                    onChange={(e) => {
                        form.setData('social', {
                            ...form.data.social,
                            telegram_channel: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('social.telegram_channel')}
                    aria-invalid={form.invalid('social.telegram_channel')}
                />
                {form.invalid('social.telegram_channel') && <InputError message={form.errors['social.telegram_channel']} />}
            </div>
        </div>
    );
}
