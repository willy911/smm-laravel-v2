import { CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, Loading03Icon } from 'hugeicons-react';

export const orderRefillStatuses = {
    pending: {
        label: 'common:status.pending',
        icon: Clock05Icon,
        variant: 'warning',
    },
    processing: {
        label: 'common:status.processing',
        icon: Loading03Icon,
        variant: 'info',
    },
    in_progress: {
        label: 'common:status.in-progress',
        icon: Loading03Icon,
        variant: 'info',
    },
    completed: {
        label: 'common:status.completed',
        icon: CheckmarkCircle01Icon,
        variant: 'success',
    },
    error: {
        label: 'common:status.error',
        icon: CancelCircleIcon,
        variant: 'destructive',
    },
    rejected: {
        label: 'common:status.rejected',
        icon: CancelCircleIcon,
        variant: 'destructive',
    },
};

export const orderRefillStatusOptions = Object.entries(orderRefillStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
