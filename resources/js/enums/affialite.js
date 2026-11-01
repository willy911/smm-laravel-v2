import { CancelCircleIcon, CheckmarkCircle01Icon, Clock05Icon } from 'hugeicons-react';

export const affialiteStatuses = {
    waiting: {
        label: 'common:status.waiting',
        icon: Clock05Icon,
        variant: 'warning',
        textColor: 'text-amber-600',
    },
    approved: {
        label: 'common:status.approved',
        icon: CheckmarkCircle01Icon,
        variant: 'success',
        textColor: 'text-green-600',
    },
    rejected: {
        label: 'common:status.rejected',
        icon: CancelCircleIcon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
};

export const affialiteStatusOptions = Object.entries(affialiteStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
    textColor: value.textColor,
}));
