import AppLayout from '@/components/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

export default function Single({ pageProps }) {
    const [loading, setLoading] = useState(false);
    const [storeLoading, setStoreLoading] = useState(false);
    const [services, setServices] = useState([]);

    const [modalSingleOpen, setModalSingleOpen] = useState(false);
    const [modalBulkOpen, setModalBulkOpen] = useState(false);
    const [modalBulkCatOpen, setModalBulkCatOpen] = useState(false);

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [selectedService, setSelectedService] = useState(null);

    const [data, setData] = useState({
        provider_id: '',
        currency: 'IDR',
        profit: 0,
    });

    const [storeData, setStoreData] = useState({
        service_category_id: '',
        profit_type: 'percentage',
        profit: 0,
    });

    const fetchServices = async () => {
        if (!data.provider_id) {
            return toast({ variant: 'error', description: 'Pilih penyedia terlebih dahulu.' });
        }
        setLoading(true);
        setServices([]);
        setSelectedIds(new Set());
        try {
            const res = await axios.post(route('admin.services.fetch.single.fetch-services'), data);
            if (res.data.status) {
                toast({ variant: 'success', description: res.data.message });
                setServices(res.data.services);
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (e) {
            toast({ variant: 'error', description: 'Terjadi kesalahan.' });
        }
        setLoading(false);
    };

    const storeServiceSingle = async () => {
        if (!storeData.service_category_id) {
            return toast({ variant: 'error', description: 'Pilih kategori tujuan.' });
        }
        setStoreLoading(true);
        try {
            const finalProfit =
                storeData.profit_type === 'percentage' ? selectedService.original_price * (storeData.profit / 100) : Number(storeData.profit);

            const res = await axios.post(route('admin.services.fetch.single.store'), {
                provider_id: data.provider_id,
                service_category_id: storeData.service_category_id,
                service_id: selectedService.service_id,
                name: selectedService.name,
                price: selectedService.original_price + finalProfit,
                original_price: selectedService.original_price,
                profit: finalProfit,
                min: selectedService.min,
                max: selectedService.max,
                description: selectedService.description,
                type: selectedService.type,
                is_refill: selectedService.is_refill,
                is_cancel: selectedService.is_cancel,
            });
            if (res.data.status) {
                toast({ variant: 'success', description: res.data.message });
                setModalSingleOpen(false);
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (e) {
            toast({ variant: 'error', description: 'Gagal menyimpan layanan.' });
        }
        setStoreLoading(false);
    };

    const storeBulk = async (useApiCategory = false) => {
        if (!useApiCategory && !storeData.service_category_id) {
            return toast({ variant: 'error', description: 'Pilih kategori tujuan.' });
        }
        if (selectedIds.size === 0) {
            return toast({ variant: 'error', description: 'Tidak ada layanan yang dipilih.' });
        }

        setStoreLoading(true);
        try {
            const itemsToStore = services
                .filter((s) => selectedIds.has(s.service_id))
                .map((s) => {
                    const finalProfit =
                        storeData.profit_type === 'percentage' ? s.original_price * (storeData.profit / 100) : Number(storeData.profit);
                    return {
                        ...s,
                        service_category_id: useApiCategory ? 0 : storeData.service_category_id,
                        provider_category: useApiCategory ? s.category : undefined,
                        price: s.original_price + finalProfit,
                        profit: finalProfit,
                    };
                });

            const res = await axios.post(route('admin.services.fetch.single.store-bulk'), {
                provider_id: data.provider_id,
                items: itemsToStore,
            });
            if (res.data.status) {
                toast({ variant: 'success', description: res.data.message });
                setModalBulkOpen(false);
                setModalBulkCatOpen(false);
                setSelectedIds(new Set());
            } else {
                toast({ variant: 'error', description: res.data.message });
            }
        } catch (e) {
            toast({ variant: 'error', description: 'Gagal menyimpan.' });
        }
        setStoreLoading(false);
    };

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const toggleRow = (id, checked) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const toggleCategory = (catName, checked) => {
        const newSet = new Set(selectedIds);
        const catServices = groupedServices[catName] || [];
        catServices.forEach((s) => {
            if (checked) newSet.add(s.service_id);
            else newSet.delete(s.service_id);
        });
        setSelectedIds(newSet);
    };

    const toggleAll = (checked) => {
        if (checked) {
            setSelectedIds(new Set(paginatedServices.map((s) => s.service_id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const totalPages = Math.ceil(services.length / pageSize) || 1;
    const paginatedServices = useMemo(() => {
        const start = (page - 1) * pageSize;
        return services.slice(start, start + pageSize);
    }, [services, page, pageSize]);

    const groupedServices = useMemo(() => {
        const groups = {};
        paginatedServices.forEach((s) => {
            const cat = s.category || '-';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(s);
        });
        return groups;
    }, [paginatedServices]);

    const allSelected = paginatedServices.length > 0 && paginatedServices.every((s) => selectedIds.has(s.service_id));

    const selectedCategoryLabel = () => pageProps.serviceCategories.find((c) => String(c.value) === String(storeData.service_category_id))?.label;

    const CategoryCombobox = () => (
        <div className="grid gap-2">
            <Label>Kategori Tujuan *</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between font-normal', !storeData.service_category_id && 'text-muted-foreground')}
                    >
                        {storeData.service_category_id ? selectedCategoryLabel() : 'Pilih Kategori Lokal...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Cari kategori..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>Tidak ada kategori.</CommandEmpty>
                            <CommandGroup>
                                {pageProps.serviceCategories.map((c) => (
                                    <CommandItem
                                        key={c.value}
                                        value={c.label}
                                        onSelect={() => setStoreData((d) => ({ ...d, service_category_id: String(c.value) }))}
                                    >
                                        {c.label}
                                        <Check
                                            className={cn(
                                                'ml-auto h-4 w-4',
                                                String(c.value) === String(storeData.service_category_id) ? 'opacity-100' : 'opacity-0',
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
    );

    const ProfitFields = () => (
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Tipe Profit</Label>
                <Select value={storeData.profit_type} onValueChange={(v) => setStoreData((d) => ({ ...d, profit_type: v }))}>
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
                <Input type="number" min="0" value={storeData.profit} onChange={(e) => setStoreData((d) => ({ ...d, profit: e.target.value }))} />
            </div>
        </div>
    );

    return (
        <AppLayout pageTitle="Fetch Layanan Single">
            <div className="mx-auto grid w-full grid-cols-12 items-start gap-4">
                <div className="col-span-12">
                    <Link href={route('admin.services.index')} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="col-span-12 lg:col-span-3">
                    <Card>
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-primary text-base uppercase">Daftar Layanan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label>Nama Provider *</Label>
                                <Select value={data.provider_id} onValueChange={(v) => setData((d) => ({ ...d, provider_id: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Provider..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pageProps.serviceProviders.map((o) => (
                                            <SelectItem key={o.value} value={String(o.value)}>
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" disabled={loading} onClick={fetchServices}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ambil Layanan
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-9">
                    <Card>
                        <CardHeader className="bg-primary/5 flex flex-row items-center justify-between space-y-0 py-3">
                            <CardTitle className="text-primary text-base uppercase">Hasil</CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" variant="info" disabled={selectedIds.size === 0} onClick={() => setModalBulkCatOpen(true)}>
                                    + Bulk per Kategori
                                </Button>
                                <Button size="sm" variant="success" disabled={selectedIds.size === 0} onClick={() => setModalBulkOpen(true)}>
                                    + Bulk Tambah
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {services.length < 1 ? (
                                <div className="text-muted-foreground p-4 text-center">Belum ada data layanan.</div>
                            ) : (
                                <div className="flex h-full flex-col">
                                    <div className="bg-muted/30 flex items-center justify-between border-b p-2 text-sm">
                                        <div className="flex items-center gap-2 px-2">
                                            <span className="text-muted-foreground">Baris per halaman:</span>
                                            <Select
                                                value={String(pageSize)}
                                                onValueChange={(v) => {
                                                    setPageSize(Number(v));
                                                    setPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[80px] bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="50">50</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                    <SelectItem value="500">500</SelectItem>
                                                    <SelectItem value="1000">1000</SelectItem>
                                                    <SelectItem value="2000">2000</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-4 px-2">
                                            <span className="text-muted-foreground">
                                                Halaman {page} dari {totalPages}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8"
                                                    disabled={page <= 1}
                                                    onClick={() => setPage((p) => p - 1)}
                                                >
                                                    Sebelumnya
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8"
                                                    disabled={page >= totalPages}
                                                    onClick={() => setPage((p) => p + 1)}
                                                >
                                                    Berikutnya
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[65vh]">
                                        <Table>
                                            <TableHeader className="bg-accent/50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[40px]">
                                                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                                                    </TableHead>
                                                    <TableHead className="w-[100px]">ID Layanan</TableHead>
                                                    <TableHead>Nama</TableHead>
                                                    <TableHead className="w-[180px]">Kategori</TableHead>
                                                    <TableHead className="w-[120px]">Harga</TableHead>
                                                    <TableHead className="w-[80px]">Min</TableHead>
                                                    <TableHead className="w-[80px]">Max</TableHead>
                                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.entries(groupedServices).map(([catName, catsrvs]) => {
                                                    const catAllSelected = catsrvs.every((s) => selectedIds.has(s.service_id));
                                                    return (
                                                        <React.Fragment key={catName}>
                                                            <TableRow className="bg-blue-50/50 hover:bg-blue-50/50">
                                                                <TableCell
                                                                    colSpan={8}
                                                                    className="border-y border-blue-100 py-2 font-bold text-blue-700"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            checked={catAllSelected}
                                                                            onCheckedChange={(c) => toggleCategory(catName, c)}
                                                                        />
                                                                        <span>{catName}</span>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            {catsrvs.map((item) => (
                                                                <TableRow key={`srv-${item.service_id}`}>
                                                                    <TableCell>
                                                                        <Checkbox
                                                                            checked={selectedIds.has(item.service_id)}
                                                                            onCheckedChange={(c) => toggleRow(item.service_id, c)}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="font-mono text-xs">
                                                                        {typeof item.service_id === 'object'
                                                                            ? JSON.stringify(item.service_id)
                                                                            : String(item.service_id)}
                                                                    </TableCell>
                                                                    <TableCell className="max-w-[280px] truncate" title={item.name}>
                                                                        {typeof item.name === 'object'
                                                                            ? JSON.stringify(item.name)
                                                                            : String(item.name)}
                                                                    </TableCell>
                                                                    <TableCell className="max-w-[180px] truncate" title={item.category}>
                                                                        {typeof item.category === 'object'
                                                                            ? JSON.stringify(item.category)
                                                                            : String(item.category)}
                                                                    </TableCell>
                                                                    <TableCell>{formatRupiah(item.original_price)}</TableCell>
                                                                    <TableCell>
                                                                        {typeof item.min === 'object' ? JSON.stringify(item.min) : String(item.min)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {typeof item.max === 'object' ? JSON.stringify(item.max) : String(item.max)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 text-xs"
                                                                            onClick={() => {
                                                                                setSelectedService(item);
                                                                                setModalSingleOpen(true);
                                                                            }}
                                                                        >
                                                                            + Tambah Layanan
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal Tambah Satuan */}
            <Dialog open={modalSingleOpen} onOpenChange={setModalSingleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Layanan (Satuan)</DialogTitle>
                    </DialogHeader>
                    {selectedService && (
                        <div className="space-y-4">
                            <CategoryCombobox />
                            <ProfitFields />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalSingleOpen(false)}>
                            Batal
                        </Button>
                        <Button disabled={storeLoading} onClick={storeServiceSingle}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Bulk Tambah */}
            <Dialog open={modalBulkOpen} onOpenChange={setModalBulkOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Tambah Layanan</DialogTitle>
                        <DialogDescription>Memasukkan {selectedIds.size} layanan ke dalam satu kategori lokal yang sama.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <CategoryCombobox />
                        <ProfitFields />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalBulkOpen(false)}>
                            Batal
                        </Button>
                        <Button disabled={storeLoading} onClick={() => storeBulk(false)}>
                            Simpan Terpilih
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Bulk per Kategori */}
            <Dialog open={modalBulkCatOpen} onOpenChange={setModalBulkCatOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Tambah — Kelompok per Kategori API</DialogTitle>
                        <DialogDescription>
                            Kategori API yang dipilih akan dipakai langsung sebagai kategori tujuan. Jika belum ada, kategori akan dibuat otomatis. (
                            {selectedIds.size} layanan terpilih)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <ProfitFields />
                        <Badge variant="secondary">Kategori otomatis dari API</Badge>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalBulkCatOpen(false)}>
                            Batal
                        </Button>
                        <Button disabled={storeLoading} onClick={() => storeBulk(true)}>
                            Proses Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
