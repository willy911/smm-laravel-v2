import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { config, createCurrencyFormatter, formatAmount } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Wallet01Icon } from 'hugeicons-react';
import { ShoppingCart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';

export default function Dashboard({ pageProps }) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation(['dashboard', 'admin/dashboard']);
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);

    const [data, setData] = useState({
        charts: [],
        lastUsers: [],
        lastOrders: [],
        lastDeposits: [],
        users: {
            total: {
                balance: 0,
                total: 0,
            },
            active: {
                balance: 0,
                total: 0,
            },
            disabled: {
                balance: 0,
                total: 0,
            },
        },
        orders: {
            pending: {
                price: 0,
                total: 0,
            },
            success: {
                price: 0,
                total: 0,
            },
            failed: {
                price: 0,
                total: 0,
            },
        },
        deposits: {
            pending: {
                amount: 0,
                total: 0,
            },
            success: {
                amount: 0,
                total: 0,
            },
            failed: {
                amount: 0,
                total: 0,
            },
        },
    });

    useEffect(() => {
        const getData = async () => {
            await axios
                .get(
                    route(route().current(), {
                        render: true,
                    }),
                )
                .then((response) => {
                    if (!response.data.status) toast.error(response.data.message);
                    if (response.data.status) setData(response.data.data);
                });
        };
        getData();
    }, []);

    return (
        <AppLayout
            pageTitle={t('common:labels.dashboard')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: route('admin.dashboard'),
                },
                {
                    title: t('common:labels.dashboard'),
                    href: '/',
                },
            ]}
        >
            <Tabs defaultValue="users">
                <TabsList className="grid grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="users">{t('common:labels.users')}</TabsTrigger>
                    <TabsTrigger value="orders">{t('common:labels.orders')}</TabsTrigger>
                    <TabsTrigger value="deposits">{t('common:labels.deposits')}</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-4 lg:col-span-12">
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
                                <div className="lg:col-span-3">
                                    <div className="grid gap-4 md:gap-6">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.total')}</CardTitle>
                                                <Users className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.users.total.balance)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.users.total.total)} {t('common:labels.users')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Aktif</CardTitle>
                                                <Users className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.users.active.balance)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.users.active.total)} {t('common:labels.users')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Nonaktif</CardTitle>
                                                <Users className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.users.disabled.balance)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.users.disabled.total)} {t('common:labels.users')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="lg:col-span-9">
                                    <Card className="backface-hidden">
                                        <CardHeader>
                                            <CardTitle className="font-medium">{t('admin/dashboard:labels.users-this-month')}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ChartContainer
                                                config={{
                                                    user: {
                                                        label: t('common:labels.users'),
                                                        color: '#10b981',
                                                    },
                                                }}
                                                className="max-h-[337px] w-full"
                                            >
                                                <BarChart accessibilityLayer data={data.charts}>
                                                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                        tickFormatter={(value) => value.slice(0, 2)}
                                                    />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Bar dataKey="user" fill="var(--primary)" radius={4} />
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            {/* <h2 className="text-card-foreground text-lg font-semibold">5 {t('common:labels.users')} Terakhir</h2>
                            {data.lastUsers.length < 1 ? (
                                <Alert className="bg-muted">
                                    <AlertDescription>Belum ada {t('common:labels.users')}</AlertDescription>
                                </Alert>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">ID</TableHead>
                                            <TableHead className="w-[200px]">Tgl. Dibuat</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Nama Lengkap</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Whatsapp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.lastUsers.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>{formatDate(item.created_at)}</TableCell>
                                                <TableCell>{item.username}</TableCell>
                                                <TableCell>{item.full_name}</TableCell>
                                                <TableCell>{item.email}</TableCell>
                                                <TableCell>{item.whatsapp}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )} */}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-4 lg:col-span-12">
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
                                <div className="lg:col-span-3">
                                    <div className="grid gap-4 md:gap-6">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.pending')}</CardTitle>
                                                <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.orders.pending.price)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.orders.pending.total)} {t('common:labels.orders')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.success')}</CardTitle>
                                                <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.orders.success.price)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.orders.success.total)} {t('common:labels.orders')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.fail')}</CardTitle>
                                                <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.orders.failed.price)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.orders.failed.total)} {t('common:labels.orders')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="lg:col-span-9">
                                    <Card className="backface-hidden">
                                        <CardHeader>
                                            <CardTitle className="font-medium">{t('admin/dashboard:labels.orders-this-month')}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ChartContainer
                                                config={{
                                                    order: {
                                                        label: t('common:labels.orders'),
                                                        color: '#10b981',
                                                    },
                                                }}
                                                className="max-h-[337px] w-full"
                                            >
                                                <BarChart accessibilityLayer data={data.charts}>
                                                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                        tickFormatter={(value) => value.slice(0, 2)}
                                                    />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Bar dataKey="order" fill="var(--primary)" radius={4} />
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            {/* <h2 className="text-card-foreground text-lg font-semibold">5 {t('common:labels.orders')} Terakhir</h2>
                            {data.lastOrders.length < 1 ? (
                                <Alert className="bg-muted">
                                    <AlertDescription>Belum ada transaksi</AlertDescription>
                                </Alert>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[210px]">ID Ref.</TableHead>
                                            <TableHead className="w-[200px]">Tgl. Dibuat</TableHead>
                                            <TableHead>{t('common:labels.users')}</TableHead>
                                            <TableHead>Layanan</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead>Harga</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.lastOrders.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.ref_id}</TableCell>
                                                <TableCell>{formatDate(item.created_at)}</TableCell>
                                                <TableCell>{item.user ? item.user.username : 'Tamu'}</TableCell>
                                                <TableCell>{cn(item.service_name)}</TableCell>
                                                <TableCell>{cn(item.target)}</TableCell>
                                                <TableCell>{formatCurrency(item.total_price)}</TableCell>
                                                <TableCell className={`ml-24 text-left text-${item.status_classes[item.status].color}`}>
                                                    {item.status_classes[item.status].label}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )} */}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="deposits">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-4 lg:col-span-12">
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
                                <div className="lg:col-span-3">
                                    <div className="grid gap-4 md:gap-6">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.pending')}</CardTitle>
                                                <Wallet01Icon className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.deposits.pending.amount)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.deposits.pending.total)} {t('common:labels.deposits')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.success')}</CardTitle>
                                                <Wallet01Icon className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.deposits.success.amount)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.deposits.success.total)} {t('common:labels.deposits')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">{t('common:summary.fail')}</CardTitle>
                                                <Wallet01Icon className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(data.deposits.failed.amount)}</div>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatAmount(data.deposits.failed.total)} {t('common:labels.deposits')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="lg:col-span-9">
                                    <Card className="backface-hidden">
                                        <CardHeader>
                                            <CardTitle className="font-medium">{t('admin/dashboard:labels.deposits-this-month')}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ChartContainer
                                                config={{
                                                    deposit: {
                                                        label: t('common:labels.deposits'),
                                                        color: '#10b981',
                                                    },
                                                }}
                                                className="max-h-[337px] w-full"
                                            >
                                                <BarChart accessibilityLayer data={data.charts}>
                                                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                        tickFormatter={(value) => value.slice(0, 2)}
                                                    />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Bar dataKey="deposit" fill="var(--primary)" radius={4} />
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            {/* <h2 className="text-card-foreground text-lg font-semibold">5 Deposit Terakhir</h2>
                            {data.lastDeposits.length < 1 ? (
                                <Alert className="bg-muted">
                                    <AlertDescription>Belum ada deposit</AlertDescription>
                                </Alert>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[210px]">ID Ref.</TableHead>
                                            <TableHead className="w-[200px]">Tgl. Dibuat</TableHead>
                                            <TableHead>{t('common:labels.users')}</TableHead>
                                            <TableHead>Metode Pembayaran</TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.lastDeposits.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.ref_id}</TableCell>
                                                <TableCell>{formatDate(item.created_at)}</TableCell>
                                                <TableCell>{item.user ? item.user.username : 'Tamu'}</TableCell>
                                                <TableCell>{cn(item.payment_method_name)}</TableCell>
                                                <TableCell>{formatCurrency(item.amount)}</TableCell>
                                                <TableCell className={`ml-24 text-left text-${item.status_classes[item.status].color}`}>
                                                    {item.status_classes[item.status].label}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )} */}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
