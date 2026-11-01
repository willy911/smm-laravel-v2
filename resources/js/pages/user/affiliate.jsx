import { DataTable } from '@/components/datatable/data-table';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import InputMask from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { affialiteStatuses } from '@/enums/affialite';
import { toast } from '@/hooks/use-toast';
import { cn, config, copyText, createCurrencyFormatter, formatAmount, formatDate, toHTML } from '@/lib/utils';
import { Deferred, usePage } from '@inertiajs/react';
import { Copy01Icon, Link01Icon, PercentCircleIcon, UserGroupIcon, WorkHistoryIcon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { Landmark, Wallet } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Affiliate({ pageProps }) {
    const { locales, auth } = usePage().props;
    const { t, i18n } = useTranslation('affiliate');
    const formatCurrency = createCurrencyFormatter(locales, i18n.language);
    const minWithdrawal = Number(config('affiliate').min_withdrawal);

    const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
    const [target, setTarget] = useState({});
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        total: { amount: 0, count: 0 },
        active: { amount: 0, count: 0 },
        inactive: { amount: 0, count: 0 },
    });
    const [bulkActionDialog, setBulkActionDialog] = useState({
        isOpen: false,
        action: null,
        selectedIds: [],
        actionType: '',
    });

    const tableStateRef = useRef({});

    const initialGlobalFilterState = {
        search: '',
        created_at: {
            start: null,
            end: null,
        },
        updated_at: {
            start: null,
            end: null,
        },
        deleted_at: {
            start: null,
            end: null,
        },
    };

    const tableState = useMemo(
        () => ({
            sorting: [{ id: 'id', desc: true }],
            columnFilters: [],
            globalFilter: initialGlobalFilterState,
            columnVisibility: {},
            rowSelection: {},
            pagination: { pageIndex: 0, pageSize: 10 },
            expanded: {},
        }),
        [initialGlobalFilterState],
    );

    const fetchData = useCallback(
        async ({ pagination, columnFilters, globalFilter, sorting }) => {
            setIsLoading(true);
            setSummary({
                total: { amount: 0, count: 0 },
                active: { amount: 0, count: 0 },
                inactive: { amount: 0, count: 0 },
            });

            try {
                const rawTableRequest = {
                    page: pagination.pageIndex + 1,
                    length: pagination.pageSize,
                    filter: {
                        ...globalFilter,
                        ...columnFilters.reduce((acc, item) => {
                            const key = item.id === 'name' ? 'search' : item.id;
                            const value = Array.isArray(item.value) ? item.value.join(',') : item.value;
                            acc[key] = value;
                            return acc;
                        }, {}),
                    },
                    order: {
                        column: sorting[0].id,
                        direction: sorting[0].desc ? 'desc' : 'asc',
                    },
                };

                const currentTableStateRef = { pagination, columnFilters, globalFilter, sorting };
                tableStateRef.current = currentTableStateRef;

                const response = await fetch(route(route().current(), rawTableRequest));
                const data = await response.json();
                setTableData(data.data);
                setSummary(data.summary);
            } catch (error) {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? t('common:toast.exception')),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [t],
    );

    const handleSwitch = useCallback(
        async (selectedIds, columnName, columnValue) => {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    route('admin.users.switch', {
                        columnName,
                        columnValue,
                    }),
                    {
                        id: selectedIds,
                    },
                );
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message),
                });
                fetchData(tableStateRef.current);
            } catch (error) {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [fetchData],
    );

    const handleAction = useCallback(
        async (action, selectedIds) => {
            try {
                setIsLoading(true);
                const response = await axios.post(route('admin.users.action', { action }), {
                    action,
                    id: selectedIds,
                });
                toast({
                    variant: 'success',
                    description: toHTML(response.data.message),
                });
                fetchData(tableStateRef.current);
            } catch (error) {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            } finally {
                setIsLoading(false);
            }
        },
        [fetchData],
    );

    const handleBulkActionDialog = useCallback(
        (actionType, selectedIds) => {
            setBulkActionDialog({
                isOpen: true,
                action: () => handleAction(actionType, selectedIds),
                selectedIds,
                actionType,
            });
        },
        [handleAction],
    );

    const closeBulkActionDialog = useCallback(() => {
        setBulkActionDialog({
            isOpen: false,
            action: null,
            selectedIds: [],
            actionType: '',
        });
    }, []);

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => row.created_at,
                id: 'created_at',
                headerName: t('common:labels.created-at'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.created-at')} />,
                cell: ({ row }) =>
                    formatDate({
                        date: row.original.created_at,
                    }),
                width: '25%',
            },
            {
                accessorFn: (row) => row.type,
                id: 'type',
                headerName: t('common:labels.type'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.type')} />,
                cell: ({ row }) => t(`common:labels.${row.original.type}`),
                width: '10%',
            },
            {
                accessorFn: (row) => row.amount,
                id: 'amount',
                headerName: t('common:labels.amount'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.amount')} />,
                cell: ({ row }) => formatCurrency(row.original.amount),
                width: '100px',
            },
            {
                accessorFn: (row) => row.status,
                id: 'status',
                headerName: t('common:labels.status'),
                header: ({ column }) => <DataTableColumnHeader column={column} title={t('common:labels.status')} />,
                cell: ({ row }) => {
                    const Icon = affialiteStatuses[row.original.status].icon;
                    return (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant={affialiteStatuses[row.original.status].variant} className={cn('flex h-6')}>
                                <Icon />
                                {t(affialiteStatuses[row.original.status].label)}
                            </Button>
                        </div>
                    );
                },
                width: '10%',
            },
        ],
        [i18n.language],
    );

    const filters = useMemo(
        () => [
            {
                column_filter: false,
                type: 'daterange',
                label: t('common:labels.created-at'),
                from: 'created_at.start',
                to: 'created_at.end',
            },
        ],
        [i18n.language],
    );

    const rowSelectionActions = useMemo(() => [], [i18n.language]);

    const form = useForm('post', route('user.affiliate.commission-withdrawal'), {
        commission_withdrawal: {
            type: 'balance',
            bank_name: '',
            bank_account_name: '',
            bank_account_number: '',
            amount: '',
            display_amount: '',
        },
    });

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();

        const withdrawal = form.data.commission_withdrawal;

        if (!withdrawal.display_amount) {
            return toast({
                variant: 'error',
                description: t('affiliate:toast.amount-required'),
            });
        }

        if (withdrawal.amount < minWithdrawal) {
            return toast({
                variant: 'error',
                description: toHTML(
                    t('affiliate:toast.min-withdrawal', {
                        amount: formatCurrency(minWithdrawal),
                    }),
                ),
            });
        }

        if (withdrawal.amount > Number(auth.user.commission)) {
            return toast({
                variant: 'error',
                description: toHTML(
                    t('affiliate:toast.max-withdrawal', {
                        amount: formatCurrency(auth.user.commission),
                    }),
                ),
            });
        }

        if (withdrawal.type === 'bank') {
            if (!withdrawal.bank_name?.trim()) {
                return toast({
                    variant: 'error',
                    description: t('affiliate:toast.bank-name-required'),
                });
            }

            if (!withdrawal.bank_account_name?.trim()) {
                return toast({
                    variant: 'error',
                    description: t('affiliate:toast.bank-account-name-required'),
                });
            }

            if (!withdrawal.bank_account_number?.trim()) {
                return toast({
                    variant: 'error',
                    description: t('affiliate:toast.bank-account-number-required'),
                });
            }
        }

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
        <AppLayout
            pageTitle={t('common:labels.affiliate')}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.affiliate'),
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="mx-auto w-full max-w-7xl gap-5 lg:grid lg:grid-cols-12">
                    {/* LEFT */}
                    <div className="space-y-5 lg:col-span-4">
                        {/* BALANCE */}
                        <Card className="from-primary via-primary/80 to-primary/90 relative overflow-hidden rounded-[32px] border border-blue-400/20 bg-gradient-to-br">
                            <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 blur-3xl" />

                            <CardContent className="relative z-10 p-7">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md">
                                        <Wallet className="h-7 w-7 text-white" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium tracking-wide text-blue-100/90">
                                            {t('affiliate:labels.affiliate-balance')}
                                        </p>

                                        <h2 className="text-[28px] leading-none font-semibold tracking-tight text-white">
                                            {t('affiliate:labels.commission-available')}
                                        </h2>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-4xl leading-none font-semibold text-white">{formatCurrency(auth.user.commission)}</h1>

                                    <p className="text-sm font-medium text-blue-100/90">
                                        {t('affiliate:labels.total-earnings')} • {formatCurrency(pageProps?.totalEarnings)}
                                    </p>
                                </div>

                                <Dialog>
                                    <form className="grid gap-4" autoComplete="off">
                                        <DialogTrigger>
                                            <div className="bg-background dark:bg-foreground text-primary mt-10 flex h-14 w-full items-center justify-center rounded-2xl border-0 text-[15px] font-semibold transition-all hover:scale-[1.01] hover:bg-white">
                                                <Landmark className="mr-2 h-5 w-5" />
                                                {t('affiliate:labels.withdraw-commission')}
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="w-full sm:max-w-xl">
                                            <DialogHeader className="flex flex-col items-center gap-2 text-center">
                                                <div className="text-primary bg-primary/20 mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                                                    <Landmark size={32} strokeWidth={2.5} />
                                                </div>

                                                <DialogTitle className="text-primary text-2xl font-bold">
                                                    {t('affiliate:labels.withdraw-commission')}
                                                </DialogTitle>
                                                <p className="text-muted-foreground text-sm">
                                                    {form.data.commission_withdrawal.type === 'balance'
                                                        ? t('affiliate:information.balance-transfer-notice')
                                                        : t('affiliate:information.bank-transfer-notice')}
                                                </p>
                                            </DialogHeader>
                                            <Tabs defaultValue="overview">
                                                <TabsList className="mt-4 grid w-full grid-cols-2 justify-center">
                                                    <TabsTrigger
                                                        value="balance"
                                                        onClick={() =>
                                                            form.setData((data) => ({
                                                                ...data,
                                                                commission_withdrawal: {
                                                                    ...data.commission_withdrawal,
                                                                    type: 'balance',
                                                                },
                                                            }))
                                                        }
                                                    >
                                                        {t('common:labels.balance')}
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="bank"
                                                        onClick={() =>
                                                            form.setData((data) => ({
                                                                ...data,
                                                                commission_withdrawal: {
                                                                    ...data.commission_withdrawal,
                                                                    type: 'bank',
                                                                },
                                                            }))
                                                        }
                                                    >
                                                        {t('common:labels.bank')}
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="balance">
                                                    <div className="mb-4 grid gap-2">
                                                        <Label className="flex justify-between">
                                                            <Label isRequired>{t('common:labels.amount')}</Label>
                                                            <Badge className="rounded-sm py-1 text-[10px]">
                                                                {t('common:labels.minimum')}: {formatCurrency(minWithdrawal)}
                                                            </Badge>
                                                        </Label>
                                                        <InputMask
                                                            min={0}
                                                            prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                                            value={form.data.commission_withdrawal.display_amount}
                                                            onValueChange={(values) => {
                                                                const amount =
                                                                    values.floatValue /
                                                                    locales.find((item) => item.locale === i18n.language).usd_rate;
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    commission_withdrawal: {
                                                                        ...data.commission_withdrawal,
                                                                        amount,
                                                                        display_amount: values.floatValue,
                                                                    },
                                                                }));
                                                            }}
                                                            onBlur={() => form.validate(`commission_withdrawal.amount`)}
                                                            aria-invalid={form.invalid(`commission_withdrawal.display_amount`)}
                                                        />
                                                        {form.invalid('commission_withdrawal.display_amount') && (
                                                            <InputError message={form.errors['commission_withdrawal.display_amount']} />
                                                        )}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="bank">
                                                    <div className="mb-4 grid gap-2">
                                                        <Label className="flex justify-between">
                                                            <Label isRequired>{t('common:labels.bank-name')}</Label>
                                                        </Label>
                                                        <Input
                                                            value={form.data.commission_withdrawal.bank_name}
                                                            onChange={(e) => {
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    commission_withdrawal: {
                                                                        ...data.commission_withdrawal,
                                                                        bank_name: e.target.value,
                                                                    },
                                                                }));
                                                            }}
                                                            onBlur={() => form.validate(`commission_withdrawal.bank_name`)}
                                                            aria-invalid={form.invalid(`commission_withdrawal.bank_name`)}
                                                        />
                                                        {form.invalid('commission_withdrawal.bank_name') && (
                                                            <InputError message={form.errors['commission_withdrawal.bank_name']} />
                                                        )}
                                                    </div>
                                                    <div className="mb-4 grid gap-2">
                                                        <Label className="flex justify-between">
                                                            <Label isRequired>{t('common:labels.bank-account-name')}</Label>
                                                        </Label>
                                                        <Input
                                                            value={form.data.commission_withdrawal.bank_account_name}
                                                            onChange={(e) => {
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    commission_withdrawal: {
                                                                        ...data.commission_withdrawal,
                                                                        bank_account_name: e.target.value,
                                                                    },
                                                                }));
                                                            }}
                                                            onBlur={() => form.validate(`commission_withdrawal.bank_account_name`)}
                                                            aria-invalid={form.invalid(`commission_withdrawal.bank_account_name`)}
                                                        />
                                                        {form.invalid('commission_withdrawal.bank_account_name') && (
                                                            <InputError message={form.errors['commission_withdrawal.bank_account_name']} />
                                                        )}
                                                    </div>
                                                    <div className="mb-4 grid gap-2">
                                                        <Label className="flex justify-between">
                                                            <Label isRequired>{t('common:labels.bank-account-number')}</Label>
                                                        </Label>
                                                        <Input
                                                            value={form.data.commission_withdrawal.bank_account_number}
                                                            onChange={(e) => {
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    commission_withdrawal: {
                                                                        ...data.commission_withdrawal,
                                                                        bank_account_number: e.target.value,
                                                                    },
                                                                }));
                                                            }}
                                                            onBlur={() => form.validate(`commission_withdrawal.bank_account_number`)}
                                                            aria-invalid={form.invalid(`commission_withdrawal.bank_account_number`)}
                                                        />
                                                        {form.invalid('commission_withdrawal.bank_account_number') && (
                                                            <InputError message={form.errors['commission_withdrawal.bank_account_number']} />
                                                        )}
                                                    </div>
                                                    <div className="mb-4 grid gap-2">
                                                        <Label className="flex justify-between">
                                                            <Label isRequired>{t('common:labels.amount')}</Label>
                                                            <Badge className="rounded-sm py-1 text-[10px]">
                                                                {t('common:labels.minimum')}: {formatCurrency(minWithdrawal)}
                                                            </Badge>
                                                        </Label>
                                                        <InputMask
                                                            min={0}
                                                            prefix={locales.find((item) => item.locale === i18n.language).currency_symbol + ' '}
                                                            value={form.data.commission_withdrawal.display_amount}
                                                            onValueChange={(values) => {
                                                                const amount =
                                                                    values.floatValue /
                                                                    locales.find((item) => item.locale === i18n.language).usd_rate;
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    commission_withdrawal: {
                                                                        ...data.commission_withdrawal,
                                                                        amount,
                                                                        display_amount: values.floatValue,
                                                                    },
                                                                }));
                                                            }}
                                                            onBlur={() => form.validate(`commission_withdrawal.amount`)}
                                                            aria-invalid={form.invalid(`commission_withdrawal.display_amount`)}
                                                        />
                                                        {form.invalid('commission_withdrawal.display_amount') && (
                                                            <InputError message={form.errors['commission_withdrawal.display_amount']} />
                                                        )}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                            <DialogFooter>
                                                <Button type="submit" className={cn('w-full')} disabled={form.processing} onClick={handleSubmit}>
                                                    {!form.processing ? t('common:actions.submit') : t('common:loading.please-wait')}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </form>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-5 lg:col-span-8">
                        {/* STATS */}{' '}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                            {[
                                {
                                    label: t('common:labels.commission'),
                                    icon: <PercentCircleIcon className="text-primary h-6 w-6" />,
                                    value: `${formatAmount(config('affiliate').commission)}% / ${t('common:labels.deposit')}`,
                                    bg: 'bg-gradient-to-b to-0% from-primary to-accent',
                                    text: 'text-primary',
                                },
                                {
                                    label: t('affiliate:labels.total-referrals'),
                                    icon: <UserGroupIcon className="h-6 w-6 text-green-600" />,
                                    value: `${formatAmount(pageProps?.totalReferrals ?? 0)} ${t('common:labels.users')}`,
                                    bg: 'bg-gradient-to-b to-0% from-green-100 to-accent',
                                    text: 'text-green-600',
                                },
                            ].map((stat, index) => (
                                <div key={index} className={cn(`flex items-center justify-between rounded-xl p-4 shadow-sm ${stat.bg}`)}>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-transparent p-2 shadow-inner">{stat.icon}</div>
                                        <div>
                                            <div className={cn('text-sm font-semibold', stat.text)}>{stat.label}</div>
                                            <div className={cn('text-xs', stat.text)}>{stat.value}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Link01Icon className="size-4" /> {t('affiliate:labels.your-affiliate-link')}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative w-full">
                                <ButtonGroup className="relative flex w-full">
                                    <div className="flex-1">
                                        <Input
                                            value={route('user.ref-link', {
                                                refCode: auth.user.referral_code,
                                            })}
                                            className="w-full rounded-r-none border-r-0"
                                            readOnly
                                        />
                                    </div>
                                    <Button
                                        variant="default"
                                        aria-label="Search"
                                        onClick={() =>
                                            copyText(
                                                route('user.ref-link', {
                                                    refCode: auth.user.referral_code,
                                                }),
                                                t,
                                            )
                                        }
                                    >
                                        <Copy01Icon />{' '}
                                        {t('common:actions.copy-item', {
                                            item: '',
                                        })}
                                    </Button>
                                </ButtonGroup>
                                <div className="bg-muted mt-3 rounded-xl border p-3 px-3">
                                    <p className="text-[14px] leading-7 text-slate-600">{t('affiliate:information.referral-description')}</p>
                                </div>
                            </CardContent>
                        </Card>
                        {/* HISTORY */}
                        <DataTable
                            title={
                                <div className="flex items-center gap-2">
                                    <WorkHistoryIcon className="size-4" /> {t('affiliate:labels.withdrawal-history')}
                                </div>
                            }
                            pageProps={pageProps}
                            tableData={tableData}
                            initialGlobalFilterState={initialGlobalFilterState}
                            tableState={tableState}
                            columns={columns}
                            filters={filters}
                            rowSelectionActions={rowSelectionActions}
                            onChange={fetchData}
                            isLoading={isLoading}
                            additionalButton={[]}
                        />
                    </div>
                </div>
            </Deferred>
        </AppLayout>
    );
}
