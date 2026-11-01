import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { toHTML } from '@/lib/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Signup({ pageProps }) {
    const { t } = useTranslation('account');
    const [retryAfter, setRetryAfter] = useState(pageProps.retryAfter >= 30 ? 0 : 30 - pageProps.retryAfter);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (retryAfter > 0) {
            timer = setInterval(() => {
                setRetryAfter((prevTime) => {
                    if (prevTime <= 1) clearInterval(timer);
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [retryAfter]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const resendVerifyEmail = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('user.account.verify.email.resend'));
            if (response.data.status) {
                setRetryAfter(30);
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message),
                });
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message),
                });
            }
        } catch (error) {
            if (error.response && error.response.headers && error.response.headers['retry-after']) {
                const retryAfterSeconds = parseInt(error.response.headers['retry-after']);
                setRetryAfter(retryAfterSeconds);
            } else {
                toast({
                    variant: 'error',
                    description: t('common:toast.exception'),
                });
            }
        }
        setLoading(false);
    };

    return (
        <AuthLayout
            pageTitle={t('account:email-verification.title')}
            description={
                <span
                    dangerouslySetInnerHTML={{
                        __html: `Silahkan periksa email <span class="font-semibold">${pageProps.user.email}</span> untuk memverifikasi akun anda`,
                    }}
                />
            }
        >
            <form className="p-6 md:p-6" autoComplete="off">
                <div className="flex flex-col gap-4">
                    <div className="space-y-0 text-center">
                        <h1 className="text-xl font-medium">{t('account:email-verification.title')}</h1>
                        <p className="text-muted-foreground text-center text-sm">
                            {toHTML(
                                t('account:email-verification.check-email', {
                                    email: pageProps.user.email,
                                }),
                            )}
                        </p>
                    </div>
                    <Button type="button" className="w-full" disabled={retryAfter > 0 || loading} onClick={resendVerifyEmail}>
                        {retryAfter > 0
                            ? t('account:email-verification.resend-in-seconds', { seconds: formatTime(retryAfter) })
                            : loading
                              ? t('common:loading.please-wait')
                              : t('account:email-verification.button')}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
