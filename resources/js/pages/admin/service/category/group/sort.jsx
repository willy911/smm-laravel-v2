import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Loading01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactSortable } from 'react-sortablejs';

export default function Sort({ isSortDialogOpened, setIsSortDialogOpened, fetchData, tableStateRef }) {
    const { t } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm('post', route('admin.services.categories.groups.sort'), {
        items: [],
    });

    const handleRequestClose = useCallback(() => {
        setIsSortDialogOpened(false);
    }, [form, setIsSortDialogOpened]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);
            axios
                .post(route('admin.services.categories.groups.sort'), form.data)
                .then((response) => {
                    form.reset();
                    setIsSortDialogOpened(false);
                    toast({
                        variant: 'success',
                        description: toHTML(response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                    fetchData(tableStateRef.current);
                })
                .catch((error) => {
                    toast({
                        variant: 'error',
                        description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [form, setIsSortDialogOpened, fetchData, tableStateRef],
    );

    const getServiceCategoryGroups = async () => {
        setIsLoading(true);
        await axios
            .get(route('admin.services.categories.groups.options', form.data))
            .then((response) => {
                form.setData('items', response.data.items);
            })
            .catch((error) => {
                toast({
                    variant: 'error',
                    description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        form.setData('items', []);
        if (isSortDialogOpened) {
            getServiceCategoryGroups();
        }
    }, [isSortDialogOpened]);

    return (
        <>
            <Dialog open={isSortDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="w-full sm:max-w-xl">
                    <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {t('admin/common:actions.sort-item', {
                                    item: t('common:labels.group'),
                                })}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        {form.data.items.length < 1 && isLoading && (
                            <Alert className="bg-muted">
                                <AlertDescription className="flex items-center">
                                    <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                    {t('common:loading.please-wait')}
                                </AlertDescription>
                            </Alert>
                        )}
                        {form.data.items.length >= 1 && isLoading && (
                            <Alert className="bg-muted">
                                <AlertDescription className="flex items-center">
                                    <Loading01Icon className="mr-2 h-4 w-4 animate-spin duration-2000" />
                                    {t('common:loading.please-wait')}
                                </AlertDescription>
                            </Alert>
                        )}
                        {form.data.items.length >= 1 && !isLoading && (
                            <ReactSortable
                                className="grid grid-cols-3 gap-3"
                                list={form.data.items}
                                setList={(e) => {
                                    form.setData('items', e);
                                }}
                                handle=".drag-handle"
                                animation={300}
                                ghostClass="opacity-50"
                            >
                                {form.data.items.map((item, index) => (
                                    <Button className="drag-handle justify-start" key={index}>
                                        {index + 1}. {item.label}
                                    </Button>
                                ))}
                            </ReactSortable>
                        )}
                        <DialogFooter>
                            {form.data.items.length >= 1 && !isLoading && (
                                <Button type="submit" className={cn('w-full')} disabled={isLoading} onClick={handleSubmit}>
                                    {!isLoading ? t('common:actions.submit') : t('common:loading.please-wait')}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
