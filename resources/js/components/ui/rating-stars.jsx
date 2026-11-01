import { cn } from '@/lib/utils';
import { StarIcon } from 'hugeicons-react';

const toRating = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(5, n));
};

/**
 * Baris bintang (read-only).
 * @param {number} rating  Nilai 0..5.
 */
export function RatingStars({ rating = 0, size = 14, className, activeClassName = 'text-yellow-400', inactiveClassName = 'text-gray-300' }) {
    const value = toRating(rating);
    return (
        <div className={cn('flex items-center gap-0.5', className)} aria-label={`Penilaian ${value.toFixed(1)} dari 5`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= Math.round(value);
                return (
                    <StarIcon
                        key={star}
                        size={size}
                        className={active ? activeClassName : inactiveClassName}
                        style={active ? { fill: 'currentColor' } : undefined}
                    />
                );
            })}
        </div>
    );
}

/**
 * Bintang + nilai angka + jumlah ulasan.
 * @param {number} rating  Nilai rata-rata 0..5.
 * @param {number} total   Jumlah ulasan.
 */
export function RatingBadge({ rating = 0, total = 0, size = 14, className, showEmpty = true }) {
    const value = toRating(rating);
    const count = Number(total) || 0;
    if (count === 0 && !showEmpty) return null;
    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <RatingStars rating={value} size={size} />
            {count > 0 ? (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {value.toFixed(1)} ({count})
                </span>
            ) : (
                <span className="text-xs text-muted-foreground whitespace-nowrap">Belum ada ulasan</span>
            )}
        </div>
    );
}

export default RatingStars;
