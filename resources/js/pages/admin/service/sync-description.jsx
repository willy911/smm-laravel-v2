import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Loading03Icon } from 'hugeicons-react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SyncDescription({ pageProps, isSyncDescriptionDialogOpened, setIsSyncDescriptionDialogOpened, fetchData, tableStateRef }) {
    const { t } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);
    const [openServiceProviderPopover, setOpenServiceProviderPopover] = useState(false);
    const [providerId, setProviderId] = useState('');

    const handleRequestClose = useCallback(() => {
        setIsSyncDescriptionDialogOpened(false);
    }, [setIsSyncDescriptionDialogOpened]);

    const syncDescriptions = async () => {
        if (!providerId) {
            return toast({
                variant: 'error',
                description: 'Please select service provider first.',
            });
        }
        let isSuccess = false;
        try {
            setIsLoading(true);
            const { data } = await axios.post(route('admin.services.sync-descriptions'), {
                provider_id: providerId,
            });
            isSuccess = Boolean(data?.status);
            if (data?.status) {
                const s = data.summary ?? {};
                toast({
                    variant: 'success',
                    description: toHTML(
                        data.message +
                            (s.scraped > 0 ? ` — ${s.scraped} deskripsi diambil` : '') +
                            (s.provider_updated > 0 ? `, ${s.provider_updated} layanan provider diperbarui` : '') +
                            (s.services_updated > 0 ? `, ${s.services_updated} layanan diperbarui` : ''),
                    ),
                });
            } else {
                toast({ variant: 'error', description: toHTML(data?.message ?? 'Sync gagal.') });
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        } finally {
            setIsLoading(false);
            if (isSuccess) {
                setProviderId('');
                fetchData(tableStateRef.current);
                handleRequestClose();
            }
        }
    };

    return (
        <>
            <Dialog open={isSyncDescriptionDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-md">
                    <div className="grid gap-4">
                        <DialogHeader>
                            <DialogTitle>{t('admin/common:actions.sync-descriptions')}</DialogTitle>
                            <DialogDescription>
                                Pilih provider untuk menyinkronkan deskripsi layanan dari sumber provider. Proses bisa memakan waktu beberapa
                                menit untuk provider dengan banyak layanan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label isRequired>Provider</Label>
                            <Popover open={openServiceProviderPopover} onOpenChange={setOpenServiceProviderPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn('justify-between', !providerId && 'text-muted-foreground')}
                                    >
                                        {providerId
                                            ? pageProps?.serviceProviders?.options.find((option) => option.value === providerId)?.label
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
                                                            setProviderId(option.value);
                                                            setOpenServiceProviderPopover(false);
                                                        }}
                                                    >
                                                        <div className={cn('flex items-center', option.type === 'icon' ? 'gap-2' : 'gap-1')}>
                                                            <span>{option.label}</span>
                                                        </div>
                                                        <CheckIcon
                                                            className={cn('ml-auto h-4 w-4', option.value === providerId ? 'opacity-100' : 'opacity-0')}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" disabled={isLoading} onClick={handleRequestClose}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !providerId}
                                onClick={() => syncDescriptions()}
                            >
                                {isLoading && <Loading03Icon className="h-4 w-4 animate-spin" />}
                                {t('admin/common:actions.sync-descriptions')}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
