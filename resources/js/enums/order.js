import { CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, Loading03Icon } from 'hugeicons-react';

export const orderStatuses = {
    pending: {
        label: 'common:status.pending',
        icon: Clock05Icon,
        variant: 'warning',
        textColor: 'text-amber-600',
    },
    processing: {
        label: 'common:status.processing',
        icon: Loading03Icon,
        variant: 'info',
        textColor: 'text-blue-500',
    },
    in_progress: {
        label: 'common:status.in-progress',
        icon: Loading03Icon,
        variant: 'info',
        textColor: 'text-blue-500',
    },
    completed: {
        label: 'common:status.completed',
        icon: CheckmarkCircle01Icon,
        variant: 'success',
        textColor: 'text-green-600',
    },
    error: {
        label: 'common:status.error',
        icon: CancelCircleIcon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
    partial: {
        label: 'common:status.partial',
        icon: CancelCircleIcon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
    canceled: {
        label: 'common:status.canceled',
        icon: CancelCircleIcon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
};

export const orderRefundStatuses = {
    1: {
        label: 'Sudah',
        icon: 'mdi mdi-check-circle-outline',
        color: 'green-500',
    },
    0: {
        label: 'Belum',
        icon: 'mdi mdi-close-circle-outline',
        color: 'yellow-500',
    },
};

export const orderedVia = {
    web: 'Web',
    api: 'API',
};

export const orderedViaOptions = [
    { value: 'web', label: 'Web' },
    { value: 'api', label: 'API' },
];

export const orderRefundOptions = [
    { value: '1', label: 'Sudah' },
    { value: '0', label: 'Belum' },
];

export const orderStatusOptions = Object.entries(orderStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
    textColor: value.textColor,
}));
