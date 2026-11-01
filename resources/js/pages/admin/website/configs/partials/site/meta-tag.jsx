import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { config, getFile } from '@/lib/utils';

export default function MetaTag({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label>Meta Tags (Kata Kunci/Keyword)</Label>
                <Textarea
                    className="min-h-[150px]"
                    value={form.data.website.meta_keywords}
                    onChange={(e) => {
                        form.setData('website', {
                            ...form.data.website,
                            meta_keywords: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('website.meta_keywords')}
                    aria-invalid={form.invalid('website.meta_keywords')}
                    rows="5"
                />
                {form.invalid('website.meta_keywords') && <InputError message={form.errors['website.meta_keywords']} />}
            </div>
            <div className="grid gap-2">
                <Label>Meta Tags (Deskripsi/Description)</Label>
                <Textarea
                    className="min-h-[150px]"
                    value={form.data.website.meta_description}
                    onChange={(e) => {
                        form.setData('website', {
                            ...form.data.website,
                            meta_description: e.target.value,
                        });
                    }}
                    onBlur={() => form.validate('website.meta_description')}
                    aria-invalid={form.invalid('website.meta_description')}
                    rows="5"
                />
                {form.invalid('website.meta_description') && <InputError message={form.errors['website.meta_description']} />}
            </div>
            {config().meta_image !== '' && (
                <div className="mb-4 rounded-lg border py-4">
                    <img src={getFile('website', config().meta_image)} alt="" className="mx-auto h-32 w-32 rounded-md object-cover" />
                </div>
            )}
            <div className="grid gap-2">
                <Label>Meta Tag (Gambar/Image)</Label>
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger className="cursor-pointer" asChild>
                            <Input
                                type="file"
                                accept=".png, .jpg, .jpeg, .svg, .webp"
                                onChange={(e) => {
                                    form.setData('website', {
                                        ...form.data.website,
                                        meta_image: e.target.files[0],
                                    });
                                }}
                                onBlur={() => form.validate('website.meta_image')}
                                aria-invalid={form.invalid('website.meta_image')}
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                            <span>
                                <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                            </span>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {form.invalid('website.meta_image') && <InputError message={form.errors['website.meta_image']} />}
            </div>
        </div>
    );
}
