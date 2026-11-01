import AppLayout from '@/components/layouts/app-layout';
import AppSkeleton from '@/components/layouts/app-skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { depositStatuses } from '@/enums/deposit';
import { orderStatuses } from '@/enums/order';
import { ticketDepartmentOptions, ticketRequestOptions } from '@/enums/ticket';
import { toast } from '@/hooks/use-toast';
import { cn, config } from '@/lib/utils';
import { Deferred, Link } from '@inertiajs/react';
import { LinkBackwardIcon, Loading02Icon, MailLove01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Send({ pageProps }) {
    const { t } = useTranslation('tickets');
    const [orders, setOrders] = useState(pageProps?.orders ?? []);
    const [deposits, setDeposits] = useState(pageProps?.deposits ?? []);
    const form = useForm('post', route('user.tickets.store'), {
        ticket: {
            department: '',
            data_id: [],
            subject: '',
            message: '',
        },
    });

    form.setValidationTimeout(3000);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: (errors) => {
                toast({
                    variant: 'error',
                    description: t('common:toast.invalid-input'),
                });
            },
        });
    };

    useEffect(() => {
        if (pageProps?.orders !== undefined) setOrders(pageProps.orders);
        if (pageProps?.deposits !== undefined) setDeposits(pageProps.deposits);
    }, [pageProps?.orders, pageProps?.deposits]);

    return (
        <AppLayout
            pageTitle={cn(
                t('common:actions.send-item', {
                    item: '',
                }),
                t('common:labels.tickets'),
            )}
            breadcrumbs={[
                {
                    title: config().name,
                    href: '/',
                },
                {
                    title: t('common:labels.tickets'),
                    href: '/',
                },
                {
                    title: t('common:actions.send-item', {
                        item: '',
                    }),
                    href: '/',
                },
            ]}
        >
            <Deferred data="pageProps" fallback={<AppSkeleton />}>
                <div className="mx-auto flex w-full flex-col items-start gap-4 sm:max-w-md">
                    <Link href={route('user.tickets.index')} className={buttonVariants({ variant: 'default', size: 'sm' })}>
                        <LinkBackwardIcon className="h-4 w-4" />
                        {t('common:actions.navigate.back')}
                    </Link>
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="font-medium">
                                {t('common:actions.send-item', {
                                    item: t('common:labels.ticket'),
                                })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                                <div className="grid gap-2">
                                    <Label isRequired>{t('tickets:labels.department')}</Label>
                                    <Select
                                        defaultValue={form.data.ticket.department}
                                        onValueChange={(value) => {
                                            form.setData('ticket', {
                                                ...form.data.ticket,
                                                department: value,
                                                data_id: [],
                                            });
                                            form.forgetError('ticket.department');
                                        }}
                                        onBlur={() => form.validate('ticket.department')}
                                    >
                                        <SelectTrigger className={cn('w-full')} aria-invalid={form.invalid('ticket.department')}>
                                            <SelectValue placeholder={t('common:placeholders.select')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ticketDepartmentOptions.map((department, index) => (
                                                <SelectItem value={department.value} key={index}>
                                                    {t(department.label)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.invalid('ticket.department') && <InputError message={form.errors['ticket.department']} />}
                                </div>
                                {['order', 'deposit'].includes(form.data.ticket.department) && (
                                    <div className="grid gap-2">
                                        <Label isRequired>
                                            ID {form.data.ticket.department === 'order' ? t('common:labels.orders') : t('common:labels.deposits')}
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger aria-invalid={form.invalid('ticket.data_id')} asChild>
                                                <Button variant="outline" role="combobox" className="h-auto justify-between px-3">
                                                    <div
                                                        className={cn(
                                                            'flex flex-wrap gap-2',
                                                            form.data.ticket.data_id.length > 0 ? 'font-normal' : 'text-muted-foreground',
                                                        )}
                                                    >
                                                        {form.data.ticket.data_id?.length
                                                            ? form.data.ticket.data_id.map((val, index) => (
                                                                  <div
                                                                      key={index}
                                                                      className="bg-muted rounded-xl border px-2 py-1 text-xs font-medium"
                                                                  >
                                                                      {
                                                                          (form.data.ticket.department === 'order' ? orders : deposits).find(
                                                                              (item) => item.value === val,
                                                                          )?.label
                                                                      }
                                                                  </div>
                                                              ))
                                                            : t('common:placeholders.select')}
                                                    </div>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="popover-content p-0">
                                                <Command>
                                                    <CommandInput placeholder={`${t('common:labels.search')} ${t('common:labels.id')}...`} />
                                                    <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandList>
                                                            {(form.data.ticket.department === 'order' ? orders : deposits).map((item) => (
                                                                <CommandItem
                                                                    key={item.value}
                                                                    value={item.value}
                                                                    className={form.data.ticket.data_id.includes(item.value) ? 'bg-muted' : ''}
                                                                    onSelect={() => {
                                                                        if (form.data.ticket.data_id.includes(item.value)) {
                                                                            form.setData('ticket', {
                                                                                ...form.data.ticket,
                                                                                data_id: form.data.ticket.data_id.filter(
                                                                                    (data) => data !== item.value,
                                                                                ),
                                                                            });
                                                                        } else {
                                                                            form.setData('ticket', {
                                                                                ...form.data.ticket,
                                                                                data_id: [...form.data.ticket.data_id, item.value],
                                                                            });
                                                                        }
                                                                        form.forgetError('ticket.data_id');
                                                                    }}
                                                                >
                                                                    <span
                                                                        className={`text-${form.data.ticket.department === 'order' ? orderStatuses[item.status].color : depositStatuses[item.status].color}`}
                                                                    >
                                                                        #{item.label} -{' '}
                                                                        {form.data.ticket.department === 'order'
                                                                            ? t(orderStatuses[item.status].label)
                                                                            : t(depositStatuses[item.status].label)}
                                                                    </span>
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            'ml-auto h-4 w-4',
                                                                            form.data.ticket.data_id.includes(item.value)
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0',
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandList>
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {form.invalid('ticket.data_id') && <InputError message={form.errors['ticket.data_id']} />}
                                    </div>
                                )}
                                {form.data.ticket.department === 'order' && (
                                    <div className="grid gap-2">
                                        <Label isRequired>{t('tickets:labels.request')}</Label>
                                        <Select
                                            defaultValue={form.data.ticket.request}
                                            onValueChange={(value) => {
                                                form.setData('ticket', {
                                                    ...form.data.ticket,
                                                    request: value,
                                                });
                                                form.forgetError('ticket.request');
                                            }}
                                            onBlur={() => form.validate('ticket.request')}
                                        >
                                            <SelectTrigger className={cn('w-full')} aria-invalid={form.invalid('ticket.request')}>
                                                <SelectValue placeholder={t('common:placeholders.select')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ticketRequestOptions.map((request, index) => (
                                                    <SelectItem value={request.value} key={index}>
                                                        {t(request.label)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.invalid('ticket.request') && <InputError message={form.errors['ticket.request']} />}
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label isRequired>{t('tickets:labels.subject')}</Label>
                                    <Input
                                        value={form.data.ticket.subject}
                                        onChange={(e) => {
                                            form.setData('ticket', {
                                                ...form.data.ticket,
                                                subject: e.target.value,
                                            });
                                        }}
                                        onBlur={() => form.validate('ticket.subject')}
                                        aria-invalid={form.invalid('ticket.subject')}
                                    />
                                    {form.invalid('ticket.subject') && <InputError message={form.errors['ticket.subject']} />}
                                </div>
                                <div className="grid gap-2">
                                    <Label isRequired>{t('tickets:labels.message')}</Label>
                                    <Textarea
                                        value={form.data.ticket.message}
                                        className="min-h-[200px]"
                                        onChange={(e) => {
                                            form.setData('ticket', {
                                                ...form.data.ticket,
                                                message: e.target.value,
                                            });
                                        }}
                                        onBlur={() => form.validate('ticket.message')}
                                        aria-invalid={form.invalid('ticket.message')}
                                        rows="5"
                                    />
                                    {form.invalid('ticket.message') && <InputError message={form.errors['ticket.message']} />}
                                </div>
                                <div className="d-grid">
                                    <Button size="sm" type="submit" className="w-full" disabled={form.processing}>
                                        {!form.processing ? (
                                            <>
                                                <MailLove01Icon className="h-4 w-4" /> {t('tickets:create.button')}
                                            </>
                                        ) : (
                                            <>
                                                <Loading02Icon className="h-4 w-4 animate-spin" /> {t('common:loading.please-wait')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </Deferred>
        </AppLayout>
    );
}
