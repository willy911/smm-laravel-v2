import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn, config, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t } = useTranslation('admin/account');
    const { auth, admin: adminProps } = usePage().props;

    const admin = adminProps ?? {
        username: auth.admin?.username ?? '',
        full_name: auth.admin?.full_name ?? '',
    };

    const formProfile = useForm('post', route('admin.settings.update'), {
        admin: {
            full_name: admin.full_name ?? '',
            username: admin.username ?? '',
        },
    });

    const formPassword = useForm('post', route('admin.settings.update-password'), {
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    formProfile.setValidationTimeout(3000);
    formPassword.setValidationTimeout(3000);

    const handleSubmitProfile = (e) => {
        e.preventDefault();
        formProfile.submit({
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    variant: 'success',
                    description: toHTML(t('labels.profile') + ' — ' + t('toast.update-profile-successful')),
                });
            },
            onError: () => {
                toast({
                    variant: 'error',
                    description: toHTML(t('toast.invalid-input')),
                });
            },
        });
    };

    const handleSubmitPassword = (e) => {
        e.preventDefault();
        formPassword.submit({
            preserveScroll: true,
            onSuccess: () => formPassword.reset(),
            onError: () => {
                toast({
                    variant: 'error',
                    description: toHTML(t('toast.invalid-input')),
                });
            },
        });
    };

    return (
        <AppLayout
            pageTitle={t('labels.title')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('labels.title'),
                    href: '/',
                },
            ]}
        >
            <div className="container mx-auto max-w-2xl">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-8 lg:col-span-12">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('labels.profile')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="grid gap-4" onSubmit={handleSubmitProfile} autoComplete="off">
                                    <div className="grid gap-2">
                                        <Label>{t('labels.username')}</Label>
                                        <Input
                                            value={formProfile.data.admin.username}
                                            onChange={(e) => {
                                                formProfile.setData('admin', {
                                                    ...formProfile.data.admin,
                                                    username: e.target.value,
                                                });
                                            }}
                                            onBlur={() => formProfile.validate('admin.username')}
                                            aria-invalid={formProfile.invalid('admin.username')}
                                        />
                                        {formProfile.invalid('admin.username') && <InputError message={formProfile.errors['admin.username']} />}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t('labels.full-name')}</Label>
                                        <Input
                                            value={formProfile.data.admin.full_name}
                                            onChange={(e) => {
                                                formProfile.setData('admin', {
                                                    ...formProfile.data.admin,
                                                    full_name: e.target.value,
                                                });
                                            }}
                                            onBlur={() => formProfile.validate('admin.full-name')}
                                            aria-invalid={formProfile.invalid('admin.full-name')}
                                        />
                                        {formProfile.invalid('admin.full-name') && <InputError message={formProfile.errors['admin.full-name']} />}
                                    </div>
                                    <div className="d-grid">
                                        <Button type="submit" className={cn('w-full')} disabled={formProfile.processing}>
                                            {!formProfile.processing ? t('labels.update-profile') : t('labels.please-wait')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('labels.change-password')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="grid gap-4" onSubmit={handleSubmitPassword} autoComplete="off">
                                    <div className="grid gap-2">
                                        <Label>{t('labels.current-password')}</Label>
                                        <Input
                                            type="password"
                                            value={formPassword.data.current_password}
                                            onChange={(e) => {
                                                formPassword.setData('current_password', e.target.value);
                                            }}
                                            onBlur={() => formPassword.validate('current-password')}
                                            aria-invalid={formPassword.invalid('current-password')}
                                        />
                                        {formPassword.invalid('current-password') && <InputError message={formPassword.errors['current-password']} />}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t('labels.new-password')}</Label>
                                        <Input
                                            type="password"
                                            value={formPassword.data.new_password}
                                            onChange={(e) => {
                                                formPassword.setData('new_password', e.target.value);
                                            }}
                                            onBlur={() => formPassword.validate('new-password')}
                                            aria-invalid={formPassword.invalid('new-password')}
                                        />
                                        {formPassword.invalid('new-password') && <InputError message={formPassword.errors['new-password']} />}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t('labels.confirm-new-password')}</Label>
                                        <Input
                                            type="password"
                                            value={formPassword.data.new_password_confirmation}
                                            onChange={(e) => {
                                                formPassword.setData('new_password_confirmation', e.target.value);
                                            }}
                                            onBlur={() => formPassword.validate('new-password-confirmation')}
                                            aria-invalid={formPassword.invalid('new-password-confirmation')}
                                        />
                                        {formPassword.invalid('new-password-confirmation') && (
                                            <InputError message={formPassword.errors['new-password-confirmation']} />
                                        )}
                                    </div>
                                    <div className="d-grid">
                                        <Button type="submit" className={cn('w-full')} disabled={formPassword.processing}>
                                            {!formPassword.processing ? t('labels.update-password') : t('labels.please-wait')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
