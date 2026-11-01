import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loading02Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ pageProps }) {
    const { t } = useTranslation();
    const form = useForm(
        'post',
        route('user.auth.password.store', {
            token: pageProps.token,
        }),
        {
            user: {
                email: pageProps.user.email,
                new_password: '',
            },
        },
    );

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
        <AuthLayout pageTitle={t('common:labels.reset-password')}>
            <form className="p-6 md:p-6" onSubmit={handleSubmit} autoComplete="off">
                <div className="flex flex-col gap-4">
                    <div className="space-y-0 text-center">
                        <h1 className="text-xl font-medium">{t('auth:reset-password.header')}</h1>
                        <p className="text-muted-foreground text-center text-sm">{t('auth:reset-password.description')}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>{t('common:labels.email')}</Label>
                        <Input value={form.data.user.email} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>{t('common:labels.new-password')}</Label>
                        <Input
                            type="password"
                            value={form.data.user.new_password}
                            onChange={(e) => {
                                form.setData((data) => ({
                                    user: {
                                        ...data.user,
                                        new_password: e.target.value,
                                    },
                                }));
                            }}
                            onBlur={() => form.validate('user.new_password')}
                            aria-invalid={form.invalid('user.new_password')}
                            autoFocus
                        />
                        {form.invalid('user.new_password') && <InputError message={form.errors['user.new_password']} />}
                    </div>
                    <Button type="submit" className="w-full" disabled={form.processing}>
                        {form.processing && <Loading02Icon className="h-4 w-4 animate-spin" />}
                        {!form.processing ? t('auth:reset-password.button') : t('common:loading.please-wait')}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
