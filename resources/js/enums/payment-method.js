export const paymentMethodTypes = {
    virtual_account: {
        label: 'Virtual Account',
    },
    e_wallet: {
        label: 'E-Wallet',
    },
    // transfer_bank: {
    //     label: 'Transfer Bank',
    // },
    qris: {
        label: 'QRIS',
    },
    convenience_store: {
        label: 'Convenience Store',
    },
    pulsa: {
        label: 'Pulsa',
    },
    crypto: {
        label: 'Kripto',
    },
    other: {
        label: 'Lainnya',
    },
};

export const paymentMethodTypeOptions = Object.entries(paymentMethodTypes).map(([key, value]) => ({
    value: key,
    label: value.label,
}));

export const paymentMethodPaymentGateways = {
    midtrans: {
        label: 'Midtrans',
    },
    tripay: {
        label: 'Tripay',
    },
    paydisini: {
        label: 'Paydisini',
    },
    duitku: {
        label: 'Duitku',
    },
    tokopay: {
        label: 'Tokopay',
    },
    cryptomus: {
        label: 'Cryptomus',
    },
    flazpay: {
        label: 'Flazpay',
    },
};

export const paymentMethodPaymentGatewayOptions = Object.entries(paymentMethodPaymentGateways).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
