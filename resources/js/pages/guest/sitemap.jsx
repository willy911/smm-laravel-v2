import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { config, toHTML } from '@/lib/utils';
import { Deferred } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Sitemap({ pageProps }) {
    const { t } = useTranslation();
    return (
        <AppLayout
            pageTitle={pageProps.target.title}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.sitemap'),
                    href: '/',
                },
                {
                    title: pageProps.target.title,
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <Card>
                    <CardHeader>
                        <CardTitle>{pageProps.target.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm py-0">
                        <div>{toHTML(pageProps.target.content)}</div>
                    </CardContent>
                </Card>
            </Deferred>
        </AppLayout>
    );
}
