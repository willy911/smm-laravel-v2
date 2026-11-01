import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { copyText } from '@/lib/utils';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CreateOrderRefillTabContent({ configs, t }) {
    const exampleRequestCodeString = `<?php

$curl = curl_init();
        
curl_setopt_array($curl, array(
    CURLOPT_URL => '${window.origin}/api/v2',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => array(
        'key'    => '',
        'action' => 'refill',
        'order' => '1'
    ),
));
        
$response = curl_exec($curl);

curl_close($curl);
echo $response;
`;

    const exampleResponseCodeString = `// ${t('api:labels.success')}
{
    "refill": "1"
}

// ${t('api:labels.fail')}
{
    "error": "Invalid API Key / Incorrect Request / ${t('api:responses.ip-not-whitelisted', { ip: '127.0.0.1' })}"
}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('api:labels.create-order-refill')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <h5 className="text-base font-semibold">1. {t('api:labels.endpoint')}</h5>
                    <div onClick={() => copyText(window.origin + '/api/v2', t)}>
                        <Input type="text" className="cursor-pointer" value={window.origin + '/api/v2'} readOnly />
                    </div>
                </div>
                <div className="space-y-2">
                    <h5 className="text-base font-semibold">2. {t('api:labels.body-request')}</h5>
                    <div className="overflow-x-auto rounded-lg border">
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
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">key</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.api-key.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.api-key.description')}</td>
                                    </tr>
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">action</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.secret-key.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {t('common:placeholders.fill-with-item', { item: '' })}

                                            <span className="text-destructive font-medium">refill</span>
                                        </td>
                                    </tr>
                                    <tr className="odd:bg-secondary">
                                        <td className="px-4 py-2 font-medium whitespace-nowrap">order</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <code className="bg-muted text-destructive rounded px-1 py-0.5">string</code>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.order-id.required')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{t('api:fields.order-id.description')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
