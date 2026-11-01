import { Button } from '@/components/ui/button';
import { ticketDepartments, ticketRequests, ticketStatuses } from '@/enums/ticket';
import { cn, formatDate } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function TicketDetail({ row }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('labels.id')}</div>
                <div>: {row.original.id}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.created-at')}</div>
                <div className="flex gap-1">
                    :
                    {formatDate({
                        date: row.original.created_at,
                        forHuman: true,
                        isFlex: true,
                    })}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.updated-at')}</div>
                <div className="flex gap-1">
                    :
                    {formatDate({
                        date: row.original.updated_at,
                        forHuman: true,
                        isFlex: true,
                    })}
                </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('labels.department')}</div>
                <div>: {ticketDepartments[row.original.department].label}</div>
            </div>
            {row.original.department === 'order' && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium">{t('labels.request')}</div>
                    <div>: {ticketRequests[row.original.request].label}</div>
                </div>
            )}
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('labels.subject')}</div>
                <div>: {row.original.subject}</div>
            </div>
            {row.original.data_id && (
                <div className="grid grid-cols-[200px_1fr] gap-1">
                    <div className="font-medium">ID {row.original.department === 'deposit' ? t('labels.deposit') : t('labels.order')}</div>
                    <div>: {row.original.data_id}</div>
                </div>
            )}

            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.ip-address')}</div>
                <div>: {row.original.ip_address}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('common:labels.user-agent')}</div>
                <div>: {row.original.user_agent}</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-1">
                <div className="font-medium">{t('labels.status')}</div>
                <div className="flex items-center gap-1">
                    :
                    <Button size="sm" variant={ticketStatuses[row.original.status].variant} className={cn('flex h-5')}>
                        {t(ticketStatuses[row.original.status].label)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
