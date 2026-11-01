import { MailLove01Icon, MailRemove02Icon, MailReply02Icon } from 'hugeicons-react';

export const ticketStatuses = {
    open: {
        label: 'common:status.open',
        icon: MailLove01Icon,
        variant: 'success',
        textColor: 'text-green-500',
    },
    answered: {
        label: 'common:status.answered',
        icon: MailReply02Icon,
        variant: 'success',
        textColor: 'text-green-500',
    },
    user_reply: {
        label: 'common:status.user-reply',
        icon: MailReply02Icon,
        variant: 'warning',
        textColor: 'text-amber-500',
    },
    closed: {
        label: 'common:status.closed',
        icon: MailRemove02Icon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
};

export const ticketStatusKeys = Object.keys(ticketStatuses);

export const ticketStatusOptions = Object.entries(ticketStatuses).map(([key, value]) => ({
    value: key,
    label: value.label,
}));

export const ticketDepartments = {
    order: {
        label: 'common:labels.order',
    },
    deposit: {
        label: 'common:labels.deposit',
    },
    other: {
        label: 'common:labels.other',
    },
};

export const ticketDepartmentKeys = Object.keys(ticketDepartments);

export const ticketDepartmentOptions = Object.entries(ticketDepartments).map(([key, value]) => ({
    value: key,
    label: value.label,
}));

export const ticketRequests = {
    refill: {
        label: 'common:labels.refill',
    },
    cancel: {
        label: 'common:labels.cancel',
    },
    speedup: {
        label: 'common:labels.speedup',
    },
    other: {
        label: 'common:labels.other',
    },
};

export const ticketRequestKeys = Object.keys(ticketRequests);

export const ticketRequestOptions = Object.entries(ticketRequests).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
