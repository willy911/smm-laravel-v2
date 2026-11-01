import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Smtp({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid items-start gap-4 lg:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Host</Label>
                    <Input
                        value={form.data.smtp.host}
                        onChange={(e) => {
                            form.setData('smtp', {
                                ...form.data.smtp,
                                host: e.target.value,
                            });
                        }}
                        onBlur={() => form.validate('smtp.host')}
                        aria-invalid={form.invalid('smtp.host')}
                    />
                    {form.invalid('smtp.host') && <InputError message={form.errors['smtp.host']} />}
                </div>
                <div className="grid gap-2">
                    <Label>Encryption</Label>
                    <Select
                        onValueChange={(value) => {
                            form.setData('smtp', {
                                ...form.data.smtp,
                                encryption: value,
                            });
                        }}
                        defaultValue={form.data.smtp.encryption}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Encryption" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Encryption</SelectLabel>
                                <SelectItem value="SSL">SSL</SelectItem>
                                <SelectItem value="TLS">TLS</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {form.invalid('smtp.encryption') && <InputError message={form.errors['smtp.encryption']} />}
                </div>
                <div className="grid gap-2">
                    <Label>Port</Label>
                    <Input
                        value={form.data.smtp.port}
                        onChange={(e) => {
                            form.setData('smtp', {
                                ...form.data.smtp,
                                port: e.target.value,
                            });
                        }}
                        onBlur={() => form.validate('smtp.port')}
                        aria-invalid={form.invalid('smtp.port')}
                    />
                    {form.invalid('smtp.port') && <InputError message={form.errors['smtp.port']} />}
                </div>
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-3">
                <div className="grid gap-2">
                    <Label>From</Label>
                    <Input
                        value={form.data.smtp.from}
                        onChange={(e) => {
                            form.setData('smtp', {
                                ...form.data.smtp,
                                from: e.target.value,
                            });
                        }}
                        onBlur={() => form.validate('smtp.from')}
                        aria-invalid={form.invalid('smtp.from')}
                    />
                    {form.invalid('smtp.from') && <InputError message={form.errors['smtp.from']} />}
                </div>
                <div className="grid gap-2">
                    <Label>Username</Label>
                    <Input
                        value={form.data.smtp.username}
                        onChange={(e) => {
                            form.setData('smtp', {
                                ...form.data.smtp,
                                username: e.target.value,
                            });
                        }}
                        onBlur={() => form.validate('smtp.username')}
                        aria-invalid={form.invalid('smtp.username')}
                    />
                    {form.invalid('smtp.username') && <InputError message={form.errors['smtp.username']} />}
                </div>
                <div className="grid gap-2">
                    <Label>Password</Label>
                    <Input
                        type="password"
                        value={form.data.smtp.password}
                        onChange={(e) => {
                            form.setData('smtp', {
                                ...form.data.smtp,
                                password: e.target.value,
                            });
                        }}
                        onBlur={() => form.validate('smtp.password')}
                        aria-invalid={form.invalid('smtp.password')}
                    />
                    {form.invalid('smtp.password') && <InputError message={form.errors['smtp.password']} />}
                </div>
            </div>
        </div>
    );
}
