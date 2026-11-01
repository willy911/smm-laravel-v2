import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loading02Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useTranslation } from 'react-i18next';

export default function Signin({ pageProps }) {
    const { t } = useTranslation();
    const form = useForm('post', route('admin.auth.signin'), {
        admin: {
            username: '',
            password: '',
            remember_me: false,
        },
    });

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => {
                toast({
                    variant: 'error',
                    description: t('common:toast.invalid-input'),
                });
            },
        });
    };

    return (
        <AuthLayout pageTitle={t('common:labels.signin')}>
            <form className="p-6 md:p-6" onSubmit={handleSubmit} autoComplete="off">
                <div className="flex flex-col gap-4">
                    <div className="space-y-0 text-center">
                        <h1 className="text-xl font-medium">{t('auth:signin.header')}</h1>
                        <p className="text-muted-foreground text-center text-sm">{t('auth:signin.description')}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>{t('common:labels.username')}</Label>
                        <Input
                            type="text"
                            value={form.data.admin.username}
                            onChange={(e) => {
                                form.setData((data) => ({
                                    ...data,
                                    admin: {
                                        ...data.admin,
                                        username: e.target.value,
                                    },
                                }));
                            }}
                            onBlur={() => form.validate('admin.username')}
                            autoFocus
                            aria-invalid={form.invalid('admin.username')}
                        />
                        {form.invalid('admin.username') && <InputError message={form.errors['admin.username']} />}
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>{t('common:labels.password')}</Label>
                        <Input
                            type="password"
                            value={form.data.admin.password}
                            onChange={(e) => {
                                form.setData((data) => ({
                                    admin: {
                                        ...data.admin,
                                        password: e.target.value,
                                    },
                                }));
                            }}
                            onBlur={() => form.validate('admin.password')}
                            aria-invalid={form.invalid('admin.password')}
                        />
                        {form.invalid('admin.password') && <InputError message={form.errors['admin.password']} />}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember-me"
                                checked={form.data.admin.remember_me}
                                onCheckedChange={(checked) => {
                                    form.setData((data) => ({
                                        ...data,
                                        admin: {
                                            ...data.admin,
                                            remember_me: checked,
                                        },
                                    }));
                                }}
                            />
                            <label
                                htmlFor="remember-me"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {t('common:labels.remember-me')}
                            </label>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={form.processing}>
                        {form.processing && <Loading02Icon className="h-4 w-4 animate-spin" />}
                        {!form.processing ? t('auth:signin.button') : t('common:loading.please-wait')}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
