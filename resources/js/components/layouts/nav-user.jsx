import { ChevronsUpDown } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';
import { DatabaseIcon, LicenseIcon, Logout02Icon, UserSettings01Icon, WalletDone01Icon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';

export function NavUser({ user }) {
    const { t } = useTranslation('account');
    const { isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">J</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.group}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.group}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => router.visit(route('user.account.settings'))}
                            >
                                <UserSettings01Icon />
                                {t('common:labels.settings')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => router.visit(route('user.account.logs.balance'))}
                            >
                                <WalletDone01Icon />
                                {t('common:labels.balance-logs')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => router.visit(route('user.account.logs.signin'))}
                            >
                                <DatabaseIcon />
                                {t('common:labels.signin-logs')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => router.visit(route('user.account.logs.activity'))}
                            >
                                <LicenseIcon />
                                {t('common:labels.activity-logs')}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex cursor-pointer items-center gap-2" onClick={() => router.visit(route('user.auth.signout'))}>
                            <Logout02Icon />
                            {t('common:labels.signout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
