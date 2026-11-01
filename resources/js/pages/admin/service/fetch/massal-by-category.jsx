import AppLayout from '@/components/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function MassalByCategory({ pageProps }) {
    const [importing, setImporting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [result, setResult] = useState(null);

    const [data, setData] = useState({
        provider_id: '',
        category: '',
        currency: 'IDR',
        profit_type: 'percentage',
        profit: 0,
    });

    const findProvider = (value) => pageProps.serviceProviders.find((o) => String(o.value) === String(value));

    const fetchCategories = async (providerId) => {
        try {
            const res = await axios.get(route('admin.services.fetch.massal-by-category.list-category', providerId));
            if (res.data.status) {
                setCategories(res.data.categories);
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (e) {
            toast({ variant: 'error', description: 'Gagal mengambil kategori.' });
        }
    };

    const processImport = async () => {
        if (!data.provider_id || !data.category) {
            return toast({ variant: 'error', description: 'Lengkapi semua input.' });
        }
        setImporting(true);
        setResult(null);
        try {
            const res = await axios.post(route('admin.services.fetch.massal-by-category.import'), data);
            if (res.data.status) {
                toast({ variant: 'success', description: res.data.message });
                setResult(res.data.message);
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (error) {
            const messageData = error.response?.data?.message;
            toast({
                variant: 'error',
                description: typeof messageData === 'string' ? messageData : 'Terjadi kesalahan.',
            });
        }
        setImporting(false);
    };

    return (
        <AppLayout pageTitle="Fetch Layanan Massal per Kategori">
            <div className="mx-auto grid w-full grid-cols-12 items-start gap-4">
                <div className="col-span-12">
                    <Link href={route('admin.services.index')} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Fetch Massal Berdasarkan Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-sm">
                                Import semua layanan dari kategori tertentu. Kategori lokal akan dibuat otomatis jika belum ada.
                            </p>

                            <div className="grid gap-2">
                                <Label>Penyedia</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn('w-full justify-between', !data.provider_id && 'text-muted-foreground')}
                                        >
                                            {data.provider_id ? findProvider(data.provider_id)?.label : 'Pilih...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>Tidak ada.</CommandEmpty>
                                                <CommandGroup>
                                                    {pageProps.serviceProviders.map((o) => (
                                                        <CommandItem
                                                            key={o.value}
                                                            value={o.label}
                                                            onSelect={() => {
                                                                setData((d) => ({
                                                                    ...d,
                                                                    provider_id: String(o.value),
                                                                    currency: o.currency ?? 'IDR',
                                                                    category: '',
                                                                }));
                                                                setCategories([]);
                                                                fetchCategories(o.value);
                                                            }}
                                                        >
                                                            {o.label}
                                                            <Check
                                                                className={cn(
                                                                    'ml-auto h-4 w-4',
                                                                    String(o.value) === String(data.provider_id) ? 'opacity-100' : 'opacity-0',
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

                            {categories.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Kategori API</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', !data.category && 'text-muted-foreground')}
                                            >
                                                {data.category ? categories.find((o) => o.value === data.category)?.label : 'Pilih Kategori...'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-h-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Cari..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ada.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((o) => (
                                                            <CommandItem
                                                                key={o.value}
                                                                value={o.label}
                                                                onSelect={() => setData((d) => ({ ...d, category: o.value }))}
                                                            >
                                                                {o.label}
                                                                <Check
                                                                    className={cn(
                                                                        'ml-auto h-4 w-4',
                                                                        o.value === data.category ? 'opacity-100' : 'opacity-0',
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
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Tipe Profit</Label>
                                    <Select value={data.profit_type} onValueChange={(v) => setData((d) => ({ ...d, profit_type: v }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Persen (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed (Rp)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Profit</Label>
                                    <Input type="number" value={data.profit} onChange={(e) => setData((d) => ({ ...d, profit: e.target.value }))} />
                                </div>
                            </div>

                            <Button className="w-full" disabled={importing} onClick={processImport}>
                                {importing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                                    </>
                                ) : (
                                    'Proses Import'
                                )}
                            </Button>

                            {result && (
                                <Alert className="border-green-500 bg-green-500/10 text-green-700">
                                    <AlertDescription>{result}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
