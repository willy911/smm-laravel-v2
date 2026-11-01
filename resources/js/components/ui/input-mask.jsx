import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat, PatternFormat } from 'react-number-format';

export default forwardRef(function InputMask({ maskType = 'numeric', className = '', ...props }, ref) {
    const { locales } = usePage().props;
    const { t, i18n } = useTranslation();
    const locale = locales.find((l) => l.locale === i18n.language);
    if (maskType == 'pattern') {
        return (
            <PatternFormat
                {...props}
                data-slot="input"
                className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:focus-visible:ring-ring/70 aria-invalid:ring-destructive/50 aria-invalid:border-destructive aria-invalid:border-2 dark:aria-invalid:ring-destructive/50",
                    className
                )}
            />
        );
    }

    return (
        <NumericFormat
            {...props}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:focus-visible:ring-ring/70 aria-invalid:ring-destructive/50 aria-invalid:border-destructive aria-invalid:border-2 dark:aria-invalid:ring-destructive/50",
                className
            )}
            thousandSeparator={props.suffix !== undefined && props.suffix === ' %' ? '.' : locale.thousand_separator}
            decimalSeparator={props.suffix !== undefined && props.suffix === ' %' ? ',' : locale.decimal_separator}
            decimalScale={props.suffix !== undefined && props.suffix === ' %' ? 2 : locale.max_decimal_digits} 
            allowNegative={props.suffix !== undefined && props.suffix === ' %' ? false : props.allowNegative ?? false}
        />
    );
});
