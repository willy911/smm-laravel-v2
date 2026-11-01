import { CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon, UnavailableIcon } from 'hugeicons-react';

export const depositStatuses = {
    pending: {
        label: 'common:status.pending',
        icon: Clock05Icon,
        variant: 'warning',
    },
    success: {
        label: 'common:status.success',
        icon: CheckmarkCircle01Icon,
        variant: 'success',
    },
    canceled: {
        label: 'common:status.canceled',
        icon: CancelCircleIcon,
        variant: 'destructive',
    },
    expired: {
        label: 'common:status.expired',
        icon: UnavailableIcon,
        variant: 'destructive',
    },
};

export const depositStatusKeys = Object.keys(depositStatuses);

export const depositStatusOptions = Object.entries(depositStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
