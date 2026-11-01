import { CancelCircleIcon, CheckmarkCircle01Icon } from 'hugeicons-react';

export const userGroupStatuses = {
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

export const userGroupStatusOptions = Object.entries(userGroupStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
