import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Link } from '@inertiajs/react';
import { Loading02Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ pageProps }) {
    const { t } = useTranslation();
    const form = useForm('post', route('user.auth.password.request'), {
        user: {
            email: '',
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
        <AuthLayout pageTitle={t('common:labels.forgot-password')}>
            <form className="p-6 md:p-6" onSubmit={handleSubmit} autoComplete="off">
                <div className="flex flex-col gap-4">
                    <div className="space-y-0 text-center">
                        <h1 className="text-xl font-medium">{t('auth:forgot-password.header')}</h1>
                        <p className="text-muted-foreground text-center text-sm">{t('auth:forgot-password.description')}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label isRequired>{t('common:labels.email')}</Label>
                        <Input
                            type="email"
                            value={form.data.user.email}
                            onChange={(e) => {
                                form.setData((data) => ({
                                    ...data,
                                    user: {
                                        ...data.user,
                                        email: e.target.value,
                                    },
                                }));
                            }}
                            onBlur={() => form.validate('user.email')}
                            aria-invalid={form.invalid('user.email')}
                            autoFocus
                        />
                        {form.invalid('user.email') && <InputError message={form.errors['user.email']} />}
                    </div>
                    <Button type="submit" className="w-full" disabled={form.processing}>
                        {form.processing && <Loading02Icon className="h-4 w-4 animate-spin" />}
                        {!form.processing ? t('auth:forgot-password.button') : t('common:loading.please-wait')}
                    </Button>
                    <div className="text-center text-sm">
                        {t('auth:signup.cta.signin-prefix')}{' '}
                        <Link href={route('user.auth.signin')} className="text-primary font-medium underline underline-offset-4">
                            {t('auth:signup.cta.signin-link')}
                        </Link>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
