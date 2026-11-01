import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, copyText, toHTML } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CreateOrderTabContent({ configs, pageProps, t }) {
    const [open, setOpen] = useState(false);
    const [selectedServiceType, setSelectedServiceType] = useState('primary');
    const exampleRequestCodeString = `<?php

$curl = curl_init();
        
curl_setopt_array($curl, array(
    CURLOPT_URL => '${window.origin}/api/order/create',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => array(
        'api_key'    => '',
        'secret_key' => '',
        'service_id' => 1,
        'target'     => 'example_target',
        'quantity'   => 100,
    ),
));
        
$response = curl_exec($curl);

curl_close($curl);
echo $response;
`;

    const exampleResponseCodeString = `// ${t('api:labels.success')}
{
    "status": true,
    "data": {
        "id": 1,
        "service_id": 1,
        "service_name": "Service Name",
        "target": "example_target",
        "quantity": 1000,
        "price": 100,
        "status": "pending",
        "start_count": 0,
        "remains": 0,
        "initial_balance": 500,
        "final_balance": 400,
        "created_at": "2024-01-01 00:00:01",
        "updated_at": "2024-01-01 00:01:00"
    }
}

// ${t('api:labels.fail')}
{
    "status": false,
    "message": "Invalid Payload",
    "errors": [
        "${t('api:responses.api-key-required')}",
        "${t('api:responses.secret-key-required')}",
        "${t('api:responses.ip-not-whitelisted', { ip: '127.0.0.1' })}",
        "${t('api:responses.service-id-required')}",
        "${t('api:responses.service-id-numeric')}",
        "${t('api:responses.service-id-invalid')}",
        "${t('api:responses.quantity-numeric')}",
        "${t('api:responses.quantity-min', { min: '1000' })}",
        "${t('api:responses.service-not-available')}",
        "${t('api:responses.insufficient-balance')}",
    ]
}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('api:labels.create-order')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <h5 className="text-base font-semibold">1. {t('api:labels.endpoint')}</h5>
                    <div onClick={() => copyText(window.origin + '/api/order/create', t)}>
                        <Input type="text" className="cursor-pointer" value={window.origin + '/api/order/create'} readOnly />
                    </div>
                </div>
                <div className="space-y-2">
                    <h5 className="text-base font-semibold">2. {t('api:labels.body-request')}</h5>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={open} className="w-72 justify-between">
                                {selectedServiceType
                                    ? pageProps.serviceTypes.find((item) => item.value === selectedServiceType)?.label
                                    : t('common:placeholders.select')}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="popover-content p-0">
                            <Command>
                                <CommandInput placeholder={`${t('common:labels.search')} ${t('common:labels.type')}...`} className="h-9" />
                                <CommandList>
                                    <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                    <CommandGroup>
                                        {pageProps.serviceTypes.map((serviceType) => (
                                            <CommandItem
                                                key={serviceType.value}
                                                value={serviceType.value}
                                                onSelect={(currentValue) => {
                                                    setSelectedServiceType(currentValue);
                                                    setOpen(false);
                                                }}
                                            >
                                                {serviceType.label}
                                                <CheckIcon
                                                    className={cn(
                                                        'ml-auto h-4 w-4',
                                                        selectedServiceType === serviceType.value ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="divide-border min-w-full divide-y-2 text-sm">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr>
                                    <th className="px-4 py-2 font-medium whitespace-nowrap">{t('api:labels.parameter')}</th>
                                    <th className="px-4 py-2 font-medium whitespace-nowrap">{t('api:labels.type')}</th>
                                    <th className="px-4 py-2 font-medium whitespace-nowrap">{t('api:labels.required')}</th>
                                    <th className="px-4 py-2 font-medium whitespace-nowrap">{t('api:labels.description')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                <tr className="odd:bg-secondary">
                                    <td className="px-4 py-2 font-medium whitespace-nowrap">api_key</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.api-key.required')}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.api-key.description')}</td>
                                </tr>
                                <tr className="odd:bg-secondary">
                                    <td className="px-4 py-2 font-medium whitespace-nowrap">secret_key</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.secret-key.required')}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.secret-key.description')}</td>
                                </tr>
                                <tr className="odd:bg-secondary">
                                    <td className="px-4 py-2 font-medium whitespace-nowrap">service_id</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <code className="bg-muted text-destructive rounded px-1 py-0.5">int</code>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.service-id.required')}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {toHTML(t('api:fields.service-id.description'))}
                                        {` `}
                                        <Link href={route('guest.services.index')} className="text-primary">
                                            {t('common:labels.here')}
                                        </Link>
                                    </td>
                                </tr>
                                <tr className="odd:bg-secondary">
                                    <td className="px-4 py-2 font-medium whitespace-nowrap">target</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.target.required')}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.target.description')}</td>
                                </tr>
                                {![
                                    'package',
                                    'custom_comments',
                                    'custom_comments_package',
                                    'comment_replies',
                                    'mentions_with_hashtags',
                                    'mentions_custom_list',
                                ].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">quantity</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">int</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.quantity.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.quantity.description')}</td>
                                    </tr>
                                )}
                                {['mentions_with_hashtags', 'mentions_custom_list'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">usernames</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.usernames.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.usernames.description'))}</td>
                                    </tr>
                                )}
                                {['mentions_with_hashtags'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">hashtags</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.hashtags.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.hashtags.description'))}</td>
                                    </tr>
                                )}
                                {['mentions_hashtag'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">hashtag</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.hashtag.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.hashtag.description'))}</td>
                                    </tr>
                                )}
                                {['comment_likes', 'comment_replies', 'mentions_user_followers'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">username</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.username.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.username.description'))}</td>
                                    </tr>
                                )}
                                {['mentions_media_likers'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">media</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.media.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.media.description'))}</td>
                                    </tr>
                                )}
                                {['poll'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">answer_number</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">int</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.answer-number.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.answer-number.description'))}</td>
                                    </tr>
                                )}
                                {['custom_comments', 'custom_comments_package', 'comment_replies'].includes(selectedServiceType) && (
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">comments</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.comments.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{toHTML(t('api:fields.comments.description'))}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="space-y-2">
                    <h5 className="text-base font-semibold">3. {t('api:labels.example-request')}</h5>
                    <div className="relative">
                        <div className="absolute top-2 right-2 flex space-x-2">
                            <Button size="sm" className="h-6">
                                PHP
                            </Button>
                            <Button variant="outline" size="sm" className="h-6" onClick={() => copyText(exampleRequestCodeString, t)}>
                                {t('common:actions.copy-item', {
                                    item: '',
                                })}
                            </Button>
                        </div>
                        <SyntaxHighlighter className="rounded-xl text-sm" language="php" style={nightOwl}>
                            {exampleRequestCodeString}
                        </SyntaxHighlighter>
                    </div>
                </div>
                <div className="space-y-2">
                    <h5 className="text-base font-semibold">4. {t('api:labels.example-response')}</h5>
                    <SyntaxHighlighter className="rounded-xl text-sm" language="json" style={nightOwl}>
                        {exampleResponseCodeString}
                    </SyntaxHighlighter>
                </div>
            </CardContent>
        </Card>
    );
}
