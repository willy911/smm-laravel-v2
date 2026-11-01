import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import TextEditor from '@/components/ui/text-editor';

export default function OrderInfo({ form }) {
    return (
        <div className="space-y-4">
            {Object.values(form.data.order_info).map((item, index) => {
                return (
                    <div className="grid grid-cols-1 gap-4 border-b pb-4 md:grid-cols-2" key={index}>
                        <div className="grid gap-2">
                            <Label>Ikon</Label>
                            <Input
                                value={item.icon}
                                onChange={(e) => {
                                    const updatedOrderInfo = [...form.data.order_info];
                                    updatedOrderInfo[index] = {
                                        ...updatedOrderInfo[index],
                                        icon: e.target.value,
                                    };
                                    form.setData((data) => ({
                                        ...form.data,
                                        order_info: updatedOrderInfo,
                                    }));
                                }}
                                onBlur={() => form.validate(`order_info.${index}.icon`)}
                                aria-invalid={form.invalid(`order_info.${index}.icon`)}
                            />
                            {form.invalid(`order_info.${index}.icon`) && <InputError message={form.errors[`order_info.${index}.icon`]} />}
                        </div>
                        <div className="grid gap-2">
                            <Label>Judul</Label>
                            <Input
                                value={item.title}
                                onChange={(e) => {
                                    const updatedOrderInfo = [...form.data.order_info];
                                    updatedOrderInfo[index] = {
                                        ...updatedOrderInfo[index],
                                        title: e.target.value,
                                    };
                                    form.setData((data) => ({
                                        ...form.data,
                                        order_info: updatedOrderInfo,
                                    }));
                                }}
                                onBlur={() => form.validate(`order_info.${index}.title`)}
                                aria-invalid={form.invalid(`order_info.${index}.title`)}
                            />
                            {form.invalid(`order_info.${index}.title`) && <InputError message={form.errors[`order_info.${index}.title`]} />}
                        </div>
                        <div className="col-span-2 grid gap-2">
                            <Label>Konten</Label>
                            <TextEditor
                                value={item.content}
                                onEditorChange={(e) => {
                                    const updatedOrderInfo = [...form.data.order_info];
                                    updatedOrderInfo[index] = {
                                        ...updatedOrderInfo[index],
                                        content: e,
                                    };
                                    form.setData((data) => ({
                                        ...form.data,
                                        order_info: updatedOrderInfo,
                                    }));
                                }}
                                onBlur={() => form.validate(`order_info.${index}.content`)}
                                aria-invalid={form.invalid(`order_info.${index}.content`)}
                            />
                            {form.invalid(`order_info.${index}.content`) && <InputError message={form.errors[`order_info.${index}.content`]} />}
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="col-span-2"
                            onClick={() => {
                                const updatedOrderInfo = form.data.order_info.filter((data) => data.title !== item.title);
                                form.setData((data) => ({
                                    ...form.data,
                                    order_info: updatedOrderInfo,
                                }));
                            }}
                        >
                            Hapus Informasi Pesanan
                        </Button>
                    </div>
                );
            })}
            <div className="mb-3">
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        form.setData((data) => ({
                            ...form.data,
                            order_info: [...form.data.order_info, { icon: '', title: '', content: '' }],
                        }));
                    }}
                >
                    Tambah Informasi Pesanan
                </Button>
            </div>
        </div>
    );
}
