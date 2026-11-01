import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function OrderRefillCreate({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">1. Endpoint</h5>
                <div className="grid grid-cols-5 items-start gap-4">
                    <div className="col-span-5 grid gap-2 md:col-span-1">
                        <Label isRequired>Method</Label>
                        <Select
                            defaultValue={form.data.service.provider_configuration.order_refill_create.method}
                            onValueChange={(value) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_refill_create: {
                                            ...form.data.service.provider_configuration.order_refill_create,
                                            method: value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate(`service.provider_configuration.order_refill_create.method`)}
                        >
                            <SelectTrigger aria-invalid={form.invalid('service.provider_configuration.order_refill_create.method')}>
                                <SelectValue placeholder="Select Method..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="post">POST</SelectItem>
                                <SelectItem value="get">GET</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.invalid(`service.provider_configuration.order_refill_create.method`) && (
                            <InputError message={form.errors[`service.provider_configuration.order_refill_create.method`]} />
                        )}
                    </div>
                    <div className="col-span-5 grid gap-2 md:col-span-4">
                        <Label isRequired>URL</Label>
                        <Input
                            type="url"
                            value={form.data.service.provider_configuration.order_refill_create.endpoint}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_refill_create: {
                                            ...form.data.service.provider_configuration.order_refill_create,
                                            endpoint: e.target.value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.order_refill_create.endpoint')}
                            aria-invalid={form.invalid('service.provider_configuration.order_refill_create.endpoint')}
                            readOnly={form.data.flazpedia}
                        />
                        {form.invalid('service.provider_configuration.order_refill_create.endpoint') && (
                            <InputError message={form.errors['service.provider_configuration.order_refill_create.endpoint']} />
                        )}
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">2. Request Parameters</h5>
                {form.data.service.provider_configuration.order_refill_create.params.map((param, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-3 items-start gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>Type</Label>
                                <Select
                                    defaultValue={param.type}
                                    onValueChange={(value) => {
                                        const updatedParams = [...form.data.service.provider_configuration.order_refill_create.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            type: value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_refill_create: {
                                                    ...form.data.service.provider_configuration.order_refill_create,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_refill_create.params.${index}.type`)}
                                >
                                    <SelectTrigger
                                        aria-invalid={form.invalid(`service.provider_configuration.order_refill_create.params.${index}.type`)}
                                    >
                                        <SelectValue placeholder="Select Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom</SelectItem>
                                        <SelectItem value="default_parameter">Default Parameter</SelectItem>
                                        <SelectItem value="order_id">Order ID</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid(`service.provider_configuration.order_refill_create.params.${index}.type`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_refill_create.params.${index}.type`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Key</Label>
                                {param.type === 'default_parameter' ? (
                                    <Select
                                        defaultValue={param.key}
                                        onValueChange={(value) => {
                                            const updatedParams = [...form.data.service.provider_configuration.order_refill_create.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    order_refill_create: {
                                                        ...form.data.service.provider_configuration.order_refill_create,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.order_refill_create.params.${index}.key`)}
                                    >
                                        <SelectTrigger
                                            aria-invalid={form.invalid(`service.provider_configuration.order_refill_create.params.${index}.key`)}
                                        >
                                            <SelectValue placeholder="Select Key..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {form.data.service.provider.default_parameters
                                                .filter(
                                                    (param) =>
                                                        !form.data.service.provider_configuration.order_refill_create.params
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
                                            const updatedParams = [...form.data.service.provider_configuration.order_refill_create.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: e.target.value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    order_refill_create: {
                                                        ...form.data.service.provider_configuration.order_refill_create,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.order_refill_create.params.${index}.key`)}
                                        aria-invalid={form.invalid(`service.provider_configuration.order_refill_create.params.${index}.key`)}
                                    />
                                )}
                                {form.invalid(`service.provider_configuration.order_refill_create.params.${index}.key`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_refill_create.params.${index}.key`]} />
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
                                        const updatedParams = [...form.data.service.provider_configuration.order_refill_create.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            value: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_refill_create: {
                                                    ...form.data.service.provider_configuration.order_refill_create,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_refill_create.params.${index}.value`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.order_refill_create.params.${index}.value`)}
                                    readOnly={param.type !== 'custom' ? true : false}
                                />
                                {form.invalid(`service.provider_configuration.order_refill_create.params.${index}.value`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_refill_create.params.${index}.value`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedParams = form.data.service.provider_configuration.order_refill_create.params.filter(
                                    (column) => column.id !== param.id,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_refill_create: {
                                            ...form.data.service.provider_configuration.order_refill_create,
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
                                order_refill_create: {
                                    ...form.data.service.provider_configuration.order_refill_create,

                                    params: [
                                        ...form.data.service.provider_configuration.order_refill_create.params,
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
            {/* <div className="grid gap-2">
                <h5 className="text-base font-semibold">3. Request Settings</h5>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sendRequestAsBulk"
                                checked={form.data.service.provider_configuration.order_refill_create.send_request_as_bulk}
                                onCheckedChange={(checked) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_create: {
                                                ...form.data.service.provider_configuration.order_refill_create,
                                                send_request_as_bulk: checked,
                                            },
                                        },
                                    });
                                }}
                            />
                            <Label htmlFor="sendRequestAsBulk">Send Bulk Request</Label>
                        </div>
                        {form.invalid('service.provider_configuration.order_refill_create.send_request_as_bulk') && (
                            <InputError message={form.errors['service.provider_configuration.order_refill_create.send_request_as_bulk']} />
                        )}
                    </div>
                    {form.data.service.provider_configuration.order_refill_create.send_request_as_bulk && (
                        <div className="grid gap-2">
                            <Label isRequired>Order ID Separator</Label>
                            <Input
                                placeholder="e.g.: ,"
                                value={form.data.service.provider_configuration.order_refill_create.order_id_separator}
                                className={
                                    form.invalid('service.provider_configuration.order_refill_create.order_id_separator')
                                        ? 'border-red-500 focus-visible:ring-red-500/50'
                                        : ''
                                }
                                onChange={(e) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_create: {
                                                ...form.data.service.provider_configuration.order_refill_create,
                                                order_id_separator: e.target.value,
                                            },
                                        },
                                    });
                                }}
                                onBlur={() => form.validate('service.provider_configuration.order_refill_create.order_id_separator')}
                            />
                            {form.invalid('service.provider_configuration.order_refill_create.order_id_separator') && (
                                <InputError message={form.errors['service.provider_configuration.order_refill_create.order_id_separator']} />
                            )}
                        </div>
                    )}
                </div>
            </div> */}
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">3. Example Response (JSON)</h5>
                <Textarea
                    value={form.data.service.provider_configuration.order_refill_create.example_response}
                    className="min-h-[250px]"
                    onChange={(e) => {
                        form.setData('service', {
                            ...form.data.service,
                            provider_configuration: {
                                ...form.data.service.provider_configuration,
                                order_refill_create: {
                                    ...form.data.service.provider_configuration.order_refill_create,
                                    example_response: e.target.value,
                                },
                            },
                        });
                    }}
                    onBlur={() => form.validate('service.provider_configuration.order_refill_create.example_response')}
                    aria-invalid={form.invalid('service.provider_configuration.order_refill_create.example_response')}
                    rows="10"
                />
                {form.invalid('service.provider_configuration.order_refill_create.example_response') && (
                    <InputError message={form.errors['service.provider_configuration.order_refill_create.example_response']} />
                )}
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">4. Parse Response</h5>
                {/* {form.data.service.provider_configuration.order_refill_create.send_request_as_bulk && (
                    <div className="mb-3 grid items-end gap-4 lg:grid-cols-5">
                        <div className="grid gap-2 lg:col-span-4">
                            <Label isRequired>Looping</Label>
                            <Input
                                placeholder="e.g.: data"
                                value={form.data.service.provider_configuration.order_refill_create.parse_response.looping ?? ''}
                                className={
                                    form.invalid('service.provider_configuration.order_refill_create.parse_response.looping')
                                        ? 'border-red-500 focus-visible:ring-red-500/50'
                                        : ''
                                }
                                onChange={(e) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_create: {
                                                ...form.data.service.provider_configuration.order_refill_create,
                                                parse_response: {
                                                    ...form.data.service.provider_configuration.order_refill_create.parse_response,
                                                    looping: e.target.value,
                                                },
                                            },
                                        },
                                    });
                                }}
                                onBlur={() => form.validate('service.provider_configuration.order_refill_create.parse_response.looping')}
                            />
                            {form.invalid('service.provider_configuration.order_refill_create.parse_response.looping') && (
                                <InputError message={form.errors['service.provider_configuration.order_refill_create.parse_response.looping']} />
                            )}
                        </div>
                        <Button
                            className="w-full"
                            type="button"
                            size="sm"
                            onClick={() => {
                                if (!form.data.service.provider_configuration.order_refill_create.example_response)
                                    return toast({
                                        variant: 'error',
                                        description: 'Example Response is required.',
                                    });
                                try {
                                    const jsonResponse = JSON.parse(form.data.service.provider_configuration.order_refill_create.example_response);
                                    if (!form.data.service.provider_configuration.order_refill_create.parse_response.looping) {
                                        if (
                                            !Array.isArray(jsonResponse) ||
                                            !jsonResponse.every((item) => typeof item === 'object' && !Array.isArray(item))
                                        )
                                            return toast({
                                                variant: 'error',
                                                description: 'Invalid Looping format.',
                                            });
                                        return toast({
                                            variant: 'success',
                                            description: `Valid response`,
                                        });
                                    } else {
                                        const parseResponse = form.data.service.provider_configuration.order_refill_create.parse_response.looping
                                            .split('.')
                                            .reduce((acc, key) => acc && acc[key], jsonResponse);
                                        if (
                                            parseResponse === undefined ||
                                            !Array.isArray(parseResponse) ||
                                            !parseResponse.every((item) => typeof item === 'object' && !Array.isArray(item))
                                        )
                                            return toast({
                                                variant: 'error',
                                                description: 'Invalid Looping format.',
                                            });
                                        return toast({
                                            variant: 'success',
                                            description: `Valid response`,
                                        });
                                    }
                                } catch (error) {
                                    return toast({
                                        variant: 'error',
                                        description: 'Format Example Response tidak valid.',
                                    });
                                }
                            }}
                        >
                            Check
                        </Button>
                    </div>
                )} */}
                {Object.entries(form.data.service.provider_configuration.order_refill_create.parse_response)
                    .filter((column) => column[0] !== 'looping')
                    .map((column, index) => (
                        <div className="grid items-end gap-4 lg:grid-cols-5" key={index}>
                            <div className="grid gap-2 lg:col-span-4">
                                <Label isRequired>
                                    {
                                        [
                                            {
                                                order_refill_id: 'Order Refill ID',
                                            },
                                        ].find((item) => item.hasOwnProperty(column[0]))[column[0]]
                                    }
                                </Label>
                                <Input
                                    placeholder={`e.g.: data.refill`}
                                    value={form.data.service.provider_configuration.order_refill_create.parse_response[column[0]] ?? ''}
                                    onChange={(e) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_refill_create: {
                                                    ...form.data.service.provider_configuration.order_refill_create,
                                                    parse_response: {
                                                        ...form.data.service.provider_configuration.order_refill_create.parse_response,
                                                        [column[0]]: e.target.value,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_refill_create.parse_response.${column[0]}`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.order_refill_create.parse_response.${column[0]}`)}
                                />
                                {form.invalid(`service.provider_configuration.order_refill_create.parse_response.${column[0]}`) && (
                                    <InputError
                                        message={form.errors[`service.provider_configuration.order_refill_create.parse_response.${column[0]}`]}
                                    />
                                )}
                            </div>
                            <Button
                                className="w-full"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    const columnName = [
                                        {
                                            order_refill_id: 'Order Refill ID',
                                        },
                                    ].find((item) => item.hasOwnProperty(column[0]));
                                    if (!form.data.service.provider_configuration.order_refill_create.example_response)
                                        return toast({
                                            variant: 'error',
                                            description: 'Example Response wajib diisi.',
                                        });
                                    try {
                                        const jsonResponse = JSON.parse(
                                            form.data.service.provider_configuration.order_refill_create.example_response,
                                        );
                                        if (form.data.service.provider_configuration.order_refill_create.send_request_as_bulk) {
                                            if (!form.data.service.provider_configuration.order_refill_create.parse_response.looping) {
                                                if (
                                                    !Array.isArray(jsonResponse) ||
                                                    !jsonResponse.every((item) => typeof item === 'object' && !Array.isArray(item))
                                                )
                                                    return toast({
                                                        variant: 'error',
                                                        description: 'Invalid Looping format.',
                                                    });
                                                jsonResponse.forEach((item) => {
                                                    if (
                                                        item[
                                                            form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]
                                                        ] === undefined ||
                                                        typeof item[
                                                            form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]
                                                        ] === 'object' ||
                                                        Array.isArray(
                                                            item[
                                                                form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]
                                                            ],
                                                        )
                                                    )
                                                        return toast({
                                                            variant: 'error',
                                                            description: `Invalid ${columnName[column[0]]} format.`,
                                                        });
                                                    return toast({
                                                        variant: 'success',
                                                        description: `Response valid: ${item[form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]]}`,
                                                    });
                                                });
                                            } else {
                                                const parseResponse =
                                                    form.data.service.provider_configuration.order_refill_create.parse_response.looping
                                                        .split('.')
                                                        .reduce((acc, key) => acc && acc[key], jsonResponse);
                                                if (
                                                    parseResponse === undefined ||
                                                    !Array.isArray(parseResponse) ||
                                                    !parseResponse.every((item) => typeof item === 'object' && !Array.isArray(item))
                                                )
                                                    return toast({
                                                        variant: 'error',
                                                        description: 'Format Looping is invalid.',
                                                    });
                                                parseResponse.forEach((item) => {
                                                    if (
                                                        item[
                                                            form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]
                                                        ] === undefined ||
                                                        typeof item[
                                                            form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]
                                                        ] === 'object' ||
                                                        Array.isArray(
                                                            item[
                                                                form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]
                                                            ],
                                                        )
                                                    )
                                                        return toast({
                                                            variant: 'error',
                                                            description: `Format ${columnName[column[0]]} is invalid.`,
                                                        });
                                                    return toast({
                                                        variant: 'success',
                                                        description: `Response valid: ${item[form.data.service.provider_configuration.order_refill_create.parse_response[column[0]]]}`,
                                                    });
                                                });
                                            }
                                        } else {
                                            const parseResponse = form.data.service.provider_configuration.order_refill_create.parse_response[
                                                column[0]
                                            ]
                                                .split('.')
                                                .reduce((acc, key) => acc && acc[key], jsonResponse);
                                            if (parseResponse === undefined || typeof parseResponse === 'object' || Array.isArray(parseResponse))
                                                return toast({
                                                    variant: 'error',
                                                    description: `Format ${columnName[column[0]]} is invalid.`,
                                                });
                                            return toast({
                                                variant: 'success',
                                                description: `Response valid: ${parseResponse}`,
                                            });
                                        }
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
                    ))}
            </div>
        </div>
    );
}
