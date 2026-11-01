import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Reviews({ form }) {
    return (
        <div className="space-y-4">
            {Object.values(form.data.reviews).map((item, index) => {
                return (
                    <div className="grid grid-cols-1 gap-4 border-b pb-4 md:grid-cols-2" key={index}>
                        <div className="grid gap-2">
                            <Label>Nama Lengkap</Label>
                            <Input
                                value={item.full_name}
                                onChange={(e) => {
                                    const updatedReviews = [...form.data.reviews];
                                    updatedReviews[index] = {
                                        ...updatedReviews[index],
                                        full_name: e.target.value,
                                    };
                                    form.setData((data) => ({
                                        ...form.data,
                                        reviews: updatedReviews,
                                    }));
                                }}
                                onBlur={() => form.validate(`reviews.${index}.full_name`)}
                                aria-invalid={form.invalid(`reviews.${index}.full_name`)}
                            />
                            {form.invalid(`reviews.${index}.full_name`) && <InputError message={form.errors[`reviews.${index}.full_name`]} />}
                        </div>
                        <div className="grid gap-2">
                            <Label>Pekerjaan</Label>
                            <Input
                                value={item.job}
                                onChange={(e) => {
                                    const updatedReviews = [...form.data.reviews];
                                    updatedReviews[index] = {
                                        ...updatedReviews[index],
                                        job: e.target.value,
                                    };
                                    form.setData((data) => ({
                                        ...form.data,
                                        reviews: updatedReviews,
                                    }));
                                }}
                                onBlur={() => form.validate(`reviews.${index}.job`)}
                                aria-invalid={form.invalid(`reviews.${index}.job`)}
                            />
                            {form.invalid(`reviews.${index}.job`) && <InputError message={form.errors[`reviews.${index}.job`]} />}
                        </div>
                        <div className="col-span-2 grid w-full gap-2">
                            <Label>Ulasan</Label>
                            <Textarea
                                className="min-h-[150px]"
                                value={item.reviews}
                                onChange={(e) => {
                                    const updatedReviews = [...form.data.reviews];
                                    updatedReviews[index] = {
                                        ...updatedReviews[index],
                                        reviews: e.target.value,
                                    };
                                    form.setData((data) => ({
                                        ...form.data,
                                        reviews: updatedReviews,
                                    }));
                                }}
                                onBlur={() => form.validate(`reviews.${index}.reviews`)}
                                aria-invalid={form.invalid(`reviews.${index}.reviews`)}
                                rows="5"
                            />
                            {form.invalid(`reviews.${index}.reviews`) && <InputError message={form.errors[`reviews.${index}.reviews`]} />}
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="col-span-2"
                            onClick={() => {
                                const updatedReviews = form.data.reviews.filter((reviews) => reviews.full_name !== item.full_name);
                                form.setData((data) => ({
                                    ...form.data,
                                    reviews: updatedReviews,
                                }));
                            }}
                        >
                            Hapus Ulasan
                        </Button>
                    </div>
                );
            })}
            <div className="">
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        form.setData((data) => ({
                            ...form.data,
                            reviews: [...form.data.reviews, { full_name: '', job: '', reviews: '' }],
                        }));
                    }}
                >
                    Tambah Ulasan
                </Button>
            </div>
        </div>
    );
}
