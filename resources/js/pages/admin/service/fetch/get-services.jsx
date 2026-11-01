import AppLayout from '@/components/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { cn, formatRupiah } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

function CategorySearchSelect({ value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const normalizedValue = value || '0';
    const selectedOption =
        normalizedValue === '0'
            ? { value: '0', label: '- Buat Kategori Baru -' }
            : options.find((option) => String(option.value) === normalizedValue) || { value: '0', label: '- Buat Kategori Baru -' };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn('h-8 w-full justify-between text-xs font-normal', !value && 'text-muted-foreground')}
                >
                    <span className="truncate">{selectedOption.label}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari kategori lokal..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="- Buat Kategori Baru -"
                                onSelect={() => {
                                    onChange('0');
                                    setOpen(false);
                                }}
                            >
                                - Buat Kategori Baru -
                                <Check className={cn('ml-auto h-4 w-4', normalizedValue === '0' ? 'opacity-100' : 'opacity-0')} />
                            </CommandItem>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(String(option.value));
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check
                                        className={cn('ml-auto h-4 w-4', String(option.value) === normalizedValue ? 'opacity-100' : 'opacity-0')}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default function GetServices({ pageProps }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [services, setServices] = useState([]);
    const [apiCategories, setApiCategories] = useState([]);
    const [providerId, setProviderId] = useState(null);
    const [result, setResult] = useState(null);

    // Step 1 data
    const [fetchData, setFetchData] = useState({
        provider_id: '',
        currency: 'IDR',
        profit_type: 'percentage',
        profit: 0,
    });

    // Step 2 data: category mapping { "api_cat_name": local_cat_id }
    const [categoryMapping, setCategoryMapping] = useState({});
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Step 3 data: Selected services for import
    const [selectedServices, setSelectedServices] = useState([]);

    const findProvider = (value) => pageProps.serviceProviders.find((o) => String(o.value) === String(value));

    // Step 1: Fetch
    const fetchServices = async () => {
        if (!fetchData.provider_id) {
            return toast({ variant: 'error', description: 'Pilih penyedia.' });
        }
        setLoading(true);
        setServices([]);
        setResult(null);
        try {
            const res = await axios.post(route('admin.services.fetch.get-services.fetch'), fetchData);
            if (res.data.status) {
                toast({ variant: 'success', description: res.data.message });
                const fetchedServices = res.data.services.map((s) => ({
                    ...s,
                    final_price: s.price,
                }));
                // Safe stringification for API data arrays/objects
                const safeCategories = res.data.api_categories.map((c) => (typeof c === 'object' ? JSON.stringify(c) : String(c)));

                setServices(fetchedServices);
                setApiCategories(safeCategories);
                setProviderId(res.data.provider_id);

                // Init category mapping
                const mapping = {};
                safeCategories.forEach((cat) => {
                    mapping[cat] = '0';
                });
                setCategoryMapping(mapping);
                setSelectedCategories([]);
                setStep(2);
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (error) {
            const messageData = error.response?.data?.message;
            toast({
                variant: 'error',
                description: typeof messageData === 'string' ? messageData : 'Terjadi kesalahan saat fetch API.',
            });
        }
        setLoading(false);
    };

    // Step 2 to 3
    const processToStep3 = () => {
        if (selectedCategories.length < 1) {
            return toast({ variant: 'error', description: 'Pilih minimal 1 kategori.' });
        }

        // Auto-select all services whose category is checked
        const filteredServices = services.filter((s) => {
            const cat = typeof s.category === 'object' ? JSON.stringify(s.category) : String(s.category);
            return selectedCategories.includes(cat);
        });

        setSelectedServices(filteredServices.map((s) => s.service_id));
        setStep(3);
    };

    const toggleService = (serviceId) => {
        setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
    };

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    };

    const updateServiceField = (serviceId, field, value) => {
        setServices((prev) => prev.map((s) => (s.service_id === serviceId ? { ...s, [field]: value } : s)));
    };

    // Step 3: Import
    const importServices = async () => {
        const items = services.filter((s) => selectedServices.includes(s.service_id));
        if (items.length < 1) {
            return toast({ variant: 'error', description: 'Pilih minimal 1 layanan.' });
        }

        // Finalize items prices and categories
        const finalItems = items.map((s) => {
            const catStr = typeof s.category === 'object' ? JSON.stringify(s.category) : String(s.category);
            return {
                ...s,
                price: Number(s.final_price),
                category: catStr,
            };
        });

        setImporting(true);
        setResult(null);
        try {
            const res = await axios.post(route('admin.services.fetch.get-services.import'), {
                provider_id: providerId,
                items: finalItems,
                category_mapping: categoryMapping,
            });
            if (res.data.status) {
                toast({ variant: 'success', description: res.data.message });
                setResult(res.data.message);
                setStep(1); // Go back to step 1 and show success alert
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (error) {
            const messageData = error.response?.data?.message;
            toast({
                variant: 'error',
                description: typeof messageData === 'string' ? messageData : 'Terjadi kesalahan saat mengimpor.',
            });
        }
        setImporting(false);
    };

    // Grouping for Step 3 View
    const groupedServices = useMemo(() => {
        const groups = {};
        services.forEach((s) => {
            const catStr = typeof s.category === 'object' ? JSON.stringify(s.category) : String(s.category);
            if (!selectedCategories.includes(catStr)) return;

            const localCatId = categoryMapping[catStr] || '0';
            const localCatName =
                localCatId === '0'
                    ? catStr + ' (Baru)'
                    : pageProps.serviceCategories.find((c) => String(c.value) === String(localCatId))?.label || 'Tidak diketahui';

            if (!groups[localCatName]) groups[localCatName] = [];
            groups[localCatName].push(s);
        });
        return groups;
    }, [services, selectedCategories, categoryMapping, pageProps.serviceCategories]);

    const allServicesSelected =
        selectedServices.length > 0 &&
        selectedServices.length ===
            services.filter((s) => {
                const catStr = typeof s.category === 'object' ? JSON.stringify(s.category) : String(s.category);
                return selectedCategories.includes(catStr);
            }).length;

    const toggleAllServices = (checked) => {
        if (checked) {
            const relevantIds = services
                .filter((s) => {
                    const catStr = typeof s.category === 'object' ? JSON.stringify(s.category) : String(s.category);
                    return selectedCategories.includes(catStr);
                })
                .map((s) => s.service_id);
            setSelectedServices(relevantIds);
        } else {
            setSelectedServices([]);
        }
    };

    return (
        <AppLayout pageTitle="Fetch Layanan Get Services">
            <div className="mx-auto grid w-full grid-cols-12 items-start gap-4">
                <div className="col-span-12 flex items-center gap-4">
                    <Link href={route('admin.services.index')} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Link>
                    <div className="flex gap-2">
                        <Badge variant={step >= 1 ? 'default' : 'outline'}>1: Ambil</Badge>
                        <Badge variant={step >= 2 ? 'default' : 'outline'}>2: Kategori</Badge>
                        <Badge variant={step >= 3 ? 'default' : 'outline'}>3: Layanan &amp; Import</Badge>
                    </div>
                </div>

                {/* Step 1: Fetch */}
                {step === 1 && (
                    <div className="col-span-12 lg:col-span-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Langkah 1: Ambil Layanan dari API Provider</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Penyedia</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', !fetchData.provider_id && 'text-muted-foreground')}
                                            >
                                                {fetchData.provider_id ? findProvider(fetchData.provider_id)?.label : 'Pilih...'}
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
                                                                onSelect={() =>
                                                                    setFetchData((d) => ({
                                                                        ...d,
                                                                        provider_id: String(o.value),
                                                                        currency: o.currency ?? 'IDR',
                                                                    }))
                                                                }
                                                            >
                                                                {o.label}
                                                                <Check
                                                                    className={cn(
                                                                        'ml-auto h-4 w-4',
                                                                        String(o.value) === String(fetchData.provider_id)
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0',
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Tipe Profit</Label>
                                        <Select value={fetchData.profit_type} onValueChange={(v) => setFetchData((d) => ({ ...d, profit_type: v }))}>
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
                                        <Input
                                            type="number"
                                            value={fetchData.profit}
                                            onChange={(e) => setFetchData((d) => ({ ...d, profit: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full" disabled={loading} onClick={fetchServices}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengambil...
                                        </>
                                    ) : (
                                        'Ambil Layanan'
                                    )}
                                </Button>

                                {result && (
                                    <Alert className="mt-4 border-green-500 bg-green-500/10 text-green-700">
                                        <AlertDescription>{result}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 2: Kategori */}
                {step === 2 && (
                    <div className="col-span-12 lg:col-span-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Langkah 2: Pilih &amp; Mapping Kategori API</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert className="border-primary/20 bg-primary/10 text-primary">
                                    <AlertDescription>
                                        Pilih kategori yang ingin diambil, dan tentukan akan dimasukkan ke kategori lokal mana (pilih Buat Kategori
                                        Baru untuk otomatis). Ditemukan {apiCategories.length} kategori API.
                                    </AlertDescription>
                                </Alert>
                                <div className="overflow-hidden rounded-md border">
                                    <ScrollArea className="h-[60vh]">
                                        <Table>
                                            <TableHeader className="bg-muted sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-10 text-center">
                                                        <Checkbox
                                                            checked={apiCategories.length > 0 && selectedCategories.length === apiCategories.length}
                                                            onCheckedChange={(c) => setSelectedCategories(c ? [...apiCategories] : [])}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Kategori API</TableHead>
                                                    <TableHead>Kategori Tujuan (Lokal)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {apiCategories.map((cat) => (
                                                    <TableRow key={`cat-${cat}`}>
                                                        <TableCell className="text-center">
                                                            <Checkbox
                                                                checked={selectedCategories.includes(cat)}
                                                                onCheckedChange={() => toggleCategory(cat)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium">{cat}</TableCell>
                                                        <TableCell>
                                                            <CategorySearchSelect
                                                                value={categoryMapping[cat] || '0'}
                                                                options={pageProps.serviceCategories}
                                                                onChange={(v) => setCategoryMapping((prev) => ({ ...prev, [cat]: v }))}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        Kembali
                                    </Button>
                                    <Button onClick={processToStep3}>Lanjut ke Layanan</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Layanan & Import */}
                {step === 3 && (
                    <div className="col-span-12">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-2">
                                <CardTitle className="text-base">Langkah 3: Proses Layanan</CardTitle>
                                <span className="text-muted-foreground mr-4 text-sm font-medium">Terpilih: {selectedServices.length} layanan</span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[75vh]">
                                    <Table>
                                        <TableHeader className="bg-muted sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="w-10 text-center">
                                                    <Checkbox checked={allServicesSelected} onCheckedChange={toggleAllServices} />
                                                </TableHead>
                                                <TableHead>Layanan</TableHead>
                                                <TableHead className="w-[100px]">Min / Max</TableHead>
                                                <TableHead className="w-[200px]">Harga</TableHead>
                                                <TableHead className="w-[120px]">Opsi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.keys(groupedServices).length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-muted-foreground py-4 text-center">
                                                        Belum ada kategori yang dipilih.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                Object.entries(groupedServices).map(([groupName, groupServices]) => (
                                                    <React.Fragment key={`group-${groupName}`}>
                                                        <TableRow className="bg-green-50 hover:bg-green-50">
                                                            <TableCell
                                                                colSpan={5}
                                                                className="border-y border-green-200 py-2 text-xs font-bold text-green-800 uppercase"
                                                            >
                                                                Kategori Lokal: {groupName}
                                                            </TableCell>
                                                        </TableRow>
                                                        {groupServices.map((item) => {
                                                            const isChecked = selectedServices.includes(item.service_id);
                                                            return (
                                                                <TableRow
                                                                    key={`srv-${item.service_id}`}
                                                                    className={cn(!isChecked && 'opacity-50', 'hover:bg-accent/30')}
                                                                >
                                                                    <TableCell className="pt-4 text-center align-top">
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={() => toggleService(item.service_id)}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="py-3 align-top">
                                                                        <div className="mb-1 text-sm font-bold">
                                                                            {typeof item.name === 'object'
                                                                                ? JSON.stringify(item.name)
                                                                                : String(item.name)}
                                                                        </div>
                                                                        <div
                                                                            className="text-muted-foreground line-clamp-3 text-xs"
                                                                            title={item.description}
                                                                        >
                                                                            {typeof item.description === 'object'
                                                                                ? JSON.stringify(item.description)
                                                                                : String(item.description || '-')}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            {item.is_existing ? (
                                                                                <Badge variant="secondary" className="h-4 py-0 text-[10px]">
                                                                                    Sudah Ada
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="default" className="h-4 py-0 text-[10px]">
                                                                                    Layanan Baru
                                                                                </Badge>
                                                                            )}
                                                                            <span className="text-muted-foreground ml-2 font-mono text-[10px]">
                                                                                ID:{' '}
                                                                                {typeof item.service_id === 'object'
                                                                                    ? JSON.stringify(item.service_id)
                                                                                    : String(item.service_id)}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-3 align-top text-xs">
                                                                        {typeof item.min === 'object' ? JSON.stringify(item.min) : String(item.min)} /{' '}
                                                                        {typeof item.max === 'object' ? JSON.stringify(item.max) : String(item.max)}
                                                                    </TableCell>
                                                                    <TableCell className="py-3 align-top">
                                                                        <div className="text-muted-foreground mb-1 text-xs">
                                                                            Asli API: {formatRupiah(item.original_price)} <br />
                                                                            Profit: {formatRupiah(item.profit)}
                                                                        </div>
                                                                        <Input
                                                                            type="number"
                                                                            className="h-7 max-w-[120px] text-xs font-semibold"
                                                                            value={item.final_price}
                                                                            onChange={(e) =>
                                                                                updateServiceField(item.service_id, 'final_price', e.target.value)
                                                                            }
                                                                            disabled={!isChecked}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="py-3 align-top">
                                                                        <div className="mb-2 flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`refill-${item.service_id}`}
                                                                                checked={item.is_refill === '1'}
                                                                                onCheckedChange={(c) =>
                                                                                    updateServiceField(item.service_id, 'is_refill', c ? '1' : '0')
                                                                                }
                                                                                disabled={!isChecked}
                                                                            />
                                                                            <label
                                                                                htmlFor={`refill-${item.service_id}`}
                                                                                className="text-xs leading-none font-medium"
                                                                            >
                                                                                Refill
                                                                            </label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`cancel-${item.service_id}`}
                                                                                checked={item.is_cancel === '1'}
                                                                                onCheckedChange={(c) =>
                                                                                    updateServiceField(item.service_id, 'is_cancel', c ? '1' : '0')
                                                                                }
                                                                                disabled={!isChecked}
                                                                            />
                                                                            <label
                                                                                htmlFor={`cancel-${item.service_id}`}
                                                                                className="text-xs leading-none font-medium"
                                                                            >
                                                                                Cancel
                                                                            </label>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                                <div className="bg-muted/20 flex justify-end gap-2 border-t p-4">
                                    <Button variant="outline" onClick={() => setStep(2)}>
                                        Kembali
                                    </Button>
                                    <Button onClick={importServices} disabled={importing} variant="success" className="min-w-[150px]">
                                        {importing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                                            </>
                                        ) : (
                                            'Simpan Layanan'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
