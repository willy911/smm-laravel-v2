import { CancelCircleIcon, CheckmarkCircle01Icon } from 'hugeicons-react';

export const userStatuses = {
    1: {
        label: 'common:status.active',
        icon: CheckmarkCircle01Icon,
        variant: 'success',
        textColor: 'text-green-500',
    },
    0: {
        label: 'common:status.inactive',
        icon: CancelCircleIcon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
};

export const userStatusKeys = Object.keys(userStatuses);

export const userStatusOptions = Object.entries(userStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
