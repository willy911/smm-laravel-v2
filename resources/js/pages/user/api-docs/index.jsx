import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, config, toHTML } from '@/lib/utils';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
const ProfileTabContent = lazy(() => import('@/pages/user/api-docs/v1/profile'));
const ServicesTabContent = lazy(() => import('@/pages/user/api-docs/v1/services'));
const CreateOrderTabContent = lazy(() => import('@/pages/user/api-docs/v1/order-create'));
const StatusOrderTabContent = lazy(() => import('@/pages/user/api-docs/v1/order-status'));
const CreateOrderRefillTabContent = lazy(() => import('@/pages/user/api-docs/v1/order-refill-create'));
const StatusOrderRefillTabContent = lazy(() => import('@/pages/user/api-docs/v1/order-refill-status'));
const CreateOrderCancelTabContent = lazy(() => import('@/pages/user/api-docs/v1/order-cancel-create'));
const ProfileTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/profile'));
const ServicesTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/services'));
const CreateOrderTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/order-create'));
const StatusOrderTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/order-status'));
const CreateOrderRefillTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/order-refill-create'));
const StatusOrderRefillTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/order-refill-status'));
const CreateOrderCancelTabContentV2 = lazy(() => import('@/pages/user/api-docs/v2/order-cancel-create'));

SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('json', json);

export default function Index({ pageProps }) {
    const { t } = useTranslation('api');
    const { auth, configs, IPAddress } = usePage().props;
    const [value, setValue] = useState('preparation');

    return (
        <AppLayout
            pageTitle={t('common:labels.api-docs')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.api-docs'),
                    href: '/',
                },
            ]}
        >
            <>
                <TabGroup>
                    <TabList className="hide-scrollbar -mb-px grid w-full transform grid-cols-2 items-center gap-2 overflow-auto border-b pb-2 duration-300 ease-in-out sm:grid-cols-2 md:gap-2 lg:grid-cols-2">
                        <Tab
                            className={({ selected }) =>
                                cn(
                                    'rounded-lg px-4 py-2 text-sm font-medium transition outline-none',
                                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70',
                                )
                            }
                        >
                            V1
                        </Tab>
                        <Tab
                            className={({ selected }) =>
                                cn(
                                    'rounded-lg px-4 py-2 text-sm font-medium transition outline-none',
                                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70',
                                )
                            }
                        >
                            V2
                        </Tab>
                    </TabList>
                    <TabPanels className="mt-4">
                        <TabPanel className="space-y-4">
                            <Tabs value={value} onValueChange={setValue} className="mb-36 w-full">
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                    <aside className="col-span-12 lg:col-span-3">
                                        <div className="sticky top-5">
                                            <Card>
                                                <CardContent className="space-y-2">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <TabsList className="grid h-full w-full grid-cols-1">
                                                                {[
                                                                    { label: t('api:labels.preparation'), value: 'preparation' },
                                                                    { label: t('api:labels.profile'), value: 'profile' },
                                                                    { label: t('api:labels.services'), value: 'services' },
                                                                    { label: t('api:labels.create-order'), value: 'create_order' },
                                                                    { label: t('api:labels.status-order'), value: 'status_order' },
                                                                    { label: t('api:labels.create-order-refill'), value: 'create_order_refill' },
                                                                    { label: t('api:labels.status-order-refill'), value: 'status_order_refill' },
                                                                    { label: t('api:labels.create-order-cancel'), value: 'create_order_cancel' },
                                                                ].map((item, index) => (
                                                                    <TabsTrigger value={item.value} key={index}>
                                                                        {item.label}
                                                                    </TabsTrigger>
                                                                ))}
                                                            </TabsList>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </aside>

                                    <main className="col-span-12 lg:col-span-9">
                                        <TabsContent value="preparation">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>{t('api:labels.preparation')}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="prose prose-sm text-sm">
                                                        <p>{toHTML(t('api:description.paragraph-1'))}</p>
                                                        <p>{toHTML(t('api:description.paragraph-2'))}</p>
                                                        <p>{toHTML(t('api:description.paragraph-3'))}</p>
                                                        <p>{toHTML(t('api:description.paragraph-4'))}</p>
                                                        <ul className="list-disc">
                                                            <li>{toHTML(t('api:description.bullet-1'))}</li>
                                                            <li>{toHTML(t('api:description.bullet-2'))}</li>
                                                            <li>{toHTML(t('api:description.bullet-3'))}</li>
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="profile">
                                            <ProfileTabContent configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="services">
                                            <ServicesTabContent configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="create_order">
                                            <CreateOrderTabContent configs={configs} t={t} pageProps={pageProps} />
                                        </TabsContent>
                                        <TabsContent value="status_order">
                                            <StatusOrderTabContent configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="create_order_refill">
                                            <CreateOrderRefillTabContent configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="status_order_refill">
                                            <StatusOrderRefillTabContent configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="create_order_cancel">
                                            <CreateOrderCancelTabContent configs={configs} t={t} />
                                        </TabsContent>
                                    </main>
                                </div>
                            </Tabs>
                        </TabPanel>
                        <TabPanel className="space-y-4">
                            <Tabs value={value} onValueChange={setValue} className="mb-36 w-full">
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                    <aside className="col-span-12 lg:col-span-3">
                                        <div className="sticky top-5">
                                            <Card>
                                                <CardContent className="space-y-2">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <TabsList className="grid h-full w-full grid-cols-1">
                                                                {[
                                                                    { label: t('api:labels.preparation'), value: 'preparation' },
                                                                    { label: t('api:labels.profile'), value: 'profile' },
                                                                    { label: t('api:labels.services'), value: 'services' },
                                                                    { label: t('api:labels.create-order'), value: 'create_order' },
                                                                    { label: t('api:labels.status-order'), value: 'status_order' },
                                                                    { label: t('api:labels.create-order-refill'), value: 'create_order_refill' },
                                                                    { label: t('api:labels.status-order-refill'), value: 'status_order_refill' },
                                                                    { label: t('api:labels.create-order-cancel'), value: 'create_order_cancel' },
                                                                ].map((item, index) => (
                                                                    <TabsTrigger value={item.value} key={index}>
                                                                        {item.label}
                                                                    </TabsTrigger>
                                                                ))}
                                                            </TabsList>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </aside>

                                    <main className="col-span-12 lg:col-span-9">
                                        <TabsContent value="preparation">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>{t('api:labels.preparation')}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="prose prose-sm text-sm">
                                                        <p>{toHTML(t('api:description.paragraph-1'))}</p>
                                                        <p>{toHTML(t('api:description.paragraph-2'))}</p>
                                                        <p>{toHTML(t('api:description.paragraph-3'))}</p>
                                                        <p>{toHTML(t('api:description.paragraph-4'))}</p>
                                                        <ul className="list-disc">
                                                            <li>{toHTML(t('api:description.bullet-1'))}</li>
                                                            <li>{toHTML(t('api:description.bullet-2'))}</li>
                                                            <li>{toHTML(t('api:description.bullet-3'))}</li>
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="profile">
                                            <ProfileTabContentV2 configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="services">
                                            <ServicesTabContentV2 configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="create_order">
                                            <CreateOrderTabContentV2 configs={configs} t={t} pageProps={pageProps} />
                                        </TabsContent>
                                        <TabsContent value="status_order">
                                            <StatusOrderTabContentV2 configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="create_order_refill">
                                            <CreateOrderRefillTabContentV2 configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="status_order_refill">
                                            <StatusOrderRefillTabContentV2 configs={configs} t={t} />
                                        </TabsContent>
                                        <TabsContent value="create_order_cancel">
                                            <CreateOrderCancelTabContentV2 configs={configs} t={t} />
                                        </TabsContent>
                                    </main>
                                </div>
                            </Tabs>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </>
        </AppLayout>
    );
}
