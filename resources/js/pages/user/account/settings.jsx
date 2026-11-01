import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn, config, toHTML } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useForm } from 'laravel-precognition-react-inertia';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t } = useTranslation('account');
    const { auth } = usePage().props;
    const [switchValues, setSwitchValues] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm('post', route('user.account.settings'), {
        type: 'profile',
        notification: auth.user.notification,
        user: {
            whatsapp: auth.user.whatsapp,
            full_name: auth.user.full_name,
            current_password: '',
            new_password: '',
        },
        api: {
            api_key: auth.user.api.api_key,
            secret_key: auth.user.api.secret_key,
            whitelist_ip: auth.user.api.whitelist_ip,
        },
    });

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => {
                const data = { ...form.data };
                data.user.current_password = '';
                data.user.new_password = '';
                form.setData(data);
            },
            onError: () => {
                toast({
                    variant: 'error',
                    description: t('common:toast.invalid-input'),
                });
            },
        });
    };

    useEffect(() => {
        const initial = {};
        for (const section of notificationSections) {
            for (const channel of channels) {
                const key = `${section.prefix}.${channel.id}`;
                initial[key] = !!auth.user.notifications?.[section.prefix]?.[channel.id];
            }
        }
        setSwitchValues(initial);
    }, [auth.user.notifications]);

    const handleSwitchChange = async (sectionKey, channelKey, checked) => {
        const stateKey = `${sectionKey}.${channelKey}`;
        setSwitchValues((prev) => ({ ...prev, [stateKey]: checked }));
        setIsLoading(true);
        try {
            const response = await axios.post(
                route('user.account.settings.switch.notification', {
                    menu: sectionKey,
                    platform: channelKey.toLowerCase(),
                    value: checked ? 1 : 0,
                }),
            );
            toast({
                variant: 'success',
                description: toHTML(response.data.message),
            });
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('response.exception')),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const notificationSections = [
        {
            title: t('common:labels.orders'),
            prefix: 'order',
            description: 'pesanan anda',
        },
        {
            title: t('common:labels.deposits'),
            prefix: 'deposit',
            description: 'deposit anda',
        },
        {
            title: t('common:labels.tickets'),
            prefix: 'ticket',
            description: 'tiket anda',
        },
    ];

    const channels = [
        { label: 'Email', id: 'Email' },
        { label: 'Whatsapp', id: 'Whatsapp' },
        { label: 'Telegram', id: 'Telegram' },
    ];

    return (
        <AppLayout
            pageTitle={t('common:labels.settings')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.account'),
                    href: '/',
                },
                {
                    title: t('common:labels.settings'),
                    href: '/',
                },
            ]}
        >
            <Tabs defaultValue="profile" className="container mx-auto max-w-2xl space-y-2">
                <TabsList className="grid h-full w-full grid-cols-3">
                    <TabsTrigger value="profile" onClick={() => form.setData('type', 'profile').clearErrors()}>
                        {t('common:labels.profile')}
                    </TabsTrigger>
                    <TabsTrigger value="api" onClick={() => form.setData('type', 'api').clearErrors()}>
                        API
                    </TabsTrigger>
                    <TabsTrigger value="notifications">{t('common:labels.notification')}</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-8 lg:col-span-12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('common:labels.profile')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.username')}</Label>
                                            <Input value={auth.user.username} readOnly />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.email')}</Label>
                                            <Input value={auth.user.email} readOnly />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.whatsapp')}</Label>
                                            <Input
                                                type="number"
                                                value={form.data.user.whatsapp}
                                                onChange={(e) => {
                                                    form.setData('user', {
                                                        ...form.data.user,
                                                        whatsapp: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('user.whatsapp')}
                                                aria-invalid={form.invalid('user.whatsapp')}
                                            />
                                            {form.invalid('user.whatsapp') && <InputError message={form.errors['user.whatsapp']} />}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.full-name')}</Label>
                                            <Input
                                                value={form.data.user.full_name}
                                                onChange={(e) => {
                                                    form.setData('user', {
                                                        ...form.data.user,
                                                        full_name: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('user.full_name')}
                                                aria-invalid={form.invalid('user.full_name')}
                                            />
                                            {form.invalid('user.full_name') && <InputError message={form.errors['user.full_name']} />}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.new-password')}</Label>
                                            <Input
                                                type="password"
                                                value={form.data.user.new_password}
                                                onChange={(e) => {
                                                    form.setData('user', {
                                                        ...form.data.user,
                                                        new_password: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('user.new_password')}
                                                aria-invalid={form.invalid('user.new_password')}
                                            />
                                            {form.invalid('user.new_password') && <InputError message={form.errors['user.new_password']} />}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.current-password')}</Label>
                                            <Input
                                                type="password"
                                                value={form.data.user.current_password}
                                                onChange={(e) => {
                                                    form.setData('user', {
                                                        ...form.data.user,
                                                        current_password: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('user.current_password')}
                                                aria-invalid={form.invalid('user.current_password')}
                                            />
                                            {form.invalid('user.current_password') && <InputError message={form.errors['user.current_password']} />}
                                        </div>
                                        <div className="d-grid">
                                            <Button type="submit" className={cn('w-full')} disabled={form.processing}>
                                                {!form.processing ? t('account:settings.update-profile-button') : t('common:loading.please-wait')}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="api">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-8 lg:col-span-12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>API</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.api-key')}</Label>
                                            <Input type="password" value={form.data.api.api_key} readOnly />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.secret-key')}</Label>
                                            <Input
                                                type="password"
                                                value={form.data.api.secret_key}
                                                onChange={(e) => {
                                                    form.setData('api', {
                                                        ...form.data.api,
                                                        secret_key: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('api.secret_key')}
                                                aria-invalid={form.invalid('api.secret_key')}
                                            />
                                            {form.invalid('api.secret_key') && <InputError message={form.errors['api.secret_key']} />}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.whitelist-ip')}</Label>
                                            <Input
                                                placeholder={t('common:placeholders.whitelist-ip')}
                                                value={form.data.api.whitelist_ip}
                                                onChange={(e) => {
                                                    form.setData('api', {
                                                        ...form.data.api,
                                                        whitelist_ip: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('api.whitelist_ip')}
                                                aria-invalid={form.invalid('api.whitelist_ip')}
                                            />
                                            {form.invalid('api.whitelist_ip') && <InputError message={form.errors['api.whitelist_ip']} />}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('common:labels.current-password')}</Label>
                                            <Input
                                                type="password"
                                                value={form.data.user.current_password}
                                                onChange={(e) => {
                                                    form.setData('user', {
                                                        ...form.data.user,
                                                        current_password: e.target.value,
                                                    });
                                                }}
                                                onBlur={() => form.validate('user.current_password')}
                                                aria-invalid={form.invalid('user.current_password')}
                                            />
                                            {form.invalid('user.current_password') && <InputError message={form.errors['user.current_password']} />}
                                        </div>
                                        <div className="d-grid">
                                            <Button type="submit" className={cn('w-full')} disabled={form.processing}>
                                                {!form.processing ? t('account:settings.update-api-button') : t('common:loading.please-wait')}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="notifications">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-8 lg:col-span-12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('common:labels.notification')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <form className="grid grid-cols-2 items-start gap-4">
                                        {notificationSections.map((section) => (
                                            <div key={section.prefix}>
                                                <h3 className="mb-4 text-lg font-medium">{section.title}</h3>
                                                <div className="space-y-4">
                                                    {channels.map((channel) => {
                                                        const key = `${section.prefix}.${channel.id}`;
                                                        return (
                                                            <div
                                                                key={key}
                                                                className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm"
                                                            >
                                                                <div className="space-y-1.5">
                                                                    <Label htmlFor={key}>{channel.label}</Label>
                                                                    {/* <p className="text-muted-foreground text-[0.8rem]">
                                                                                Terima notifikasi untuk {section.description} melalui{' '}
                                                                                {channel.label.toLowerCase()}.
                                                                            </p> */}
                                                                </div>
                                                                <Switch
                                                                    id={key}
                                                                    checked={switchValues[key] ?? false}
                                                                    onCheckedChange={(checked) =>
                                                                        handleSwitchChange(section.prefix, channel.label, checked)
                                                                    }
                                                                    disabled={isLoading}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
