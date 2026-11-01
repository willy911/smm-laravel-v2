import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import axios from 'axios';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { lazy, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
const DynamicIcon = lazy(() => import('@/components/ui/dynamic-icon'));

export default function Fetch({ pageProps, isFetchDialogOpened, setIsFetchDialogOpened, fetchData, tableStateRef }) {
    const { t } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);
    const [openServiceProviderPopover, setOpenServiceProviderPopover] = useState(false);
    const [services, setServices] = useState([]);

    const [data, setData] = useState({
        type: 'by-id',
        service: {
            id: '',
            provider: {
                id: '',
            },
            is_fetch_with_category: true,
        },
    });

    const fetchServices = async () => {
        if (!data.service.provider.id) {
            return toast({
                variant: 'error',
                description: 'Please select service provider first.',
            });
        }
        if (data.type === 'by-id' && !data.service.id) {
            return toast({
                variant: 'error',
                description: 'Please fill service id.',
            });
        }
        try {
            setIsLoading(true);
            setServices([]);
            const response = await axios.post(route('admin.services.fetch', data));
            toast({
                variant: 'success',
                description: toHTML(response.data.message),
            });
            setServices(response.data.services);
            setData((data) => ({
                ...data,
                service: {
                    ...data.service,
                    id: '',
                    provider: {
                        ...data.service.provider,
                        id: '',
                    },
                },
            }));
            fetchData(tableStateRef.current);
        } catch (error) {
            const messageData = error.response?.data?.message;
            const message =
                typeof messageData === 'string' ? messageData : JSON.stringify(messageData) || 'Terjadi kesalahan, silahkan muat ulang halaman ini.';
            toHTML(message);
            toast({
                variant: 'error',
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestClose = useCallback(() => {
        setIsFetchDialogOpened(false);
    }, [setIsFetchDialogOpened]);

    return (
        <>
            <Dialog open={isFetchDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-3xl">
                    <div className="grid gap-4">
                        <DialogHeader>
                            <DialogTitle>
                                {t('admin/common:actions.fetch-item', {
                                    item: t('common:labels.service'),
                                })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant={data.type === 'by-id' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setData((data) => ({
                                        ...data,
                                        type: 'by-id',
                                    }));
                                }}
                            >
                                By IDs
                            </Button>
                            <Button
                                variant={data.type === 'massal' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setData((data) => ({
                                        ...data,
                                        type: 'massal',
                                    }));
                                }}
                            >
                                Bulk
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <Label isRequired>{t('admin/common:labels.provider')}</Label>
                            <Popover open={openServiceProviderPopover} onOpenChange={setOpenServiceProviderPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn('justify-between', !data.service.provider.id && 'text-muted-foreground')}
                                    >
                                        {data.service.provider.id
                                            ? pageProps?.serviceProviders?.options.find((option) => option.value === data.service.provider.id)?.label
                                            : t('common:placeholders.select')}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="popover-content p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder={`${t('common:labels.search')} ${t('admin/common:labels.provider')}...`}
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>{t('common:empty.no-data-found')}</CommandEmpty>
                                            <CommandGroup>
                                                {pageProps?.serviceProviders?.options.map((option) => (
                                                    <CommandItem
                                                        value={option.label}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            setData((data) => ({
                                                                ...data,
                                                                service: {
                                                                    ...data.service,
                                                                    provider: {
                                                                        ...data.service.provider,
                                                                        id: option.value,
                                                                    },
                                                                },
                                                            }));
                                                            setOpenServiceProviderPopover(false);
                                                        }}
                                                    >
                                                        <div className={cn('flex items-center', option.type === 'icon' ? 'gap-2' : 'gap-1')}>
                                                            <span>{option.label}</span>
                                                        </div>
                                                        <CheckIcon
                                                            className={cn(
                                                                'ml-auto h-4 w-4',
                                                                option.value === data.service.provider.id ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {data.type === 'by-id' && (
                            <div className="grid gap-2">
                                <Label isRequired>{t('admin/services:labels.service-provider-service-id')}</Label>
                                <Textarea
                                    placeholder="Separate multiple items with commas"
                                    className="min-h-[250px]"
                                    value={data.service.id}
                                    onChange={(e) => {
                                        setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                id: e.target.value,
                                            },
                                        }));
                                    }}
                                    rows="5"
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isFetchWithCategory"
                                    checked={data.service.is_fetch_with_category}
                                    onCheckedChange={(checked) => {
                                        setData((data) => ({
                                            ...data,
                                            service: {
                                                ...data.service,
                                                is_fetch_with_category: checked,
                                            },
                                        }));
                                    }}
                                />
                                <Label htmlFor="isFetchWithCategory">Fetch With Category</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className={cn('w-full')} disabled={isLoading} onClick={() => fetchServices()}>
                                {!isLoading ? t('common:actions.submit') : t('common:loading.please-wait')}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
