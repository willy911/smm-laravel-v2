import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function Balance({ form }) {
    return (
        <div className="space-y-4">
            {/* 1. Endpoint */}
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">1. Endpoint</h5>
                <div className="grid items-start gap-4 md:grid-cols-5">
                    <div className="col-span-5 grid gap-2 md:col-span-1">
                        <Label isRequired>Method</Label>
                        <Select
                            defaultValue={form.data.service.provider_configuration.account.method}
                            onValueChange={(value) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        account: {
                                            ...form.data.service.provider_configuration.account,
                                            method: value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate(`service.provider_configuration.account.method`)}
                        >
                            <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.account.method`)}>
                                <SelectValue placeholder="Select Method..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="post">POST</SelectItem>
                                <SelectItem value="get">GET</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.invalid(`service.provider_configuration.account.method`) && (
                            <InputError message={form.errors[`service.provider_configuration.account.method`]} />
                        )}
                    </div>
                    <div className="col-span-5 grid gap-2 md:col-span-4">
                        <Label isRequired>URL</Label>
                        <Input
                            type="url"
                            value={form.data.service.provider_configuration.account.endpoint}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        account: {
                                            ...form.data.service.provider_configuration.account,
                                            endpoint: e.target.value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.account.endpoint')}
                            aria-invalid={form.invalid('service.provider_configuration.account.endpoint')}
                            readOnly={form.data.miraipedia}
                        />
                        {form.invalid('service.provider_configuration.account.endpoint') && (
                            <InputError message={form.errors['service.provider_configuration.account.endpoint']} />
                        )}
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">2. Request Parameters</h5>
                {form.data.service.provider_configuration.account.params.map((param, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-3 items-start gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>Type</Label>
                                <Select
                                    defaultValue={param.type}
                                    onValueChange={(value) => {
                                        const updatedParams = [...form.data.service.provider_configuration.account.params];
                                        updatedParams[index] = { ...updatedParams[index], type: value };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                account: {
                                                    ...form.data.service.provider_configuration.account,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.account.params.${index}.type`)}
                                >
                                    <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.account.params.${index}.type`)}>
                                        <SelectValue placeholder="Select Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom</SelectItem>
                                        <SelectItem value="default_parameter">Default Parameter</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid(`service.provider_configuration.account.params.${index}.type`) && (
                                    <InputError message={form.errors[`service.provider_configuration.account.params.${index}.type`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Key</Label>
                                {param.type === 'default_parameter' ? (
                                    <Select
                                        defaultValue={param.key}
                                        onValueChange={(value) => {
                                            const updatedParams = [...form.data.service.provider_configuration.account.params];
                                            updatedParams[index] = { ...updatedParams[index], key: value };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    account: {
                                                        ...form.data.service.provider_configuration.account,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.account.params.${index}.key`)}
                                    >
                                        <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.account.params.${index}.key`)}>
                                            <SelectValue placeholder="Select Key..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {form.data.service.provider.default_parameters
                                                .filter(
                                                    (param) =>
                                                        !form.data.service.provider_configuration.account.params
                                                            .filter((param) => param.type === 'default_parameter')
                                                            .map((param) => param.key)
                                                            .includes(param.key) && param.key !== '',
                                                )
                                                .map((item, index) => (
                                                    <SelectItem value={item.key} key={index}>
                                                        {item.key}
                                                    </SelectItem>
                                                ))}
                                            {param.key && <SelectItem value={param.key}>{param.key}</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={param.key ?? ''}
                                        onChange={(e) => {
                                            const updatedParams = [...form.data.service.provider_configuration.account.params];
                                            updatedParams[index] = { ...updatedParams[index], key: e.target.value };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    account: {
                                                        ...form.data.service.provider_configuration.account,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.account.params.${index}.key`)}
                                        aria-invalid={form.invalid(`service.provider_configuration.account.params.${index}.key`)}
                                    />
                                )}
                                {form.invalid(`service.provider_configuration.account.params.${index}.key`) && (
                                    <InputError message={form.errors[`service.provider_configuration.account.params.${index}.key`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Value</Label>
                                <Input
                                    value={
                                        param.type === 'default_parameter'
                                            ? form.data.service.provider.default_parameters.find((p) => p.key === param.key)?.value
                                            : (param.value ?? '')
                                    }
                                    onChange={(e) => {
                                        const updatedParams = [...form.data.service.provider_configuration.account.params];
                                        updatedParams[index] = { ...updatedParams[index], value: e.target.value };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                account: {
                                                    ...form.data.service.provider_configuration.account,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.account.params.${index}.value`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.account.params.${index}.value`)}
                                    readOnly={param.type === 'default_parameter'}
                                />
                                {form.invalid(`service.provider_configuration.account.params.${index}.value`) && (
                                    <InputError message={form.errors[`service.provider_configuration.account.params.${index}.value`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedParams = form.data.service.provider_configuration.account.params.filter(
                                    (column) => column.id !== param.id,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        account: {
                                            ...form.data.service.provider_configuration.account,
                                            params: updatedParams,
                                        },
                                    },
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                ))}
                <Button
                    className="w-40"
                    type="button"
                    size="sm"
                    onClick={() => {
                        form.setData('service', {
                            ...form.data.service,
                            provider_configuration: {
                                ...form.data.service.provider_configuration,
                                account: {
                                    ...form.data.service.provider_configuration.account,
                                    params: [
                                        ...form.data.service.provider_configuration.account.params,
                                        { id: uuidv4(), key: '', type: '', value: '' },
                                    ],
                                },
                            },
                        });
                    }}
                >
                    Add Parameter
                </Button>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">3. Example Response (JSON)</h5>
                <Textarea
                    value={form.data.service.provider_configuration.account.example_response}
                    className="min-h-[250px]"
                    onChange={(e) => {
                        form.setData('service', {
                            ...form.data.service,
                            provider_configuration: {
                                ...form.data.service.provider_configuration,
                                account: {
                                    ...form.data.service.provider_configuration.account,
                                    example_response: e.target.value,
                                },
                            },
                        });
                    }}
                    onBlur={() => form.validate('service.provider_configuration.account.example_response')}
                    aria-invalid={form.invalid('service.provider_configuration.account.example_response')}
                    rows="10"
                />
                {form.invalid('service.provider_configuration.account.example_response') && (
                    <InputError message={form.errors['service.provider_configuration.account.example_response']} />
                )}
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">4. Parse Response</h5>
                <div className="grid items-end gap-4 lg:grid-cols-5">
                    <div className="grid gap-2 lg:col-span-4">
                        <Label isRequired>Account Balance</Label>
                        <Input
                            placeholder="e.g. data.balance"
                            value={form.data.service.provider_configuration.account.parse_response.balance}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        account: {
                                            ...form.data.service.provider_configuration.account,
                                            parse_response: {
                                                ...form.data.service.provider_configuration.account.parse_response,
                                                balance: e.target.value,
                                            },
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.account.parse_response.balance')}
                            aria-invalid={form.invalid('service.provider_configuration.account.parse_response.balance')}
                        />
                        {form.invalid('service.provider_configuration.account.parse_response.balance') && (
                            <InputError message={form.errors['service.provider_configuration.account.parse_response.balance']} />
                        )}
                    </div>
                    <Button
                        className="w-full"
                        type="button"
                        size="sm"
                        onClick={() => {
                            if (!form.data.service.provider_configuration.account.example_response)
                                return toast({
                                    variant: 'error',
                                    description: 'Example Response is required.',
                                });
                            try {
                                const jsonResponse = JSON.parse(form.data.service.provider_configuration.account.example_response);
                                const parseResponse = form.data.service.provider_configuration.account.parse_response.balance
                                    .split('.')
                                    .reduce((acc, key) => acc && acc[key], jsonResponse);
                                if (parseResponse === undefined || typeof parseResponse === 'object' || Array.isArray(parseResponse))
                                    return toast({
                                        variant: 'error',
                                        description: 'Invalid Account Balance format.',
                                    });
                                return toast({
                                    variant: 'success',
                                    description: `Valid response: ${parseResponse}`,
                                });
                            } catch (error) {
                                return toast({
                                    variant: 'error',
                                    description: 'Invalid Example Response format.',
                                });
                            }
                        }}
                    >
                        Check
                    </Button>
                </div>
            </div>
        </div>
    );
}
