import { config } from '@/lib/utils';
import { Dialog as HeadlessDialog, DialogPanel as HeadlessDialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import {
    Facebook01Icon,
    HelpCircleIcon,
    InstagramIcon,
    Location01Icon,
    MailAtSign01Icon,
    TelegramIcon,
    TiktokIcon,
    WhatsappBusinessIcon,
} from 'hugeicons-react';
import { XIcon } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '../ui/button';

const ContactCard = ({ icon: Icon, title, desc, href, buttonText, isExternal = true }) => (
    <div className="bg-primary-foreground/0 dark:bg-background/50 border-border flex items-center justify-between rounded-xl border p-4 py-4 shadow-md">
        <div className="flex items-center">
            <div className="bg-primary/10 mr-4 rounded-xl p-3">
                <Icon className="text-primary h-6 w-6" />
            </div>
            <div>
                <h3 className="text-foreground font-medium">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
        </div>
        {isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'default', size: 'sm' })}>
                {buttonText}
            </a>
        ) : (
            <Link href={href} className={buttonVariants({ variant: 'default', size: 'sm' })}>
                {buttonText}
            </Link>
        )}
    </div>
);

export default function ContactDialog({ showContactDialog, setShowContactDialog, children }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    const socialItems = [
        {
            key: 'ticket',
            icon: HelpCircleIcon,
            action: 'link',
            href: route('user.tickets.create'),
            button: 'actions.send-item',
        },
        {
            key: 'email',
            icon: MailAtSign01Icon,
            href: `mailto:${config('social').email}`,
            condition: config('social').email,
            button: 'actions.send-item',
        },
        {
            key: 'whatsapp',
            icon: WhatsappBusinessIcon,
            href: `https://wa.me/${config('social').whatsapp}`,
            condition: config('social').whatsapp,
            button: 'actions.send-item',
        },
        {
            key: 'telegram',
            icon: TelegramIcon,
            href: `https://t.me/${config('social').telegram}`,
            condition: config('social').telegram,
            button: 'actions.send-item',
        },
        {
            key: 'instagram',
            icon: InstagramIcon,
            href: `https://instagram.com/${config('social').instagram}`,
            condition: config('social').instagram,
            button: 'actions.navigate.view',
        },
        {
            key: 'facebook',
            icon: Facebook01Icon,
            href: `https://fb.me/${config('social').facebook}`,
            condition: config('social').facebook,
            button: 'actions.navigate.view',
        },
        {
            key: 'tiktok',
            icon: TiktokIcon,
            href: `https://tiktok.com/${config('social').tiktok}`,
            condition: config('social').tiktok,
            button: 'actions.navigate.view',
        },
        {
            key: 'google-maps',
            icon: Location01Icon,
            href: config('social').google_maps,
            condition: config('social').google_maps,
            button: 'actions.navigate.visit',
        },
    ];
    return (
        <>
            {children}
            <Transition appear show={showContactDialog} as={Fragment}>
                <HeadlessDialog as="div" className="relative z-50" onClose={() => setShowContactDialog(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <HeadlessDialogPanel className="border-border/25 bg-secondary relative w-full translate-y-0 transform overflow-hidden !rounded-2xl border text-left shadow-xl transition-all sm:my-8 sm:max-w-4xl">
                                    <button
                                        type="button"
                                        className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                        onClick={() => setShowContactDialog(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XIcon className="h-6 w-6" />
                                    </button>
                                    <div className="p-4 text-center">
                                        <h1 className="text-primary text-3xl font-semibold">{t('common:contact-dialog.title')}</h1>
                                        <p className="text-muted-foreground text-base">{t('common:contact-dialog.description')}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2">
                                        {socialItems.map((item) => {
                                            if (!item.condition && item.key !== 'ticket') return null;
                                            if (item.key == 'ticket' && !auth.user) return null;

                                            return (
                                                <ContactCard
                                                    key={item.key}
                                                    icon={item.icon}
                                                    title={t(`common:contact-dialog.${item.key}.title`)}
                                                    desc={t(`common:contact-dialog.${item.key}.description`)}
                                                    href={item.href}
                                                    buttonText={t(`common:${item.button}`, {
                                                        item: t(`common:labels.${item.key}`),
                                                    })}
                                                    isExternal={item.action !== 'link'}
                                                />
                                            );
                                        })}
                                    </div>
                                </HeadlessDialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </HeadlessDialog>
            </Transition>
        </>
    );
}
