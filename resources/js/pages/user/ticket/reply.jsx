import AppLayout from '@/components/layouts/app-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ticketDepartments, ticketRequests, ticketStatuses } from '@/enums/ticket';
import { toast } from '@/hooks/use-toast';
import { cn, config, formatDate } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { LinkBackwardIcon, Loading02Icon, UserCircleIcon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function Reply({ pageProps }) {
    const { t } = useTranslation('tickets');
    const scrollAreaRef = useRef(null);

    const form = useForm(
        'put',
        route('user.tickets.update', {
            target: pageProps.target.id ?? null,
        }),
        {
            ticket: {
                reply: {
                    message: '',
                },
            },
        },
    );

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
        scrollAreaRef.current?.scrollIntoView();
    }, [pageProps.target.ticket_replies.length]);

    return (
        <AppLayout
            pageTitle={cn(
                t('common:actions.reply-item', {
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
                    title: t('common:actions.reply-item', {
                        item: '',
                    }),
                    href: '/',
                },
            ]}
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-12">
                    <Link href={route('user.tickets.index')} className={buttonVariants({ variant: 'default', size: 'sm' })}>
                        <LinkBackwardIcon className="h-4 w-4" />
                        {t('common:actions.navigate.back')}
                    </Link>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-medium">
                                        {t('common:actions.reply-item', {
                                            item: t('common:labels.ticket'),
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-3">
                                    <div className="max-h-96 overflow-y-auto rounded-xl border py-3">
                                        <div className="flex flex-row justify-between">
                                            <div className="flex w-full flex-col justify-between px-4">
                                                <div className="flex flex-col">
                                                    {pageProps.target.ticket_replies.map((ticketReply, index) => (
                                                        <div key={index}>
                                                            {ticketReply.sender === 'user' ? (
                                                                <div className="mb-4 flex items-end justify-end">
                                                                    <div
                                                                        className="bg-primary text-primary-foreground mr-2 max-w-lg rounded-tl-3xl rounded-tr-xl rounded-bl-3xl px-4 py-1.5 text-sm"
                                                                        style={{
                                                                            whiteSpace: 'pre-line',
                                                                            overflowWrap: 'break-word',
                                                                            wordBreak: 'break-word',
                                                                        }}
                                                                    >
                                                                        {ticketReply.message}
                                                                    </div>
                                                                    <UserCircleIcon className="text-primary h-7 w-7 flex-shrink-0" />
                                                                </div>
                                                            ) : (
                                                                <div className="mb-4 flex items-end justify-start">
                                                                    <UserCircleIcon className="text-muted-foreground h-7 w-7 flex-shrink-0" />
                                                                    <div
                                                                        className="bg-muted text-muted-foreground ml-2 max-w-lg rounded-tl-xl rounded-tr-3xl rounded-br-3xl px-4 py-1.5 text-sm"
                                                                        style={{
                                                                            whiteSpace: 'pre-line',
                                                                            overflowWrap: 'break-word',
                                                                            wordBreak: 'break-word',
                                                                        }}
                                                                    >
                                                                        {ticketReply.message}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <div ref={scrollAreaRef} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {pageProps.target.status !== 'closed' && (
                                        <form className="grid" onSubmit={handleSubmit} autoComplete="off">
                                            <div className="mb-4 grid gap-2">
                                                <Label isRequired>{t('tickets:labels.message')}</Label>
                                                <Textarea
                                                    value={form.data.ticket.reply.message}
                                                    onChange={(e) => {
                                                        form.setData('ticket', {
                                                            ...form.data.ticket,
                                                            reply: {
                                                                ...form.data.ticket.reply,
                                                                message: e.target.value,
                                                            },
                                                        });
                                                    }}
                                                    onBlur={() => form.validate('ticket.reply.message')}
                                                    aria-invalid={form.invalid('ticket.reply.message')}
                                                    rows="5"
                                                />
                                                {form.invalid('ticket.reply.message') && <InputError message={form.errors['ticket.reply.message']} />}
                                            </div>
                                            <div className="d-grid">
                                                <Button size="sm" type="submit" className={cn('w-full')} disabled={form.processing}>
                                                    {form.processing && <Loading02Icon className="h-4 w-4 animate-spin" />}
                                                    {!form.processing ? t('tickets:edit.button') : t('common:loading.please-wait')}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-medium">{t('tickets:labels.ticket-information')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 p-3">
                                    <div>
                                        <h2 className="mb-1 text-sm font-semibold">{t('common:labels.id')}</h2>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-muted-foreground text-sm">{pageProps.target.id}</p>
                                        </div>
                                    </div>
                                    <div className="border-t pt-3">
                                        <h2 className="mb-1 text-sm font-semibold">{t('tickets:labels.department')}</h2>
                                        <p className="text-muted-foreground text-sm">{t(ticketDepartments[pageProps.target.department].label)}</p>
                                    </div>
                                    {pageProps.target.department === 'order' && (
                                        <div className="border-t pt-3">
                                            <h2 className="mb-1 text-sm font-semibold">{t('tickets:labels.request')}</h2>
                                            <p className="text-muted-foreground text-sm">{t(ticketRequests[pageProps.target.request].label)}</p>
                                        </div>
                                    )}
                                    <div className="border-t pt-3">
                                        <h2 className="mb-1 text-sm font-semibold">{t('tickets:labels.subject')}</h2>
                                        <p className="text-muted-foreground text-sm">{pageProps.target.subject}</p>
                                    </div>
                                    {pageProps.target.data_id && (
                                        <div className="border-t pt-3">
                                            <h2 className="mb-1 text-sm font-semibold">
                                                ID{' '}
                                                {pageProps.target.department === 'deposit' ? t('common:labels.deposits') : t('common:labels.orders')}
                                            </h2>

                                            <p className="text-muted-foreground text-sm">
                                                {pageProps.target.data_id
                                                    .split(',')
                                                    .map((item) => item.trim())
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    )}
                                    <div className="border-t pt-3">
                                        <h2 className="mb-1 text-sm font-semibold">{t('common:labels.status')}</h2>
                                        <div className="flex items-center space-x-2">
                                            <span className={ticketStatuses[pageProps.target.status].textColor}>
                                                {t(ticketStatuses[pageProps.target.status].label)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t pt-3">
                                        <h2 className="mb-1 text-sm font-semibold">{t('common:labels.created-at')}</h2>
                                        <p className="text-muted-foreground text-sm">
                                            {formatDate({
                                                date: pageProps.target.created_at,
                                            })}
                                        </p>
                                    </div>
                                    <div className="border-t pt-3">
                                        <h2 className="mb-1 text-sm font-semibold">{t('common:labels.updated-at')}</h2>
                                        <p className="text-muted-foreground text-sm">
                                            {formatDate({
                                                date: pageProps.target.updated_at,
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
