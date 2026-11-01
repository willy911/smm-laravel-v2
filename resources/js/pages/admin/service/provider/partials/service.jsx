import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function Service({ form }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">1. Endpoint</h5>
                <div className="grid grid-cols-5 items-start gap-4">
                    <div className="col-span-5 grid gap-2 md:col-span-1">
                        <Label isRequired>Method</Label>
                        <Select
                            defaultValue={form.data.service.provider_configuration.services.method}
                            onValueChange={(value) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        services: {
                                            ...form.data.service.provider_configuration.services,
                                            method: value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate(`service.provider_configuration.services.method`)}
                        >
                            <SelectTrigger aria-invalid={form.invalid('service.provider_configuration.services.method')}>
                                <SelectValue placeholder="Select Method..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="post">POST</SelectItem>
                                <SelectItem value="get">GET</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.invalid(`service.provider_configuration.services.method`) && (
                            <InputError message={form.errors[`service.provider_configuration.services.method`]} />
                        )}
                    </div>
                    <div className="col-span-5 grid gap-2 md:col-span-4">
                        <Label isRequired>URL</Label>
                        <Input
                            type="url"
                            value={form.data.service.provider_configuration.services.endpoint}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        services: {
                                            ...form.data.service.provider_configuration.services,
                                            endpoint: e.target.value,
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.services.endpoint')}
                            aria-invalid={form.invalid('service.provider_configuration.services.endpoint')}
                            readOnly={form.data.flazpedia}
                        />
                        {form.invalid('service.provider_configuration.services.endpoint') && (
                            <InputError message={form.errors['service.provider_configuration.services.endpoint']} />
                        )}
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">2. Request Parameters</h5>
                {form.data.service.provider_configuration.services.params.map((param, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-3 items-start gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>Type</Label>
                                <Select
                                    defaultValue={param.type}
                                    onValueChange={(value) => {
                                        const updatedParams = [...form.data.service.provider_configuration.services.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            type: value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.services.params.${index}.type`)}
                                >
                                    <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.services.params.${index}.type`)}>
                                        <SelectValue placeholder="Select Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom</SelectItem>
                                        <SelectItem value="default_parameter">Default Parameter</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.invalid(`service.provider_configuration.services.params.${index}.type`) && (
                                    <InputError message={form.errors[`service.provider_configuration.services.params.${index}.type`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>Key</Label>
                                {param.type === 'default_parameter' ? (
                                    <Select
                                        defaultValue={param.key}
                                        onValueChange={(value) => {
                                            const updatedParams = [...form.data.service.provider_configuration.services.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    services: {
                                                        ...form.data.service.provider_configuration.services,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.services.params.${index}.key`)}
                                    >
                                        <SelectTrigger aria-invalid={form.invalid(`service.provider_configuration.services.params.${index}.key`)}>
                                            <SelectValue placeholder="Select Key..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {form.data.service.provider.default_parameters
                                                .filter(
                                                    (param) =>
                                                        !form.data.service.provider_configuration.services.params
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
                                            const updatedParams = [...form.data.service.provider_configuration.services.params];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                key: e.target.value,
                                            };
                                            form.setData('service', {
                                                ...form.data.service,
                                                provider_configuration: {
                                                    ...form.data.service.provider_configuration,
                                                    services: {
                                                        ...form.data.service.provider_configuration.services,
                                                        params: updatedParams,
                                                    },
                                                },
                                            });
                                        }}
                                        onBlur={() => form.validate(`service.provider_configuration.services.params.${index}.key`)}
                                        aria-invalid={form.invalid(`service.provider_configuration.services.params.${index}.key`)}
                                    />
                                )}
                                {form.invalid(`service.provider_configuration.services.params.${index}.key`) && (
                                    <InputError message={form.errors[`service.provider_configuration.services.params.${index}.key`]} />
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
                                        const updatedParams = [...form.data.service.provider_configuration.services.params];
                                        updatedParams[index] = {
                                            ...updatedParams[index],
                                            value: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    params: updatedParams,
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.services.params.${index}.value`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.services.params.${index}.value`)}
                                    readOnly={param.type === 'default_parameter' ? true : false}
                                />
                                {form.invalid(`service.provider_configuration.services.params.${index}.value`) && (
                                    <InputError message={form.errors[`service.provider_configuration.services.params.${index}.value`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedParams = form.data.service.provider_configuration.services.params.filter(
                                    (column) => column.id !== param.id,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        services: {
                                            ...form.data.service.provider_configuration.services,
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
                                services: {
                                    ...form.data.service.provider_configuration.services,

                                    params: [
                                        ...form.data.service.provider_configuration.services.params,
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
                    value={form.data.service.provider_configuration.services.example_response}
                    className="min-h-[250px]"
                    onChange={(e) => {
                        form.setData('service', {
                            ...form.data.service,
                            provider_configuration: {
                                ...form.data.service.provider_configuration,
                                services: {
                                    ...form.data.service.provider_configuration.services,
                                    example_response: e.target.value,
                                },
                            },
                        });
                    }}
                    onBlur={() => form.validate('service.provider_configuration.services.example_response')}
                    aria-invalid={form.invalid('service.provider_configuration.services.example_response')}
                    rows="10"
                />
                {form.invalid('service.provider_configuration.services.example_response') && (
                    <InputError message={form.errors['service.provider_configuration.services.example_response']} />
                )}
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">4. Parse Response</h5>
                <div className="mb-3 grid items-end gap-4 lg:grid-cols-5">
                    <div className="grid gap-2 lg:col-span-4">
                        <Label isRequired>Looping</Label>
                        <Input
                            placeholder="e.g: data"
                            value={form.data.service.provider_configuration.services.parse_response.looping ?? ''}
                            onChange={(e) => {
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        services: {
                                            ...form.data.service.provider_configuration.services,
                                            parse_response: {
                                                ...form.data.service.provider_configuration.services.parse_response,
                                                looping: e.target.value,
                                            },
                                        },
                                    },
                                });
                            }}
                            onBlur={() => form.validate('service.provider_configuration.services.parse_response.looping')}
                            aria-invalid={form.invalid('service.provider_configuration.services.parse_response.looping')}
                        />
                        {form.invalid('service.provider_configuration.services.parse_response.looping') && (
                            <InputError message={form.errors['service.provider_configuration.services.parse_response.looping']} />
                        )}
                    </div>
                    <Button
                        className="w-full"
                        type="button"
                        size="sm"
                        onClick={() => {
                            if (!form.data.service.provider_configuration.services.example_response)
                                return toast({
                                    variant: 'error',
                                    description: 'Example Response is required.',
                                });
                            try {
                                const jsonResponse = JSON.parse(form.data.service.provider_configuration.services.example_response);
                                if (!form.data.service.provider_configuration.services.parse_response.looping) {
                                    if (
                                        !Array.isArray(jsonResponse) ||
                                        !jsonResponse.every((item) => typeof item === 'object' && !Array.isArray(item))
                                    )
                                        return toast({
                                            variant: 'error',
                                            description: 'Looping format is invalid.',
                                        });
                                    return toast({
                                        variant: 'success',
                                        description: `Response is valid`,
                                    });
                                } else {
                                    const parseResponse = form.data.service.provider_configuration.services.parse_response.looping
                                        .split('.')
                                        .reduce((acc, key) => acc && acc[key], jsonResponse);
                                    if (
                                        parseResponse === undefined ||
                                        !Array.isArray(parseResponse) ||
                                        !parseResponse.every((item) => typeof item === 'object' && !Array.isArray(item))
                                    )
                                        return toast({
                                            variant: 'error',
                                            description: 'Looping format is invalid.',
                                        });
                                    return toast({
                                        variant: 'success',
                                        description: `Response is valid`,
                                    });
                                }
                            } catch (error) {
                                return toast({
                                    variant: 'error',
                                    description: 'Example Response format is invalid.',
                                });
                            }
                        }}
                    >
                        Check
                    </Button>
                </div>
                {[
                    { key: 'id', label: 'ID' },
                    { key: 'category', label: 'Category' },
                    { key: 'name', label: 'Name' },
                    { key: 'price', label: 'Price' },
                    { key: 'min', label: 'Min.' },
                    { key: 'max', label: 'Max.' },
                    { key: 'description', label: 'Description' },
                    { key: 'is_refill_support', label: 'Refill Support' },
                    { key: 'is_cancel_support', label: 'Cancel Order' },
                    { key: 'refill_days', label: 'Refill Support Duration' },
                    { key: 'refill_available_in_hours', label: 'Refill Support Available Time' },
                    { key: 'type', label: 'Type' },
                ].map(({ key, label }) => {
                    if (key === 'looping') return null;
                    return (
                        <div className="mb-3 grid items-end gap-4 lg:grid-cols-5" key={key}>
                            <div className="grid gap-2 lg:col-span-4">
                                <Label isRequired>{label}</Label>

                                <Input
                                    placeholder={`e.g: ${key}`}
                                    value={form.data.service.provider_configuration.services.parse_response[key] ?? ''}
                                    onChange={(e) => {
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    parse_response: {
                                                        ...form.data.service.provider_configuration.services.parse_response,
                                                        [key]: e.target.value,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.services.parse_response.${key}`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.services.parse_response.${key}`)}
                                />

                                {form.invalid(`service.provider_configuration.services.parse_response.${key}`) && (
                                    <InputError message={form.errors[`service.provider_configuration.services.parse_response.${key}`]} />
                                )}
                            </div>

                            <Button
                                className="w-full"
                                type="button"
                                size="sm"
                                onClick={() => {
                                    if (!form.data.service.provider_configuration.services.example_response) {
                                        return toast({
                                            variant: 'error',
                                            description: 'Example Response is required.',
                                        });
                                    }

                                    try {
                                        const jsonResponse = JSON.parse(form.data.service.provider_configuration.services.example_response);

                                        const loopingPath = form.data.service.provider_configuration.services.parse_response.looping;

                                        const dataSource = loopingPath
                                            ? loopingPath.split('.').reduce((acc, k) => acc?.[k], jsonResponse)
                                            : jsonResponse;

                                        if (
                                            !Array.isArray(dataSource) ||
                                            !dataSource.every((item) => typeof item === 'object' && !Array.isArray(item))
                                        ) {
                                            return toast({
                                                variant: 'error',
                                                description: 'Looping format is invalid.',
                                            });
                                        }

                                        dataSource.forEach((item) => {
                                            const value = item[form.data.service.provider_configuration.services.parse_response[key]];

                                            if (value === undefined || typeof value === 'object' || Array.isArray(value)) {
                                                return toast({
                                                    variant: 'error',
                                                    description: `${label} format is invalid.`,
                                                });
                                            }

                                            toast({
                                                variant: 'success',
                                                description: `Response valid: ${value}`,
                                            });
                                        });
                                    } catch {
                                        toast({
                                            variant: 'error',
                                            description: 'Example Response format is invalid.',
                                        });
                                    }
                                }}
                            >
                                Check
                            </Button>
                        </div>
                    );
                })}
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">5. Parse Text (Category, Name & Description)</h5>
                {form.data.service.provider_configuration.services.parse_text.name.map((item, index) => (
                    <div className="mb-3 flex items-end space-x-4" key={index}>
                        <div className="grid w-full grid-cols-2 items-start gap-4">
                            <div className="grid gap-2">
                                <Label isRequired>From</Label>
                                <Input
                                    value={item.from ?? ''}
                                    onChange={(e) => {
                                        const updatedParseTexts = [...form.data.service.provider_configuration.services.parse_text.name];
                                        updatedParseTexts[index] = {
                                            ...updatedParseTexts[index],
                                            from: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    parse_text: {
                                                        ...form.data.service.provider_configuration.services.parse_text,
                                                        name: updatedParseTexts,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.services.parse_text.name.${index}.from`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.services.parse_text.name.${index}.from`)}
                                />
                                {form.invalid(`service.provider_configuration.services.parse_text.name.${index}.from`) && (
                                    <InputError message={form.errors[`service.provider_configuration.services.parse_text.name.${index}.from`]} />
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label isRequired>To</Label>
                                <Input
                                    value={item.to ?? ''}
                                    onChange={(e) => {
                                        const updatedParseTexts = [...form.data.service.provider_configuration.services.parse_text.name];
                                        updatedParseTexts[index] = {
                                            ...updatedParseTexts[index],
                                            to: e.target.value,
                                        };
                                        form.setData('service', {
                                            ...form.data.service,
                                            provider_configuration: {
                                                ...form.data.service.provider_configuration,
                                                services: {
                                                    ...form.data.service.provider_configuration.services,
                                                    parse_text: {
                                                        ...form.data.service.provider_configuration.services.parse_text,
                                                        name: updatedParseTexts,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    onBlur={() => form.validate(`service.provider_configuration.services.parse_text.name.${index}.to`)}
                                    aria-invalid={form.invalid(`service.provider_configuration.services.parse_text.name.${index}.to`)}
                                />
                                {form.invalid(`service.provider_configuration.services.parse_text.name.${index}.to`) && (
                                    <InputError message={form.errors[`service.provider_configuration.services.parse_text.name.${index}.to`]} />
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const updatedParseTexts = form.data.service.provider_configuration.services.parse_text.name.filter(
                                    (column) => column.id !== item.id,
                                );
                                form.setData('service', {
                                    ...form.data.service,
                                    provider_configuration: {
                                        ...form.data.service.provider_configuration,
                                        services: {
                                            ...form.data.service.provider_configuration.services,
                                            parse_text: {
                                                ...form.data.service.provider_configuration.services.parse_text,
                                                name: updatedParseTexts,
                                            },
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
                                services: {
                                    ...form.data.service.provider_configuration.services,
                                    parse_text: {
                                        ...form.data.service.provider_configuration.services.parse_text,
                                        name: [
                                            ...form.data.service.provider_configuration.services.parse_text.name,
                                            { id: uuidv4(), from: '', to: '' },
                                        ],
                                    },
                                },
                            },
                        });
                    }}
                >
                    Add Data
                </Button>
            </div>
            <div className="grid gap-2">
                <h5 className="text-base font-semibold">6. Parse Text (Service Type)</h5>
                <div className="grid w-full grid-cols-4 items-start gap-4">
                    {Object.entries(form.data.service.provider_configuration.services.parse_text.type).map(([key, value], index) => (
                        <div className="grid gap-2" key={index}>
                            <Label isRequired>
                                {
                                    [
                                        {
                                            primary: 'Primary',
                                            package: 'Package',
                                            custom_comments: 'Custom Comments',
                                            custom_comments_package: 'Custom Comments Package',
                                            comment_likes: 'Comment Likes',
                                            comment_replies: 'Comment Replies',
                                            mentions_hashtag: 'Mentions Hashtag',
                                            mentions_with_hashtags: 'Mentions With Hashtags',
                                            mentions_custom_list: 'Mentions Custom List',
                                            mentions_user_followers: 'Mentions User Followers',
                                            mentions_media_likers: 'Mentions Media Likers',
                                            poll: 'Poll',
                                            subscriptions: 'Subscriptions',
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
                                            services: {
                                                ...form.data.service.provider_configuration.services,
                                                parse_text: {
                                                    ...form.data.service.provider_configuration.services.parse_text,
                                                    type: {
                                                        ...form.data.service.provider_configuration.services.parse_text.type,
                                                        [key]: e.target.value,
                                                    },
                                                },
                                            },
                                        },
                                    });
                                }}
                                onBlur={() => form.validate(`service.provider_configuration.services.parse_text.type.${key}`)}
                                aria-invalid={form.invalid(`service.provider_configuration.services.parse_text.type.${key}`)}
                            />
                            {form.invalid(`service.provider_configuration.services.parse_text.type.${key}`) && (
                                <InputError message={form.errors[`service.provider_configuration.services.parse_text.type.${key}`]} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
