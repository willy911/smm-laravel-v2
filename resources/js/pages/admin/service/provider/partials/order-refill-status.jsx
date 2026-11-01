import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function OrderRefillStatus({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">1. Endpoint</h5>
                <div className="grid grid-cols-5 items-start gap-4">
                    <div className="col-span-5 grid gap-2 md:col-span-1">
                        <Label isRequired>Method</Label>
                        <Select
                            defaultValue={form.data.service.provider_configuration.order_refill_status.method}
                            onValueChange={(value) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_refill_status: {
                                            ...form.data.service.provider_configuration.order_refill_status,
                                            method: value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate(`service.provider_configuration.order_refill_status.method`)}
                        >
                            <SelectTrigger aria-invalid={form.invalid('service.provider_configuration.order_refill_status.method')}>
                                <SelectValue placeholder="Select Method..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="post">POST</SelectItem>
                                <SelectItem value="get">GET</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.invalid(`service.provider_configuration.order_refill_status.method`) && (
                            <InputError message={form.errors[`service.provider_configuration.order_refill_status.method`]} />
                        )}
                    </div>
                    <div className="col-span-5 grid gap-2 md:col-span-4">
                        <Label isRequired>URL</Label>
                        <Input
                            type="url"
                            value={form.data.service.provider_configuration.order_refill_status.endpoint}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_refill_status: {
                                            ...form.data.service.provider_configuration.order_refill_status,
                                            endpoint: e.target.value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.order_refill_status.endpoint')}
                            aria-invalid={form.invalid('service.provider_configuration.order_refill_status.endpoint')}
                            readOnly={form.data.flazpedia}
                        />
                        {form.invalid('service.provider_configuration.order_refill_status.endpoint') && (
                            <InputError message={form.errors['service.provider_configuration.order_refill_status.endpoint']} />
                        )}
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">2. Request Parameters</h5>
                {form.data.service.provider_configuration.order_refill_status.params.map((param, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-3 items-start gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>Type</Label>
                                <Select
                                    defaultValue={param.type}
                                    onValueChange={(value) => {
                                        const updatedParams = [...form.data.service.provider_configuration.order_refill_status.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            type: value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_refill_status: {
                                                    ...form.data.service.provider_configuration.order_refill_status,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_refill_status.params.${index}.type`)}
                                >
                                    <SelectTrigger
                                        aria-invalid={form.invalid(`service.provider_configuration.order_refill_status.params.${index}.type`)}
                                    >
                                        <SelectValue placeholder="Select Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom</SelectItem>
                                        <SelectItem value="default_parameter">Default Parameter</SelectItem>
                                        <SelectItem value="order_refill_id">Order Refill ID</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid(`service.provider_configuration.order_refill_status.params.${index}.type`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_refill_status.params.${index}.type`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Key</Label>
                                {param.type === 'default_parameter' ? (
                                    <Select
                                        defaultValue={param.key}
                                        onValueChange={(value) => {
                                            const updatedParams = [...form.data.service.provider_configuration.order_refill_status.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    order_refill_status: {
                                                        ...form.data.service.provider_configuration.order_refill_status,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.order_refill_status.params.${index}.key`)}
                                    >
                                        <SelectTrigger
                                            aria-invalid={form.invalid(`service.provider_configuration.order_refill_status.params.${index}.key`)}
                                        >
                                            <SelectValue placeholder="Select Key..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {form.data.service.provider.default_parameters
                                                .filter(
                                                    (param) =>
                                                        !form.data.service.provider_configuration.order_refill_status.params
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
                                            const updatedParams = [...form.data.service.provider_configuration.order_refill_status.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: e.target.value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    order_refill_status: {
                                                        ...form.data.service.provider_configuration.order_refill_status,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.order_refill_status.params.${index}.key`)}
                                        aria-invalid={form.invalid(`service.provider_configuration.order_refill_status.params.${index}.key`)}
                                    />
                                )}
                                {form.invalid(`service.provider_configuration.order_refill_status.params.${index}.key`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_refill_status.params.${index}.key`]} />
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
                                        const updatedParams = [...form.data.service.provider_configuration.order_refill_status.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            value: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_refill_status: {
                                                    ...form.data.service.provider_configuration.order_refill_status,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_refill_status.params.${index}.value`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.order_refill_status.params.${index}.value`)}
                                    readOnly={param.type !== 'custom' ? true : false}
                                />
                                {form.invalid(`service.provider_configuration.order_refill_status.params.${index}.value`) && (
                                    <InputError message={form.errors[`service.provider_configuration.order_refill_status.params.${index}.value`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedParams = form.data.service.provider_configuration.order_refill_status.params.filter(
                                    (column) => column.id !== param.id,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        order_refill_status: {
                                            ...form.data.service.provider_configuration.order_refill_status,
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
                                order_refill_status: {
                                    ...form.data.service.provider_configuration.order_refill_status,

                                    params: [
                                        ...form.data.service.provider_configuration.order_refill_status.params,
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
                                checked={form.data.service.provider_configuration.order_refill_status.send_request_as_bulk}
                                onCheckedChange={(checked) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_status: {
                                                ...form.data.service.provider_configuration.order_refill_status,
                                                send_request_as_bulk: checked,
                                            },
                                        },
                                    });
                                }}
                            />
                            <Label htmlFor="sendRequestAsBulk">Send Bulk Request</Label>
                        </div>
                        {form.invalid('service.provider_configuration.order_refill_status.send_request_as_bulk') && (
                            <InputError message={form.errors['service.provider_configuration.order_refill_status.send_request_as_bulk']} />
                        )}
                    </div>
                    {form.data.service.provider_configuration.order_refill_status.send_request_as_bulk && (
                        <div className="grid gap-2">
                            <Label isRequired>Order Refill ID Separator</Label>
                            <Input
                                placeholder="e.g.: ,"
                                value={form.data.service.provider_configuration.order_refill_status.order_refill_id_separator}
                                className={
                                    form.invalid('service.provider_configuration.order_refill_status.order_refill_id_separator')
                                        ? 'border-red-500 focus-visible:ring-red-500/50'
                                        : ''
                                }
                                onChange={(e) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_status: {
                                                ...form.data.service.provider_configuration.order_refill_status,
                                                order_refill_id_separator: e.target.value,
                                            },
                                        },
                                    });
                                }}
                                onBlur={() => form.validate('service.provider_configuration.order_refill_status.order_refill_id_separator')}
                            />
                            {form.invalid('service.provider_configuration.order_refill_status.order_refill_id_separator') && (
                                <InputError
                                    message={form.errors['service.provider_configuration.order_refill_status.order_refill_id_separator']}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div> */}
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">3. Example Response (JSON)</h5>
                <Textarea
                    value={form.data.service.provider_configuration.order_refill_status.example_response}
                    className="min-h-[250px]"
                    onChange={(e) => {
                        form.setData('service', {
                            ...form.data.service,
                            provider_configuration: {
                                ...form.data.service.provider_configuration,
                                order_refill_status: {
                                    ...form.data.service.provider_configuration.order_refill_status,
                                    example_response: e.target.value,
                                },
                            },
                        });
                    }}
                    onBlur={() => form.validate('service.provider_configuration.order_refill_status.example_response')}
                    aria-invalid={form.invalid('service.provider_configuration.order_refill_status.example_response')}
                    rows="10"
                />
                {form.invalid('service.provider_configuration.order_refill_status.example_response') && (
                    <InputError message={form.errors['service.provider_configuration.order_refill_status.example_response']} />
                )}
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">4. Parse Response</h5>
                {/* {form.data.service.provider_configuration.order_refill_status.send_request_as_bulk && (
                    <div className="mb-3 grid items-end gap-4 lg:grid-cols-5">
                        <div className="grid gap-2 lg:col-span-4">
                            <Label isRequired>Looping</Label>
                            <Input
                                placeholder="e.g.: data"
                                value={form.data.service.provider_configuration.order_refill_status.parse_response.looping ?? ''}
                                className={
                                    form.invalid('service.provider_configuration.order_refill_status.parse_response.looping')
                                        ? 'border-red-500 focus-visible:ring-red-500/50'
                                        : ''
                                }
                                onChange={(e) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_status: {
                                                ...form.data.service.provider_configuration.order_refill_status,
                                                parse_response: {
                                                    ...form.data.service.provider_configuration.order_refill_status.parse_response,
                                                    looping: e.target.value,
                                                },
                                            },
                                        },
                                    });
                                }}
                                onBlur={() => form.validate('service.provider_configuration.order_refill_status.parse_response.looping')}
                            />
                            {form.invalid('service.provider_configuration.order_refill_status.parse_response.looping') && (
                                <InputError message={form.errors['service.provider_configuration.order_refill_status.parse_response.looping']} />
                            )}
                        </div>
                        <Button
                            className="w-full"
                            type="button"
                            size="sm"
                            onClick={() => {
                                if (!form.data.service.provider_configuration.order_refill_status.example_response)
                                    return toast({
                                        variant: 'error',
                                        description: 'Example Response is required.',
                                    });
                                try {
                                    const jsonResponse = JSON.parse(form.data.service.provider_configuration.order_refill_status.example_response);
                                    if (!form.data.service.provider_configuration.order_refill_status.parse_response.looping) {
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
                                            description: `Response valid`,
                                        });
                                    } else {
                                        const parseResponse = form.data.service.provider_configuration.order_refill_status.parse_response.looping
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
                {Object.entries(form.data.service.provider_configuration.order_refill_status.parse_response)
                    .filter((column) => column[0] !== 'looping')
                    .map((column, index) => (
                        <div className="mb-3 grid items-end gap-4 lg:grid-cols-5" key={index}>
                            <div className="grid gap-2 lg:col-span-4">
                                <Label isRequired>
                                    {
                                        [
                                            {
                                                status: 'Status',
                                            },
                                        ].find((item) => item.hasOwnProperty(column[0]))[column[0]]
                                    }
                                </Label>
                                <Input
                                    placeholder={`e.g.: data.${column[0]}`}
                                    value={form.data.service.provider_configuration.order_refill_status.parse_response[column[0]] ?? ''}
                                    onChange={(e) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                order_refill_status: {
                                                    ...form.data.service.provider_configuration.order_refill_status,
                                                    parse_response: {
                                                        ...form.data.service.provider_configuration.order_refill_status.parse_response,
                                                        [column[0]]: e.target.value,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.order_refill_status.parse_response.${column[0]}`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.order_refill_status.parse_response.${column[0]}`)}
                                />
                                {form.invalid(`service.provider_configuration.order_refill_status.parse_response.${column[0]}`) && (
                                    <InputError
                                        message={form.errors[`service.provider_configuration.order_refill_status.parse_response.${column[0]}`]}
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
                                            status: 'Status',
                                        },
                                    ].find((item) => item.hasOwnProperty(column[0]));
                                    if (!form.data.service.provider_configuration.order_refill_status.example_response)
                                        return toast({
                                            variant: 'error',
                                            description: 'Example Response is required.',
                                        });
                                    try {
                                        const jsonResponse = JSON.parse(
                                            form.data.service.provider_configuration.order_refill_status.example_response,
                                        );
                                        if (form.data.service.provider_configuration.order_refill_status.send_request_as_bulk) {
                                            if (!form.data.service.provider_configuration.order_refill_status.parse_response.looping) {
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
                                                            form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]
                                                        ] === undefined ||
                                                        typeof item[
                                                            form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]
                                                        ] === 'object' ||
                                                        Array.isArray(
                                                            item[
                                                                form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]
                                                            ],
                                                        )
                                                    )
                                                        return toast({
                                                            variant: 'error',
                                                            description: `Format ${columnName[column[0]]} is invalid.`,
                                                        });
                                                    return toast({
                                                        variant: 'success',
                                                        description: `Response valid: ${item[form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]]}`,
                                                    });
                                                });
                                            } else {
                                                const parseResponse =
                                                    form.data.service.provider_configuration.order_refill_status.parse_response.looping
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
                                                parseResponse.forEach((item) => {
                                                    if (
                                                        item[
                                                            form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]
                                                        ] === undefined ||
                                                        typeof item[
                                                            form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]
                                                        ] === 'object' ||
                                                        Array.isArray(
                                                            item[
                                                                form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]
                                                            ],
                                                        )
                                                    )
                                                        return toast({
                                                            variant: 'error',
                                                            description: `Invalid ${columnName[column[0]]} format.`,
                                                        });
                                                    return toast({
                                                        variant: 'success',
                                                        description: `Response valid: ${item[form.data.service.provider_configuration.order_refill_status.parse_response[column[0]]]}`,
                                                    });
                                                });
                                            }
                                        } else {
                                            const parseResponse = form.data.service.provider_configuration.order_refill_status.parse_response[
                                                column[0]
                                            ]
                                                .split('.')
                                                .reduce((acc, key) => acc && acc[key], jsonResponse);
                                            if (parseResponse === undefined || typeof parseResponse === 'object' || Array.isArray(parseResponse))
                                                return toast({
                                                    variant: 'error',
                                                    description: `Invalid ${columnName[column[0]]} format.`,
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
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">5. Parse Text (Status)</h5>
                <div className="grid w-full grid-cols-4 items-start gap-4">
                    {Object.entries(form.data.service.provider_configuration.order_refill_status.parse_text.status).map(([key, value], index) => (
                        <div className="grid gap-2" key={index}>
                            <Label isRequired>
                                {
                                    [
                                        {
                                            pending: 'Pending',
                                            processing: 'Processing',
                                            in_progress: 'In Progress',
                                            completed: 'Completed',
                                            error: 'Error',
                                            rejected: 'Rejected',
                                        },
                                    ].find((item) => item.hasOwnProperty(key))[key]
                                }
                            </Label>
                            <Input
                                value={value ?? ''}
                                onChange={(e) => {
                                    form.setData('service', {
                                        ...form.data.service,
                                        provider_configuration: {
                                            ...form.data.service.provider_configuration,
                                            order_refill_status: {
                                                ...form.data.service.provider_configuration.order_refill_status,
                                                parse_text: {
                                                    ...form.data.service.provider_configuration.order_refill_status.parse_text,
                                                    status: {
                                                        ...form.data.service.provider_configuration.order_refill_status.parse_text.status,
                                                        [key]: e.target.value,
                                                    },
                                                },
                                            },
                                        },
                                    });
                                }}
                                onBlur={() => form.validate(`service.provider_configuration.order_refill_status.parse_text.status.${key}`)}
                                aria-invalid={form.invalid(`service.provider_configuration.order_refill_status.parse_text.status.${key}`)}
                            />
                            {form.invalid(`service.provider_configuration.order_refill_status.parse_text.status.${key}`) && (
                                <InputError message={form.errors[`service.provider_configuration.order_refill_status.parse_text.status.${key}`]} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
