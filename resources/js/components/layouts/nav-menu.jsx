import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn, config, formatAmount } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { CustomerService02Icon, NewsIcon } from 'hugeicons-react';
import { ChevronRight, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/badge';
import ContactDialog from './contact-dialog';

const SidebarItem = ({ item, tooltip, children }) => (
    <Collapsible key={item.title} asChild>
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={tooltip || item.title}
                className={cn(
                    'hover:from-primary/75 hover:to-primary hover:text-primary-foreground active:text-primary-foreground bg-gradient-to-b transition-colors duration-300',
                    route().current(item.routeName) && 'from-primary/75 to-primary text-primary-foreground',
                )}
            >
                {children}
            </SidebarMenuButton>
        </SidebarMenuItem>
    </Collapsible>
);

export function NavMenu({ general, orders, deposits, services, supports, collapsible = [] }) {
    const { t, i18n } = useTranslation(route().current('admin.*') ? ['admin/common'] : null);
    const { auth, unreadTicketsCount, unreadTicketsCountAdmin, websiteSitemaps } = usePage().props;
    const [showContactDialog, setShowContactDialog] = useState(false);

    const renderLink = (item) => (
        <Link href={route(item.routeName)}>
            <item.icon />
            <span className="font-medium">{item.title}</span>
            {item.routeName === 'user.tickets.index' && unreadTicketsCount > 0 && (
                <Badge variant="amber" className="ml-auto h-4 border-none px-2 font-normal shadow">
                    {formatAmount(unreadTicketsCount)}
                </Badge>
            )}
            {item.routeName === 'admin.tickets.index' && unreadTicketsCountAdmin > 0 && (
                <Badge variant="amber" className="ml-auto h-4 border-none px-2 font-normal shadow">
                    {formatAmount(unreadTicketsCountAdmin)}
                </Badge>
            )}
        </Link>
    );

    const renderSection = (label, items, show = true) => {
        if (show) {
            return (
                <>
                    <SidebarGroupLabel>{t(label)}</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map((item) => {
                            if (route().current('admin.*') && auth.admin && !item.access) return null;
                            if (item.auth === true && !auth.user) return null;
                            if (item.auth === false && auth.user) return null;
                            if (item.routeName === 'user.auth.signup' && config('menu').user.auth.signup.enabled !== '1') return null;
                            if (item.routeName === 'user.auth.password.request' && config('menu').user.auth.reset_password.enabled !== '1')
                                return null;
                            if (item.routeName === 'user.leaderboard' && config('menu').user.leaderboard.enabled !== '1') return null;
                            if (item.routeName === 'user.affiliate.index' && config('menu')?.user?.affiliate?.enabled !== '1') return null;
                            if (item.routeName === 'user.api_docs' && auth.user?.group?.is_api_access_enabled == false) return null;
                            if (item.contact !== undefined && item.contact) {
                                return (
                                    <ContactDialog key={item.title} showContactDialog={showContactDialog} setShowContactDialog={setShowContactDialog}>
                                        <div
                                            variant="ghost"
                                            className={cn(
                                                'peer/menu-button ring-sidebar-ring active:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:from-primary/75 hover:to-primary hover:text-primary-foreground active:text-primary-foreground flex h-8 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md bg-gradient-to-b p-2 text-left text-sm outline-hidden transition-colors duration-300 group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                                            )}
                                            onClick={() => setShowContactDialog(true)}
                                        >
                                            <CustomerService02Icon />
                                            <span className="font-medium">{item.title}</span>
                                        </div>
                                    </ContactDialog>
                                );
                            }

                            return (
                                <SidebarItem key={item.title} item={item}>
                                    {renderLink(item)}
                                </SidebarItem>
                            );
                        })}
                    </SidebarMenu>
                </>
            );
        }
    };

    const renderCollapsible = (items) => {
        return (
            <SidebarMenu className="mt-1">
                {items.map((item) => {
                    if (route().current('admin.*') && auth.admin && !item.access) return null;
                    // Jika item adalah single menu, render sebagai single item
                    if (item.isSingle) {
                        return (
                            <SidebarItem key={item.title} item={item}>
                                {renderLink(item)}
                            </SidebarItem>
                        );
                    }

                    // Jika item adalah collapsible, render sebagai collapsible
                    return (
                        <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className={cn(
                                            'data-[state=open]:from-primary/75 data-[state=open]:to-primary hover:from-primary/75 hover:to-primary hover:text-primary-foreground data-[active=true]:text-primary-foreground active:text-primary-foreground data-[state=open]:text-primary-foreground data-[state=open]:hover:text-primary-foreground bg-gradient-to-b transition-colors duration-300',
                                        )}
                                    >
                                        {item.icon && <item.icon />}
                                        <span className="font-medium">{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="collapsible-content">
                                    <SidebarMenuSub className="my-1">
                                        {item.items?.map((subItem) => {
                                            if (subItem.isCollapsible && subItem.subItems) {
                                                if (route().current('admin.*') && auth.admin && !subItem.access) return null;
                                                return (
                                                    <Collapsible
                                                        key={subItem.title}
                                                        asChild
                                                        className="group/nested-collapsible"
                                                        defaultOpen={subItem.isActive}
                                                    >
                                                        <SidebarMenuSubItem>
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuSubButton
                                                                    className={cn(
                                                                        'text-muted-foreground hover:text-primary active:text-primary data-[active=true]:text-primary flex cursor-pointer items-center justify-between hover:bg-transparent data-[active=true]:bg-transparent',
                                                                    )}
                                                                    isActive={subItem.isActive}
                                                                >
                                                                    <span>{subItem.title}</span>
                                                                </SidebarMenuSubButton>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent className="collapsible-content">
                                                                <SidebarMenuSub className="my-1">
                                                                    {subItem.subItems.map((nestedItem) => {
                                                                        if (route().current('admin.*') && auth.admin && !nestedItem.access)
                                                                            return null;
                                                                        return (
                                                                            <SidebarMenuSubButton
                                                                                key={nestedItem.title}
                                                                                asChild
                                                                                isActive={nestedItem.isActive}
                                                                                className={cn(
                                                                                    'text-muted-foreground hover:text-primary active:text-primary data-[active=true]:text-primary text-sm hover:bg-transparent data-[active=true]:bg-transparent',
                                                                                )}
                                                                            >
                                                                                <Link href={nestedItem.url}>
                                                                                    <span>{nestedItem.title}</span>
                                                                                </Link>
                                                                            </SidebarMenuSubButton>
                                                                        );
                                                                    })}
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </SidebarMenuSubItem>
                                                    </Collapsible>
                                                );
                                            }

                                            if (route().current('admin.*') && auth.admin && !subItem.access) return null;
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subItem.isActive}
                                                        className={cn(
                                                            'text-muted-foreground hover:text-primary active:text-primary data-[active=true]:text-primary hover:bg-transparent data-[active=true]:bg-transparent',
                                                        )}
                                                    >
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        );
    };

    const renderSitemaps = () => (
        <>
            <SidebarGroupLabel>{t('common:labels.sitemap')}</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip={t('common:labels.blog')}
                        className={cn(
                            'hover:from-primary/75 hover:to-primary hover:text-primary-foreground active:text-primary-foreground bg-gradient-to-b transition-colors duration-300',
                            route().current('guest.blogs.index') && 'from-primary/75 to-primary text-primary-foreground',
                        )}
                    >
                        <Link href={route('guest.blogs.index')}>
                            <NewsIcon />
                            <span className="font-medium">{t('common:labels.blog')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                {websiteSitemaps.map((item) => (
                    <Collapsible key={item.title} asChild>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={cn(
                                    'hover:from-primary/75 hover:to-primary hover:text-primary-foreground active:text-primary-foreground bg-gradient-to-b transition-colors duration-300',
                                    route().current('guest.sitemaps.show', {
                                        slug: item.slug,
                                    }) && 'from-primary/75 to-primary text-primary-foreground',
                                )}
                            >
                                <Link href={route('guest.sitemaps.show', { target: item.slug })}>
                                    <Paperclip />
                                    <span className="font-medium">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </>
    );

    return route().current('admin.*') ? (
        <SidebarGroup>
            {renderSection('common:labels.menu', general)}
            {renderCollapsible(collapsible)}
        </SidebarGroup>
    ) : (
        <SidebarGroup>
            {renderSection('common:labels.menu', general)}
            {renderSection('common:labels.orders', orders, auth.user)}
            {renderSection('common:labels.deposits', deposits, auth.user)}
            {renderSection('common:labels.services', services)}
            {renderSection('common:labels.support', supports)}
            {renderSitemaps()}
        </SidebarGroup>
    );
}
