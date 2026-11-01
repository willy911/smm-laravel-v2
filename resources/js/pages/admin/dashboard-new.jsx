import AppLayout from '@/components/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, config, formatAmount, formatDate, formatRupiah } from '@/lib/utils';
import axios from 'axios';
import { CancelCircleIcon, Wallet01Icon } from 'hugeicons-react';
import { Footprints, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';
export const description = 'A bar chart with a custom label';
export default function Dashboard({ pageProps }) {
    const { t, i18n } = useTranslation(['dashboard']);
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

    const getData = async () => {
        try {
            const response = await axios.get(
                route(route().current(), {
                    render: true,
                }),
            );
            if (response.data.status) {
                setData(response.data.data);
            } else {
                toast({
                    variant: 'error',
                    description: toHTML(response.data.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
            });
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const chartData = [
        { month: 'Menunggu', desktop: 100, mobile: 80 },
        { month: 'Sedang Diproses', desktop: 3400, mobile: 200 },
        { month: 'Berhasil', desktop: 1900, mobile: 120 },
        { month: 'Partial', desktop: 73, mobile: 190 },
        { month: 'Error', desktop: 209, mobile: 130 },
        { month: 'Canceled', desktop: 214, mobile: 140 },
    ];

    const chartConfig = {
        desktop: {
            label: 'Pesanan',
            color: 'var(--chart-1)',
            icon: Footprints,
        },
        mobile: {
            label: 'Mobile',
            color: 'var(--chart-2)',
            icon: Footprints,
        },
        label: {
            color: 'var(--background)',
        },
    };
    const barColors = {
        Menunggu: '#d08700', // yellow-500
        'Sedang Diproses': '#155dfc', // blue-500
        Berhasil: '#00a63e', // green-500
        Partial: '#e7000b', // amber-500
        Error: '#e7000b', // red-500
        Canceled: '#e7000b', // gray-500
    };
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
                    <TabsTrigger value="users">Pengguna</TabsTrigger>
                    <TabsTrigger value="orders">Pesanan</TabsTrigger>
                    <TabsTrigger value="deposits">Deposit</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-4 lg:col-span-12">
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
                                <div className="lg:col-span-4">
                                    <div className="grid gap-4 md:gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Grafik Status Pesanan</CardTitle>
                                                <CardDescription>Sepanjang Waktu</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer config={chartConfig}>
                                                    <BarChart
                                                        accessibilityLayer
                                                        data={chartData}
                                                        layout="vertical"
                                                        margin={{
                                                            left: -20,
                                                        }}
                                                    >
                                                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                        <XAxis type="number" dataKey="desktop" hide />
                                                        <YAxis
                                                            dataKey="month"
                                                            type="category"
                                                            tickLine={false}
                                                            tickMargin={10}
                                                            axisLine={false}
                                                            tickFormatter={(value) => value.slice(0, 3)}
                                                        />
                                                        <ChartTooltip
                                                            content={
                                                                <ChartTooltipContent
                                                                    hideLabel
                                                                    formatter={(value, name, item, index) => {
                                                                        return (
                                                                            <>
                                                                                <div className={`text-${barColors[item.payload.month]}`}>
                                                                                    <CancelCircleIcon className="size-3" />
                                                                                </div>
                                                                                {(item &&
                                                                                    item.payload &&
                                                                                    (item.payload.month ?? item.payload.status)) ??
                                                                                    (chartConfig[name]?.label || name)}
                                                                                <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                                                    {new Intl.NumberFormat('id-ID', {
                                                                                        style: 'currency',
                                                                                        currency: 'IDR',
                                                                                        minimumFractionDigits: 0,
                                                                                    }).format(Number(value))}
                                                                                </div>
                                                                            </>
                                                                        );
                                                                    }}
                                                                />
                                                            }
                                                            defaultIndex={1}
                                                        />
                                                        <Bar dataKey="desktop" radius={4}>
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={barColors[entry.month] || '#8884d8'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Bar Chart - Custom Label</CardTitle>
                                                <CardDescription>January - June 2024</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer config={chartConfig}>
                                                    <BarChart accessibilityLayer data={chartData} layout="vertical">
                                                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                        <YAxis
                                                            dataKey="month"
                                                            type="category"
                                                            tickLine={false}
                                                            tickMargin={10}
                                                            axisLine={false}
                                                            tickFormatter={(value) => value.slice(0, 3)}
                                                            hide
                                                        />
                                                        <XAxis dataKey="desktop" type="number" hide />
                                                        <ChartTooltip
                                                            content={
                                                                <ChartTooltipContent
                                                                    hideLabel
                                                                    className="w-[180px]"
                                                                    formatter={(value, name, item, index) => {
                                                                        return (
                                                                            <>
                                                                                {/* Kotak warna indikator */}
                                                                                <div
                                                                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                                                                    style={{
                                                                                        '--color-bg': `var(--color-${name})`,
                                                                                    }}
                                                                                />

                                                                                {/* Label dataset */}
                                                                                {(item &&
                                                                                    item.payload &&
                                                                                    (item.payload.month ?? item.payload.status)) ??
                                                                                    (chartConfig[name]?.label || name)}

                                                                                {/* Value dengan prefix Rp */}
                                                                                <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                                                    {new Intl.NumberFormat('id-ID', {
                                                                                        style: 'currency',
                                                                                        currency: 'IDR',
                                                                                        minimumFractionDigits: 0,
                                                                                    }).format(Number(value))}
                                                                                </div>

                                                                                <div className="text-foreground mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium">
                                                                                    Total
                                                                                    <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                                                        {new Intl.NumberFormat('id-ID', {
                                                                                            style: 'currency',
                                                                                            currency: 'IDR',
                                                                                            minimumFractionDigits: 0,
                                                                                        }).format(item.payload.desktop)}
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        );
                                                                    }}
                                                                />
                                                            }
                                                            cursor={false}
                                                            defaultIndex={1}
                                                        />

                                                        <Bar dataKey="desktop" layout="vertical" fill="var(--primary)" radius={4}>
                                                            <LabelList
                                                                dataKey="month"
                                                                position="insideLeft"
                                                                offset={8}
                                                                className="fill-(--color-label)"
                                                                fontSize={12}
                                                            />
                                                            <LabelList
                                                                dataKey="desktop"
                                                                position="right"
                                                                offset={8}
                                                                className="fill-foreground"
                                                                fontSize={12}
                                                                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ChartContainer>
                                            </CardContent>
                                            <CardFooter className="flex-col items-start gap-2 text-sm">
                                                <div className="flex gap-2 leading-none font-medium">
                                                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                                                </div>
                                                <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
                                            </CardFooter>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Total</CardTitle>
                                                <Users className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.users.total.balance)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.users.total.total)} Pengguna</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Aktif</CardTitle>
                                                <Users className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.users.active.balance)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.users.active.total)} Pengguna</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Nonaktif</CardTitle>
                                                <Users className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.users.disabled.balance)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.users.disabled.total)} Pengguna</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="lg:col-span-8">
                                    <Card className="backface-hidden">
                                        <CardHeader>
                                            <CardTitle className="font-medium">Grafik Pengguna Baru Bulan Ini</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ChartContainer
                                                config={{
                                                    user: {
                                                        label: 'Pengguna',
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
                            <h2 className="text-card-foreground text-lg font-semibold">5 Pengguna Terakhir</h2>
                            {data.lastUsers.length < 1 ? (
                                <Alert className="bg-muted">
                                    <AlertDescription>Belum ada pengguna</AlertDescription>
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
                            )}
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
                                                <CardTitle className="font-medium">Menunggu</CardTitle>
                                                <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.orders.pending.price)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.orders.pending.total)} Pesanan</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Sukses</CardTitle>
                                                <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.orders.success.price)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.orders.success.total)} Pesanan</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Gagal</CardTitle>
                                                <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.orders.failed.price)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.orders.failed.total)} Pesanan</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="lg:col-span-9">
                                    <Card className="backface-hidden">
                                        <CardHeader>
                                            <CardTitle className="font-medium">Grafik Pesanan Bulan Ini</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ChartContainer
                                                config={{
                                                    order: {
                                                        label: 'Pesanan',
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
                            <h2 className="text-card-foreground text-lg font-semibold">5 Pesanan Terakhir</h2>
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
                                            <TableHead>Pengguna</TableHead>
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
                                                <TableCell>{formatRupiah(item.total_price)}</TableCell>
                                                {/* <TableCell className={`ml-24 text-left text-${item.status_classes[item.status].color}`}>
                                                    {item.status_classes[item.status].label}
                                                </TableCell> */}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
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
                                                <CardTitle className="font-medium">Menunggu</CardTitle>
                                                <Wallet01Icon className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.deposits.pending.amount)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.deposits.pending.total)} Deposit</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Sukses</CardTitle>
                                                <Wallet01Icon className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.deposits.success.amount)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.deposits.success.total)} Deposit</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                                <CardTitle className="font-medium">Gagal</CardTitle>
                                                <Wallet01Icon className="text-muted-foreground h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatRupiah(data.deposits.failed.amount)}</div>
                                                <p className="text-muted-foreground text-xs">{formatAmount(data.deposits.failed.total)} Deposit</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="lg:col-span-9">
                                    <Card className="backface-hidden">
                                        <CardHeader>
                                            <CardTitle className="font-medium">Grafik Deposit Bulan Ini</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ChartContainer
                                                config={{
                                                    deposit: {
                                                        label: 'Deposit',
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
                            <h2 className="text-card-foreground text-lg font-semibold">5 Deposit Terakhir</h2>
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
                                            <TableHead>Pengguna</TableHead>
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
                                                <TableCell>{formatRupiah(item.amount)}</TableCell>
                                                {/* <TableCell className={`ml-24 text-left text-${item.status_classes[item.status].color}`}>
                                                    {item.status_classes[item.status].label}
                                                </TableCell> */}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
