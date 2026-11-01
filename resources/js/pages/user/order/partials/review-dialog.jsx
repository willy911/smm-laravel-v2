import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn, toHTML } from '@/lib/utils';
import axios from 'axios';
import { StarIcon } from 'hugeicons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ReviewDialog({ target, onClose }) {
    const { t } = useTranslation('orders');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isOpen = Boolean(target);
    const maxMessageLength = 1000;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await axios.post(route('user.orders.reviews.store'), {
                order_id: target.id,
                rating: rating,
                message: message,
            });
            toast({
                variant: response.data.status ? 'success' : 'error',
                description: toHTML(response.data.message),
            });
            if (response.data.status) {
                setMessage('');
                setRating(5);
                onClose();
            }
        } catch (error) {
            toast({
                variant: 'error',
                description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ulasan</DialogTitle>
                    <DialogDescription>
                        Berikan penilaian untuk pesanan dengan ID <b>{target?.id}</b>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label isRequired>Penilaian</Label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRating(value)}
                                        onMouseEnter={() => setHoverRating(value)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        aria-label={`Beri penilaian ${value}`}
                                        className="cursor-pointer transition-transform hover:scale-110 focus-visible:outline-none"
                                    >
                                        <StarIcon
                                            className={cn(
                                                'h-6 w-6 transition-colors',
                                                (hoverRating || rating) >= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
                                            )}
                                        />
                                    </button>
                                ))}
                                <Badge variant="secondary" className="text-primary ml-2 rounded-sm border-none text-[11px]">
                                    {rating}/5
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="reviewMessage">{t('common:labels.message')}</Label>
                            <Textarea
                                id="reviewMessage"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tulis ulasan anda (opsional)..."
                                rows={4}
                                maxLength={maxMessageLength}
                            />
                            <span className="text-muted-foreground text-xs">
                                {message.length}/{maxMessageLength}
                            </span>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
