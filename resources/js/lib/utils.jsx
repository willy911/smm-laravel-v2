import { toast } from '@/hooks/use-toast';
import { usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import ParseToHTML from 'html-react-parser';
import humanizeDuration from 'humanize-duration';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function config(column = 'website') {
    const { configs } = usePage().props;
    if (column == 'all') return configs;
    return configs[column];
}

export function getFile(disk = '', fileName) {
    const { cdnURL } = usePage().props;
    return `${cdnURL}/${disk}/${fileName}`;
}

export function toHTML(string) {
    if (!string) return;
    return ParseToHTML(string.replace(/javascript:void|script/g, '#'));
}

export function formatRupiah(amount) {
    if (amount == undefined) return;
    const roundedAmount = Math.round(amount);
    return roundedAmount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });
}

export function createCurrencyFormatter(locales, language, rateOverride = null) {
    const target = locales.find((l) => l.locale === language);
    const base = locales.find((l) => parseFloat(l.usd_rate) === 1.0);
    if (!target || !base) {
        return (amount) => amount;
    }
    const baseRate = parseFloat(base.usd_rate);
    let targetRate;
    // Override kurs hanya berlaku saat mengonversi ke mata uang non-dasar.
    // Bila bahasa aktif = mata uang dasar (usd_rate = 1, mis. English-USD),
    // nilai internal (kredit/USD) memang sudah dalam satuan tersebut — jangan
    // dikalikan kurs override (mis. snapshot kurs beli deposit) karena label
    // yang dicetak tetap simbol mata uang dasar ("$").
    const isBaseLocale = parseFloat(target.usd_rate) === baseRate;
    if (!isBaseLocale && Number.isFinite(Number(rateOverride)) && Number(rateOverride) > 0) {
        targetRate = Number(rateOverride);
    } else {
        targetRate = parseFloat(target.usd_rate);
    }
    const localeCode = target.locale_code;
    const currencyCode = target.currency_code;
    const maxFractionDigits = target.max_decimal_digits ?? 4;
    const decimalSeparator = target.decimal_separator ?? '.';
    const thousandSeparator = target.thousand_separator ?? ',';
    return function formatCurrency(amount, onlyNumber = false) {
        if (amount === undefined || amount === null) return;
        const convertedAmount = amount * (targetRate / baseRate);
        let formatted = convertedAmount.toLocaleString(localeCode, {
            style: onlyNumber ? 'decimal' : 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: maxFractionDigits,
        });
        // if (decimalSeparator !== '.' || thousandSeparator !== ',') {
        //     formatted = formatted
        //         .replace(/\./g, 'DEC_TMP')
        //         .replace(/,/g, 'THOUSAND_TMP')
        //         .replace(/DEC_TMP/g, decimalSeparator)
        //         .replace(/THOUSAND_TMP/g, thousandSeparator);
        // }
        return formatted;
    };
}

export function formatDate({ date, format = 'DD MMMM YYYY - HH:mm', forHuman = false, isFlex = false }) {
    dayjs.extend(relativeTime);
    if (!date) return ParseToHTML('<i class="mdi mdi-close-circle text-danger"></i>');
    if (!forHuman)
        return dayjs(date)
            .locale(localStorage.getItem('language') ?? 'id')
            .format(format);
    if (forHuman && !isFlex) {
        return (
            <>
                <div>
                    {dayjs(date)
                        .locale(localStorage.getItem('language') ?? 'id')
                        .format(format)}
                </div>
                <small>
                    {dayjs(date)
                        .locale(localStorage.getItem('language') ?? 'id')
                        .fromNow()}
                </small>
            </>
        );
    }
    if (forHuman && isFlex) {
        return (
            <div className="flex">
                {dayjs(date)
                    .locale(localStorage.getItem('language') ?? 'id')
                    .format(format)}{' '}
                (
                {dayjs(date)
                    .locale(localStorage.getItem('language') ?? 'id')
                    .fromNow()}
                )
            </div>
        );
    }
}

export function formatDateForHuman(date) {
    dayjs.extend(relativeTime);
    if (!date) return ParseToHTML('<i class="mdi mdi-close-circle text-danger"></i>');
    return dayjs(date)
        .locale(localStorage.getItem('language') ?? 'id')
        .fromNow();
}

export function formatDuration(seconds) {
    const humanizer = humanizeDuration.humanizer({
        language: localStorage.getItem('language') ?? 'id',
        units: ['h', 'm', 's'],
        round: true,
        spacer: ' ',
        delimiter: ' ',
        largest: 3,
    });
    return humanizer(seconds * 1000);
}

export function formatAmount(amount, prefix = null) {
    if (amount === undefined) return;
    const roundedAmount = Number(amount);
    const formattedValue = roundedAmount.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
    });
    return prefix ? `${prefix} ${formattedValue}` : formattedValue;
}

export const copyText = (text, t) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            toast({
                variant: 'success',
                description: t('common:toast.text-copied'),
            });
        })
        .catch(() => {
            toast({
                variant: 'error',
                description: t('common:toast.copy-failed'),
            });
        });
};

export function cleanHTML(string) {
    return string.replace(/(<([^>]+)>)/gi, '');
}

export function stringLimit(string, start, end) {
    return string.slice(start, end);
}
