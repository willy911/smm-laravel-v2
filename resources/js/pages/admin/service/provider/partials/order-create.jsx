import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function OrderCreate({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">1. Endpoint</h5>
                <div className="grid grid-cols-5 items-start gap-4">
                    <div className="col-span-5 grid gap-2 md:col-span-1">
                        <Label isRequired>Method</Label>
                        <Select
                            defaultValue={form.data.service.provider_configuration.order_create.method}
                            onValueChange={(value) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_create: {
                                            ...form.data.service.provider_configuration.order_create,
                                            method: value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate(`service.provider_configuration.order_create.method`)}
                        >
                            <SelectTrigger aria-invalid={form.invalid('service.provider_configuration.order_create.method')}>
                                <SelectValue placeholder="Select Method..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="post">POST</SelectItem>
                                <SelectItem value="get">GET</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.invalid(`service.provider_configuration.order_create.method`) && (
                            <InputError message={form.errors[`service.provider_configuration.order_create.method`]} />
                        )}
                    </div>
                    <div className="col-span-5 grid gap-2 md:col-span-4">
                        <Label isRequired>URL</Label>
                        <Input
                            type="url"
                            value={form.data.service.provider_configuration.order_create.endpoint}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_create: {
                                            ...form.data.service.provider_configuration.order_create,
                                            endpoint: e.target.value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.order_create.endpoint')}
                            aria-invalid={form.invalid('service.provider_configuration.order_create.endpoint')}
                            readOnly={form.data.flazpedia}
                        />
                        {form.invalid('service.provider_configuration.order_create.endpoint') && (
                            <InputError message={form.errors['service.provider_configuration.order_create.endpoint']} />
                        )}
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">2. Request Parameters</h5>
                {form.data.service.provider_configuration.order_create.params.map((param, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-3 items-start gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>Type</Label>
                                <Select
                                    defaultValue={param.type}
                                    onValueChange={(value) => {
                                        const updatedParams = [...form.data.service.provider_configuration.order_create.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            type: value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_create: {
                                                    ...form.data.service.provider_configuration.order_create,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_create.params.${index}.type`)}
                                >
                                    <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.order_create.params.${index}.type`)}>
                                        <SelectValue placeholder="Select Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom</SelectItem>
                                        <SelectItem value="default_parameter">Default Parameter</SelectItem>
                                        <SelectItem value="service_id">Service ID</SelectItem>
                                        <SelectItem value="order_target">Target</SelectItem>
                                        <SelectItem value="order_quantity">Quantity</SelectItem>
                                        <SelectItem value="order_comments">Comments</SelectItem>
                                        <SelectItem value="order_usernames">Usernames</SelectItem>
                                        <SelectItem value="order_username">Username</SelectItem>
                                        <SelectItem value="order_hashtags">Hashtags</SelectItem>
                                        <SelectItem value="order_hashtag">Hashtag</SelectItem>
                                        <SelectItem value="order_media_url">Media URL</SelectItem>
                                        <SelectItem value="order_answer_number">Answer Number</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid(`service.provider_configuration.order_create.params.${index}.type`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_create.params.${index}.type`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Key</Label>
                                {param.type === 'default_parameter' ? (
                                    <Select
                                        defaultValue={param.key}
                                        onValueChange={(value) => {
                                            const updatedParams = [...form.data.service.provider_configuration.order_create.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    order_create: {
                                                        ...form.data.service.provider_configuration.order_create,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.order_create.params.${index}.key`)}
                                    >
                                        <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.order_create.params.${index}.key`)}>
                                            <SelectValue placeholder="Select Key..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {form.data.service.provider.default_parameters
                                                .filter(
                                                    (param) =>
                                                        !form.data.service.provider_configuration.order_create.params
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
                                            const updatedParams = [...form.data.service.provider_configuration.order_create.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: e.target.value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    order_create: {
                                                        ...form.data.service.provider_configuration.order_create,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.order_create.params.${index}.key`)}
                                        aria-invalid={form.invalid(`service.provider_configuration.order_create.params.${index}.key`)}
                                    />
                                )}
                                {form.invalid(`service.provider_configuration.order_create.params.${index}.key`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_create.params.${index}.key`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Value</Label>
                                <Input
                                    value={
                                        param.type === 'default_parameter'
                                            ? form.data.service.provider.default_parameters.find((p) => p.key === param.key)?.value
                                            : param.type === 'custom'
                                              ? (param.value ?? '')
                                              : 'Automatically Filled'
                                    }
                                    onChange={(e) => {
                                        const updatedParams = [...form.data.service.provider_configuration.order_create.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            value: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_create: {
                                                    ...form.data.service.provider_configuration.order_create,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_create.params.${index}.value`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.order_create.params.${index}.value`)}
                                    readOnly={param.type !== 'custom' ? true : false}
                                />
                                {form.invalid(`service.provider_configuration.order_create.params.${index}.value`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_create.params.${index}.value`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedParams = form.data.service.provider_configuration.order_create.params.filter(
                                    (column) => column.id !== param.id,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_create: {
                                            ...form.data.service.provider_configuration.order_create,
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
                                order_create: {
                                    ...form.data.service.provider_configuration.order_create,

                                    params: [
                                        ...form.data.service.provider_configuration.order_create.params,
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
                    value={form.data.service.provider_configuration.order_create.example_response}
                    className="min-h-[250px]"
                    onChange={(e) => {
                        form.setData('service', {
                            ...form.data.service,
                            provider_configuration: {
                                ...form.data.service.provider_configuration,
                                order_create: {
                                    ...form.data.service.provider_configuration.order_create,
                                    example_response: e.target.value,
                                },
                            },
                        });
                    }}
                    onBlur={() => form.validate('service.provider_configuration.order_create.example_response')}
                    aria-invalid={form.invalid('service.provider_configuration.order_create.example_response')}
                    rows="10"
                />
                {form.invalid('service.provider_configuration.order_create.example_response') && (
                    <InputError message={form.errors['service.provider_configuration.order_create.example_response']} />
                )}
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">4. Parse Response</h5>
                <div className="grid items-end gap-4 lg:grid-cols-5">
                    <div className="grid gap-2 lg:col-span-4">
                        <Label isRequired>Order ID</Label>
                        <Input
                            placeholder="e.g.: data.id"
                            value={form.data.service.provider_configuration.order_create.parse_response.order_id ?? ''}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_create: {
                                            ...form.data.service.provider_configuration.order_create,
                                            parse_response: {
                                                ...form.data.service.provider_configuration.order_create.parse_response,
                                                order_id: e.target.value,
                                            },
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.order_create.parse_response.order_id')}
                            aria-invalid={form.invalid('service.provider_configuration.order_create.parse_response.order_id')}
                        />
                        {form.invalid('service.provider_configuration.order_create.parse_response.order_id') && (
                            <InputError message={form.errors['service.provider_configuration.order_create.parse_response.order_id']} />
                        )}
                    </div>
                    <Button
                        className="w-full"
                        type="button"
                        size="sm"
                        onClick={() => {
                            if (!form.data.service.provider_configuration.order_create.example_response)
                                return toast({
                                    variant: 'error',
                                    description: 'Example Response is required.',
                                });
                            try {
                                const jsonResponse = JSON.parse(form.data.service.provider_configuration.order_create.example_response);
                                const parseResponse = form.data.service.provider_configuration.order_create.parse_response.order_id
                                    .split('.')
                                    .reduce((acc, key) => acc && acc[key], jsonResponse);
                                if (parseResponse === undefined || typeof parseResponse === 'object' || Array.isArray(parseResponse))
                                    return toast({
                                        variant: 'error',
                                        description: 'Invalid Order ID format.',
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
