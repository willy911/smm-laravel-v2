export const balanceTypes = {
    credit: {
        label: 'common:labels.credit',
        icon: 'mdi mdi-plus-circle-outline',
        color: 'green-500',
    },
    debit: {
        label: 'common:labels.debit',
        icon: 'mdi mdi-minus-circle-outline',
        color: 'red-500',
    },
};

export const balanceTypeKeys = Object.keys(balanceTypes);

export const balanceTypeOptions = Object.entries(balanceTypes).map(([key, value]) => ({
    value: key,
    label: value.label,
}));

export const balanceCategories = {
    order: {
        label: 'common:labels.order',
    },
    deposit: {
        label: 'common:labels.deposit',
    },
    commission: {
        label: 'common:labels.commission',
    },
    other: {
        label: 'common:labels.other',
    },
};

export const balanceCategoryKeys = Object.keys(balanceCategories);

export const balanceCategoryOptions = Object.entries(balanceCategories).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
