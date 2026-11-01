import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { CancelCircleIcon, CheckmarkCircle01Icon, InformationCircleIcon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';

const IconComponents = {
    error: CancelCircleIcon,
    success: CheckmarkCircle01Icon,
    pending: InformationCircleIcon,
};

export function Toaster() {
    const { t } = useTranslation();
    const { toasts } = useToast();

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                const Icon = IconComponents[props.variant];
                const toastTitle = title || t(`common:toast.${props.variant}`);
                return (
                    <Toast key={id} {...props}>
                        <div className="grid gap-1">
                            {toastTitle && (
                                <div className="flex gap-[2px] items-center">
                                    {Icon && <Icon className="h-4 -ml-[5px] -mt-px text-white" />}
                                    <ToastTitle>{toastTitle}</ToastTitle>
                                </div>
                            )}
                            {description && <ToastDescription>{description}</ToastDescription>}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
