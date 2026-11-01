import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import TextEditor from '@/components/ui/text-editor';

const platforms = [
    'instagram',
    'youtube',
    'facebook',
    'twitter',
    'tiktok',
    'shopee',
    'website',
    'discord',
    'soundcloud',
    'spotify',
    'telegram',
    'snapchat',
    'linkedin',
    'pinterest',
];

export default function OrderExampleTarget({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                {platforms.map((platform) => (
                    <div key={platform} className="grid gap-2 border-b pb-4">
                        <Label className="capitalize">{platform}</Label>

                        <TextEditor
                            value={form.data.order_example_target?.[platform] ?? ''}
                            onEditorChange={(value) => {
                                form.setData((data) => ({
                                    ...data,
                                    order_example_target: {
                                        ...data.order_example_target,
                                        [platform]: value,
                                    },
                                }));
                            }}
                        />

                        {form.invalid(`order_example_target.${platform}`) && <InputError message={form.errors[`order_example_target.${platform}`]} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
