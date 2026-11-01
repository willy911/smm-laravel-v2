import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { cn, config, toHTML } from '@/lib/utils';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useTranslation } from 'react-i18next';
import { Fragment } from 'react/jsx-runtime';
import Affiliate from './partials/affialite';
import PaymentGateway from './partials/payment-gateway/payment-gateway';
import Site from './partials/site/site';
import Smtp from './partials/smtp';
import ThirdPartyPlugin from './partials/third-party-plugin/third-party-plugin';
import URLPrefix from './partials/url-prefix';

export default function Index({ pageProps }) {
    const { t, i18n } = useTranslation(['dashboard']);
    const form = useForm('post', route('admin.websites.configs.update'), { _method: 'patch', ...pageProps.configs });

    form.validateFiles();
    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: (response) => {
                form.reset();
                form.setData({ ...{ _method: 'patch' }, ...response.props.configs });
            },
            onError: (errors) => {
                toast({
                    variant: 'error',
                    description: toHTML('Periksa input.'),
                });
            },
        });
    };

    const confirmDeletion = async (label, columnKey, columnValue, index) => {
        await window.axios
            .delete(
                route('admin.websites.configs.destroy', {
                    columnKey,
                    columnValue,
                }),
            )
            .then((response) => {
                if (!response.data.status)
                    toast({
                        variant: 'error',
                        description: toHTML(response.data.message),
                    });
                if (response.data.status) {
                    let data = columnKey == 'banner' ? [...Object.values(form.data.banner)] : [...Object.values(form.data.banner_user)];
                    data.splice(index, 1);
                    form.setData(
                        columnKey,
                        data.reduce((item, value, index) => {
                            item[index] = value;
                            return item;
                        }, {}),
                    );
                    toast({
                        variant: 'success',
                        description: toHTML(response.data.message),
                    });
                }
            });
    };
    return (
        <AppLayout
            pageTitle={cn(t('common:labels.configs'), t('common:labels.site'))}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.site'),
                    href: '/',
                },
                {
                    title: t('common:labels.configs'),
                    href: '/',
                },
            ]}
        >
            <form onSubmit={handleSubmit} autoComplete="off">
                <TabGroup className="mb-48">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <div className="col-span-12 lg:col-span-3">
                            <TabList>
                                <Card>
                                    <CardContent>
                                        <div className="hide-scrollbar -mb-px grid w-full transform items-center gap-2 overflow-auto duration-300 ease-in-out">
                                            {['Site', 'SMTP', 'Third Party Plugin', 'Payment Gateway', 'URL Prefix', 'Affiliate'].map((label) => (
                                                <Tab key={label} as={Fragment}>
                                                    {({ selected }) => (
                                                        <Button size="sm" variant={selected ? 'default' : 'outline'}>
                                                            {label}
                                                        </Button>
                                                    )}
                                                </Tab>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabList>
                        </div>
                        <div className="col-span-12 lg:col-span-9">
                            <TabPanels className="">
                                <Card>
                                    <CardContent>
                                        <TabPanel>
                                            <Site form={form} />
                                        </TabPanel>
                                        <TabPanel>
                                            <Smtp form={form} />
                                        </TabPanel>
                                        <TabPanel>
                                            <ThirdPartyPlugin form={form} />
                                        </TabPanel>
                                        <TabPanel>
                                            <PaymentGateway form={form} />
                                        </TabPanel>
                                        <TabPanel>
                                            <URLPrefix form={form} />
                                        </TabPanel>
                                        <TabPanel>
                                            <Affiliate form={form} />
                                        </TabPanel>
                                        <Button type="submit" className={cn('mt-4 w-full')} disabled={form.processing}>
                                            {!form.processing ? 'Submit' : 'Mohon Tunggu...'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabPanels>
                        </div>
                    </div>
                </TabGroup>
            </form>
        </AppLayout>
    );
}
