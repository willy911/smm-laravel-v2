/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott
| * Whatsapp : https://wa.me/6285349680016
| * Telegram : https://t.me/jhondelton
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

import AppHeader from '@/components/layouts/app-header';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function Error({ websiteConfig, status }) {
    const descriptions = {
        401: 'Unauthorized action.',
        402: 'Payment Required.',
        403: 'Action not allowed.',
        404: 'Page not found.',
        405: 'Method not allowed.',
        419: 'Page expired.',
        429: 'Too many requests.',
        500: 'An error occurred.',
        503: 'Service unavailable.',
    }[status];

    return (
        <>
            <AppHeader pageTitle={status} />
            <div className="bg-background flex min-h-screen flex-col items-center justify-center">
                <div className="space-y-4 text-center">
                    <h1 className="text-foreground text-6xl font-bold">{status}</h1>
                    <h2 className="text-foreground text-3xl font-semibold">{descriptions}</h2>
                    <Link href="/" className={buttonVariants({ variant: 'default', size: 'sm' })}>
                        Back to Home
                    </Link>
                </div>
                <img
                    src="/assets/images/error.png"
                    width="400"
                    height="400"
                    alt="404 Error"
                    className="mt-10 h-[200px] w-[200px] object-cover md:h-[400px] md:w-[400px]"
                    style={{ aspectRatio: '400/400', objectFit: 'cover' }}
                />
            </div>
        </>
    );
}
