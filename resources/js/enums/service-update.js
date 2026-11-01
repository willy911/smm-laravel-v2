import {
    CheckmarkCircle01Icon,
    CircleArrowDown02Icon,
    CircleArrowUp02Icon,
    InformationCircleIcon,
    PlusSignCircleIcon,
    XVariableCircleIcon,
} from 'hugeicons-react';

export const serviceUpdateTypes = {
    price_increased: {
        label: 'services:updates.labels.price-increased',
        icon: CircleArrowUp02Icon,
        textColor: 'text-amber-500',
        variant: 'amber',
    },
    price_decreased: {
        label: 'services:updates.labels.price-decreased',
        icon: CircleArrowDown02Icon,
        textColor: 'text-green-500',
        variant: 'green',
    },
    enabled: {
        label: 'services:updates.labels.enabled',
        icon: CheckmarkCircle01Icon,
        textColor: 'text-green-500',
        variant: 'green',
    },
    disabled: {
        label: 'services:updates.labels.disabled',
        icon: XVariableCircleIcon,
        textColor: 'text-destructive',
        variant: 'red',
    },
    added: {
        label: 'services:updates.labels.added',
        icon: PlusSignCircleIcon,
        textColor: 'text-green-500',
        variant: 'green',
    },
    deleted: {
        label: 'services:updates.labels.deleted',
        icon: XVariableCircleIcon,
        textColor: 'text-destructive',
        variant: 'red',
    },
    updated: {
        label: 'services:updates.labels.updated',
        icon: InformationCircleIcon,
        textColor: 'text-blue-500',
        variant: 'blue',
    },
};

export const serviceUpdateTypeOptions = Object.entries(serviceUpdateTypes).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
