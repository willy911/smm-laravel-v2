import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { config, getFile } from '@/lib/utils';

export default function Logo({ form }) {
    return (
        <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="col-span-2">
                {config().icon !== '' && (
                    <div className="mb-4 rounded-lg border py-4">
                        <img src={getFile('website', config().icon)} alt="" className="mx-auto h-32 w-32 rounded-md object-cover" />
                    </div>
                )}
                <div className="grid gap-2">
                    <Label>Favicon</Label>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger className="cursor-pointer" asChild>
                                <Input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .svg, .webp"
                                    onChange={(e) => {
                                        form.setData('website', {
                                            ...form.data.website,
                                            icon: e.target.files[0],
                                        });
                                    }}
                                    onBlur={() => form.validate('website.icon')}
                                    aria-invalid={form.invalid('website.icon')}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                <span>
                                    <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {form.invalid('website.icon') && <InputError message={form.errors['website.icon']} />}
                </div>
            </div>
            <div className="">
                {config().logo_lg_light !== '' && (
                    <div className="mb-4 rounded-lg border py-4">
                        <img src={getFile('website', config().logo_lg_light)} alt="" className="mx-auto h-12 w-80 rounded-md object-cover" />
                    </div>
                )}
                <div className="grid gap-2">
                    <Label>Logo Besar (Terang)</Label>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger className="cursor-pointer" asChild>
                                <Input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .svg, .webp"
                                    onChange={(e) => {
                                        form.setData('website', {
                                            ...form.data.website,
                                            logo_lg_light: e.target.files[0],
                                        });
                                    }}
                                    onBlur={() => form.validate('website.logo_lg_light')}
                                    aria-invalid={form.invalid('website.logo_lg_light')}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                <span>
                                    <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                    <p>* Logo ini digunakan pada latar belakang terang.</p>
                                    <p>* Gunakan warna gelap untuk teks logo, agar kontras dengan latar belakang yang terang.</p>
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {form.invalid('website.logo_lg_light') && <InputError message={form.errors['website.logo_lg_light']} />}
                </div>
            </div>
            <div className="">
                {config().logo_lg_dark !== '' && (
                    <div className="mb-4 rounded-lg border py-4">
                        <img src={getFile('website', config().logo_lg_dark)} alt="" className="mx-auto h-12 w-80 rounded-md object-cover" />
                    </div>
                )}
                <div className="grid gap-2">
                    <Label>Logo Besar (Gelap)</Label>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger className="cursor-pointer" asChild>
                                <Input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .svg, .webp"
                                    onChange={(e) => {
                                        form.setData('website', {
                                            ...form.data.website,
                                            logo_lg_dark: e.target.files[0],
                                        });
                                    }}
                                    onBlur={() => form.validate('website.logo_lg_dark')}
                                    aria-invalid={form.invalid('website.logo_lg_dark')}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                <span>
                                    <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                    <p>* Logo ini digunakan pada latar belakang gelap.</p>
                                    <p>* Gunakan warna terang untuk teks logo, agar kontras dengan latar belakang yang gelap.</p>
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {form.invalid('website.logo_lg_dark') && <InputError message={form.errors['website.logo_lg_dark']} />}
                </div>
            </div>
            <div className="">
                {config().logo_sm_light !== '' && (
                    <div className="mb-4 rounded-lg border py-4">
                        <img src={getFile('website', config().logo_sm_light)} alt="" className="mx-auto h-32 w-32 rounded-md object-cover" />
                    </div>
                )}
                <div className="grid gap-2">
                    <Label>Logo Kecil (Terang)</Label>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger className="cursor-pointer" asChild>
                                <Input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .svg, .webp"
                                    onChange={(e) => {
                                        form.setData('website', {
                                            ...form.data.website,
                                            logo_sm_light: e.target.files[0],
                                        });
                                    }}
                                    onBlur={() => form.validate('website.logo_sm_light')}
                                    aria-invalid={form.invalid('website.logo_sm_light')}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                <span>
                                    <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                    <p>* Logo ini digunakan pada latar belakang terang.</p>
                                    <p>* Gunakan warna gelap untuk teks logo, agar kontras dengan latar belakang yang terang.</p>
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {form.invalid('website.logo_sm_light') && <InputError message={form.errors['website.logo_sm_light']} />}
                </div>
            </div>
            <div className="">
                {config().logo_sm_dark !== '' && (
                    <div className="mb-4 rounded-lg border py-4">
                        <img src={getFile('website', config().logo_sm_dark)} alt="" className="mx-auto h-32 w-32 rounded-md object-cover" />
                    </div>
                )}
                <div className="grid gap-2">
                    <Label>Logo Kecil (Gelap)</Label>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger className="cursor-pointer" asChild>
                                <Input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .svg, .webp"
                                    onChange={(e) => {
                                        form.setData('website', {
                                            ...form.data.website,
                                            logo_sm_dark: e.target.files[0],
                                        });
                                    }}
                                    onBlur={() => form.validate('website.logo_sm_dark')}
                                    aria-invalid={form.invalid('website.logo_sm_dark')}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                <span>
                                    <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                    <p>* Logo ini digunakan pada latar belakang gelap.</p>
                                    <p>* Gunakan warna terang untuk teks logo, agar kontras dengan latar belakang yang gelap.</p>
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {form.invalid('website.logo_sm_dark') && <InputError message={form.errors['website.logo_sm_dark']} />}
                </div>
            </div>
        </div>
    );
}
