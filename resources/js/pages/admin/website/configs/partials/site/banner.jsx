import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { config, getFile, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Fragment } from 'react/jsx-runtime';

export default function Banner({ form }) {
    const websiteConfig = config();
    const confirmDeletion = async ({ label, columnKey, columnValue, index = null }) => {
        await axios
            .delete(
                route('admin.websites.configs.destroy', {
                    columnKey,
                    columnValue,
                }),
            )
            .then((response) => {
                if (!response.data.status) {
                    toast({
                        variant: 'error',
                        description: toHTML(response.data.message),
                    });
                    return;
                }

                if (index !== null) {
                    const currentData = Object.values(form.data[columnKey] || {}).map((rawItem) => {
                        return typeof rawItem === 'string' ? { file: rawItem, link: '' } : rawItem;
                    });
                    currentData.splice(index, 1);
                    form.setData(
                        columnKey,
                        currentData.reduce((acc, value, idx) => {
                            acc[idx] = value;
                            return acc;
                        }, {}),
                    );
                } else {
                    form.setData(columnKey, {
                        ...form.data[columnKey],
                        [columnValue]: '',
                    });
                }
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message),
                });
            });
    };

    return (
        <Fragment>
            <div className="mb-4 grid gap-2 border-b border-dashed pb-4">
                {form.data.website.default_news_banner && typeof form.data.website.default_news_banner == 'string' && (
                    <div className="mb-4 rounded-lg border py-4">
                        <img
                            src={getFile('website-news', websiteConfig.default_news_banner)}
                            alt=""
                            className="mx-auto h-32 w-32 rounded-md object-cover"
                        />
                    </div>
                )}
                <Label>Default News Banner</Label>
                <div className="flex space-x-2">
                    <div className="w-full">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger className="cursor-pointer" asChild>
                                    <Input
                                        type="file"
                                        accept=".png, .jpg, .jpeg, .svg, .webp"
                                        onChange={(e) => {
                                            form.setData('website', {
                                                ...form.data.website,
                                                default_news_banner: e.target.files[0],
                                            });
                                        }}
                                        onBlur={() => form.validate('website.default_news_banner')}
                                        aria-invalid={form.invalid('website.default_news_banner')}
                                    />
                                </TooltipTrigger>
                                <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                    <span>
                                        <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    {websiteConfig.default_news_banner && (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant="destructive">
                                                Hapus
                                            </Button>
                                        </TooltipTrigger>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Hapus Banner <strong className="font-bold">{websiteConfig.default_news_banner}</strong>.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-4">
                                            <AlertDialogCancel>Batalkan</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() =>
                                                    confirmDeletion({
                                                        label: 'Website',
                                                        columnKey: 'website',
                                                        columnValue: 'default_news_banner',
                                                    })
                                                }
                                            >
                                                Ya, Lanjutkan!
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <TooltipContent className="bg-red-500 hover:bg-red-500/90">
                                    <p>Hapus Banner</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                {form.invalid('website.default_news_banner') && <InputError message={form.errors['website.default_news_banner']} />}
            </div>
            {Object.values(form.data.banner).map((item, index) => {
                return (
                    <div className="col-lg-12 mb-5 border-b pb-4" key={index}>
                        {item && typeof item.file === 'string' && item.file && (
                            <div className="mb-4 rounded-lg border py-4">
                                <img
                                    src={getFile('website-banner', item.file)}
                                    alt=""
                                    className="mx-auto h-[12rem] w-[32rem] rounded-md object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-full">
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-pointer" asChild>
                                                <Input
                                                    type="file"
                                                    accept=".png, .jpg, .jpeg, .svg, .webp"
                                                    onChange={(e) => {
                                                        form.setData('banner', {
                                                            ...form.data.banner,
                                                            [index]: {
                                                                ...form.data.banner[index],
                                                                file: e.target.files[0],
                                                            },
                                                        });
                                                    }}
                                                    onBlur={() => form.validate('banner')}
                                                    aria-invalid={form.invalid('banner')}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-primary hover:bg-primary/90 tooltip-content w-full">
                                                <span>
                                                    <p>*Allowed formats: .png, .jpg, .jpeg, .svg, .webp, .avif</p>
                                                </span>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {item && item.file && (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="destructive">
                                                            Hapus
                                                        </Button>
                                                    </TooltipTrigger>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Hapus Banner{' '}
                                                            <strong className="font-bold">
                                                                {typeof item.file === 'string' ? item.file : 'Baru'}
                                                            </strong>
                                                            .
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-4">
                                                        <AlertDialogCancel>Batalkan</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                confirmDeletion({
                                                                    label: 'Banner',
                                                                    columnKey: 'banner',
                                                                    columnValue: item.file,
                                                                    index,
                                                                })
                                                            }
                                                        >
                                                            Ya, Lanjutkan!
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <TooltipContent className="bg-red-500 hover:bg-red-500/90">
                                                <p>Hapus Banner</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>

                            <div className="w-full">
                                <Input
                                    type="url"
                                    placeholder="https://domain.com"
                                    value={item?.link || ''}
                                    onChange={(e) => {
                                        form.setData('banner', {
                                            ...form.data.banner,
                                            [index]: {
                                                ...form.data.banner[index],
                                                link: e.target.value,
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        {form.invalid('banner') && <InputError message={form.errors['banner']} />}
                    </div>
                );
            })}

            <div className="mb-3">
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        form.setData('banner', [...Object.values(form.data.banner), { file: null, link: '' }]);
                    }}
                >
                    Tambah Banner
                </Button>
            </div>
        </Fragment>
    );
}
