import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AppearanceToggleDropdown({ className = '', ...props }) {
    const { t } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-5 w-5" />;
            case 'light':
                return <Sun className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8">
                        {getCurrentIcon()}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex cursor-pointer items-center gap-2" onClick={() => updateAppearance('light')}>
                        <Sun className="h-5 w-5" />
                        {t('common:labels.light')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex cursor-pointer items-center gap-2" onClick={() => updateAppearance('dark')}>
                        <Moon className="h-5 w-5" />
                        {t('common:labels.dark')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex cursor-pointer items-center gap-2" onClick={() => updateAppearance('system')}>
                        <Monitor className="h-5 w-5" />
                        {t('common:labels.system')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
