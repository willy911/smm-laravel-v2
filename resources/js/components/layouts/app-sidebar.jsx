import {
    ApiIcon,
    ChartColumnIcon,
    CustomerService02Icon,
    File02Icon,
    GlobalIcon,
    Link03Icon,
    MailLove01Icon,
    Money01Icon,
    ProfitIcon,
    Setting07Icon,
    ShoppingBag01Icon,
    ShoppingBagAddIcon,
    SourceCodeIcon,
    Tag01Icon,
    UserGroupIcon,
    Wallet01Icon,
    WalletAdd01Icon,
} from 'hugeicons-react';

import { NavUser } from '@/components/layouts/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import usePermissions from '@/hooks/use-permissions';
import { config, getFile } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Activity, Database, Info, RotateCcw, Store, Tags, Trophy, UserCog, UserRoundCheck, UserRoundCog, UserRoundPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavMenu } from './nav-menu';

export function AppSidebar(props) {
    const { t, i18n } = useTranslation(
        route().current('admin.*')
            ? ['admin/common', 'admin/services', 'leaderboard', 'admin/report', 'admin/provider-response', 'orders']
            : ['dashboard', 'orders', 'deposits', 'services'],
    );
    const { auth } = usePage().props;
    const { logo_sm_light, logo_sm_dark, name, sub_name } = config();
    const { hasRole, hasAnyRole, isSuperAdmin } = usePermissions();

    const renderLogo = () => (
        <div className="bg-primary text-sidebar-primary-foreground border-ring ring-ring flex aspect-square size-8 items-center justify-center rounded-lg ring-[1.5px]">
            {!logo_sm_light || !logo_sm_dark ? (
                <GlobalIcon className="size-6">{name}</GlobalIcon>
            ) : (
                <>
                    <img className="block size-full rounded-lg dark:hidden" src={getFile('website', logo_sm_light)} alt={name} />
                    <img className="hidden size-full rounded-lg dark:block" src={getFile('website', logo_sm_dark)} alt={name} />
                </>
            )}
        </div>
    );

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                {renderLogo()}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="text-primary truncate font-semibold">{name}</span>
                                    <span className="truncate text-xs">{sub_name}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {route().current('admin.*') ? (
                    <NavMenu
                        general={[
                            {
                                title: t('common:labels.dashboard'),
                                routeName: 'admin.dashboard',
                                icon: Store,
                                access: true,
                            },
                            {
                                title: t('common:labels.leaderboard'),
                                routeName: 'admin.leaderboard',
                                icon: Trophy,
                                access: hasRole('leaderboard.access'),
                            },
                            {
                                title: t('common:labels.currency'),
                                routeName: 'admin.locales.index',
                                icon: Money01Icon,
                                access: isSuperAdmin,
                            },
                            {
                                title: t('common:labels.affiliate'),
                                routeName: 'admin.affiliates.index',
                                icon: Link03Icon,
                                access: isSuperAdmin,
                            },
                        ]}
                        collapsible={[
                            {
                                title: t('admin/common:labels.admins'),
                                url: '#',
                                icon: UserCog,
                                isActive: route().current('admin.admins.*'),
                                access: isSuperAdmin,
                                items: [
                                    {
                                        title: t('common:labels.list'),
                                        url: route('admin.admins.index'),
                                        isActive: ['admin.admins.index', 'admin.admins.create', 'admin.admins.edit'].includes(route().current()),
                                        access: isSuperAdmin,
                                    },
                                    {
                                        title: t('common:labels.group'),
                                        url: route('admin.admins.groups.index'),
                                        isActive: ['admin.admins.groups.index', 'admin.admins.groups.create', 'admin.admins.groups.edit'].includes(
                                            route().current(),
                                        ),
                                        access: isSuperAdmin,
                                    },
                                ],
                            },
                            {
                                title: t('common:labels.users'),
                                url: '#',
                                icon: UserGroupIcon,
                                isActive: route().current('admin.users.*'),
                                access: hasAnyRole(['user.access', 'user.group.access']),
                                items: [
                                    {
                                        title: t('common:labels.list'),
                                        url: route('admin.users.index'),
                                        isActive: ['admin.users.index', 'admin.users.create', 'admin.users.edit'].includes(route().current()),
                                        access: hasRole('user.access'),
                                    },
                                    {
                                        title: t('common:labels.group'),
                                        url: route('admin.users.groups.index'),
                                        isActive: ['admin.users.groups.index', 'admin.users.groups.create', 'admin.users.groups.edit'].includes(
                                            route().current(),
                                        ),
                                        access: hasRole('user.group.access'),
                                    },
                                ],
                            },
                            {
                                title: t('common:labels.services'),
                                url: '#',
                                icon: Tag01Icon,
                                isActive: route().current('admin.services.*'),
                                access: hasAnyRole([
                                    'service.access',
                                    'service.provider.access',
                                    'service.category.access',
                                    'service.category_group.access',
                                    'service.custom_price.access',
                                ]),
                                items: [
                                    {
                                        title: t('common:labels.list'),
                                        url: route('admin.services.index'),
                                        isActive: route().current('admin.services.index'),
                                        access: hasRole('service.access'),
                                    },
                                    {
                                        title: t('admin/common:labels.provider'),
                                        url: route('admin.services.providers.index'),
                                        isActive: route().current('admin.services.providers.index'),
                                        access: hasRole('service.provider.access'),
                                    },
                                    {
                                        title: t('common:labels.category'),
                                        url: '#',
                                        isActive: route().current('admin.services.categories.*'),
                                        isCollapsible: true,
                                        access: hasAnyRole(['service.category.access', 'service.category_group.access']),
                                        subItems: [
                                            {
                                                title: t('common:labels.list'),
                                                url: route('admin.services.categories.index'),
                                                isActive: route().current('admin.services.categories.index'),
                                                access: hasRole('service.category.access'),
                                            },
                                            {
                                                title: t('common:labels.group'),
                                                url: route('admin.services.categories.groups.index'),
                                                isActive: route().current('admin.services.categories.groups.index'),
                                                access: hasRole('service.category_group.access'),
                                            },
                                        ],
                                    },
                                    {
                                        title: t('common:labels.custom-price'),
                                        url: route('admin.services.custom-prices.index'),
                                        isActive: route().current('admin.services.custom-prices.index'),
                                        access: hasRole('service.custom_price.access'),
                                    },
                                    {
                                        title: t('common:labels.update'),
                                        url: route('admin.services.updates'),
                                        isActive: route().current('admin.services.updates'),
                                        access: true,
                                    },
                                    {
                                        title: 'Ambil Layanan',
                                        url: '#',
                                        isActive: route().current('admin.services.fetch.*'),
                                        isCollapsible: true,
                                        access: hasRole('service.create'),
                                        subItems: [
                                            {
                                                title: 'Single',
                                                url: route('admin.services.fetch.single.index'),
                                                isActive: route().current('admin.services.fetch.single.*'),
                                                access: hasRole('service.create'),
                                            },
                                            {
                                                title: 'Cat on Cat',
                                                url: route('admin.services.fetch.cat-on-cat.index'),
                                                isActive: route().current('admin.services.fetch.cat-on-cat.*'),
                                                access: hasRole('service.create'),
                                            },
                                            {
                                                title: 'Massal by Kategori',
                                                url: route('admin.services.fetch.massal-by-category.index'),
                                                isActive: route().current('admin.services.fetch.massal-by-category.*'),
                                                access: hasRole('service.create'),
                                            },
                                            {
                                                title: 'Massal',
                                                url: route('admin.services.fetch.massal.index'),
                                                isActive: route().current('admin.services.fetch.massal.index'),
                                                access: hasRole('service.create'),
                                            },
                                            {
                                                title: 'Get Services',
                                                url: route('admin.services.fetch.get-services.index'),
                                                isActive: route().current('admin.services.fetch.get-services.*'),
                                                access: hasRole('service.create'),
                                            },
                                        ],
                                    },
                                    {
                                        title: t('common:labels.monitoring'),
                                        url: route('admin.services.monitoring'),
                                        isActive: route().current('admin.services.monitoring'),
                                        access: true,
                                    },
                                ],
                            },
                            {
                                title: t('common:labels.orders'),
                                url: '#',
                                icon: ShoppingBag01Icon,
                                isActive: route().current('admin.orders.*'),
                                access: hasAnyRole(['order.access', 'order.refill.access']),
                                items: [
                                    {
                                        title: t('common:labels.list'),
                                        url: route('admin.orders.index'),
                                        isActive: route().current('admin.orders.index'),
                                        access: hasRole('order.access'),
                                    },
                                    {
                                        title: t('common:labels.refill'),
                                        url: route('admin.orders.refills.index'),
                                        isActive: route().current('admin.orders.refills.index'),
                                        access: hasRole('order.refill.access'),
                                    },
                                    {
                                        title: t('admin/report:labels.review'),
                                        url: route('admin.orders.reviews.index'),
                                        isActive: route().current('admin.orders.reviews.index'),
                                        access: isSuperAdmin,
                                    },
                                ],
                            },
                            {
                                title: t('common:labels.deposits'),
                                routeName: 'admin.deposits.index',
                                icon: Wallet01Icon,
                                isSingle: true,
                                access: hasRole('deposit.access'),
                            },
                            {
                                title: t('common:labels.tickets'),
                                routeName: 'admin.tickets.index',
                                icon: MailLove01Icon,
                                isSingle: true,
                                access: hasRole('ticket.access'),
                            },
                            {
                                title: t('common:labels.payment-methods'),
                                routeName: 'admin.payment-methods.index',
                                icon: Wallet01Icon,
                                isSingle: true,
                                access: hasRole('payment_method.access'),
                            },
                            {
                                title: t('admin/report:labels.profit-loss-menu'),
                                routeName: 'admin.profit-loss.index',
                                icon: ProfitIcon,
                                isSingle: true,
                                access: isSuperAdmin,
                            },
                            {
                                title: t('admin/report:labels.reports'),
                                url: '#',
                                icon: ChartColumnIcon,
                                isActive: route().current('admin.orders.report') || route().current('admin.deposits.report'),
                                access: isSuperAdmin,
                                items: [
                                    {
                                        title: t('admin/report:labels.orders'),
                                        url: route('admin.orders.report'),
                                        isActive: route().current('admin.orders.report'),
                                        access: isSuperAdmin,
                                    },
                                    {
                                        title: t('admin/report:labels.deposits'),
                                        url: route('admin.deposits.report'),
                                        isActive: route().current('admin.deposits.report'),
                                        access: isSuperAdmin,
                                    },
                                ],
                            },
                            {
                                title: t('admin/provider-response:labels.menu'),
                                routeName: 'admin.services.providers.response',
                                icon: SourceCodeIcon,
                                isSingle: true,
                                access: isSuperAdmin,
                            },
                            {
                                title: t('common:labels.logs'),
                                url: '#',
                                icon: File02Icon,
                                isActive: route().current('admin.logs.*'),
                                access: hasAnyRole([
                                    'log.admin.signin.access',
                                    'log.admin.activity.access',
                                    'log.user.signin.access',
                                    'log.user.activity.access',
                                    'log.user.signup.access',
                                    'log.user.balance.access',
                                ]),
                                items: [
                                    {
                                        title: t('admin/common:labels.admin'),
                                        url: '#',
                                        isActive: route().current('admin.logs.admins.*'),
                                        isCollapsible: true,
                                        access: hasAnyRole(['log.admin.signin.access', 'log.admin.activity.access']),
                                        subItems: [
                                            {
                                                title: t('common:labels.signin'),
                                                url: route('admin.logs.admins.signin'),
                                                isActive: route().current('admin.logs.admins.signin'),
                                                access: hasRole('log.admin.signin.access'),
                                            },
                                            {
                                                title: t('common:labels.activity'),
                                                url: route('admin.logs.admins.activity'),
                                                isActive: route().current('admin.logs.admins.activity'),
                                                access: hasRole('log.admin.activity.access'),
                                            },
                                        ],
                                    },
                                    {
                                        title: t('common:labels.user'),
                                        url: '#',
                                        isActive: route().current('admin.logs.users.*'),
                                        isCollapsible: true,
                                        access: hasAnyRole([
                                            'log.user.signin.access',
                                            'log.user.activity.access',
                                            'log.user.signup.access',
                                            'log.user.balance.access',
                                        ]),
                                        subItems: [
                                            {
                                                title: t('common:labels.signin'),
                                                url: route('admin.logs.users.signin'),
                                                isActive: route().current('admin.logs.users.signin'),
                                                access: hasRole('log.user.signin.access'),
                                            },
                                            {
                                                title: t('common:labels.signup'),
                                                url: route('admin.logs.users.signup'),
                                                isActive: route().current('admin.logs.users.signup'),
                                                access: hasRole('log.user.signup.access'),
                                            },
                                            {
                                                title: t('common:labels.activity'),
                                                url: route('admin.logs.users.activity'),
                                                isActive: route().current('admin.logs.users.activity'),
                                                access: hasRole('log.user.activity.access'),
                                            },
                                            {
                                                title: t('common:labels.balance'),
                                                url: route('admin.logs.users.balance'),
                                                isActive: route().current('admin.logs.users.balance'),
                                                access: hasRole('log.user.balance.access'),
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                title: t('common:labels.site'),
                                url: '#',
                                icon: Setting07Icon,
                                isActive: route().current('admin.websites.*'),
                                access: isSuperAdmin || hasAnyRole(['site.blog.access', 'site.news.access', 'site.sitemap.access']),
                                items: [
                                    {
                                        title: t('common:labels.blog'),
                                        url: route('admin.websites.blogs.index'),
                                        isActive: route().current('admin.websites.blogs.index'),
                                        access: hasRole('site.blog.access'),
                                    },
                                    {
                                        title: t('common:labels.news'),
                                        url: route('admin.websites.news.index'),
                                        isActive: route().current('admin.websites.news.index'),
                                        access: hasRole('site.news.access'),
                                    },
                                    {
                                        title: t('common:labels.sitemap'),
                                        url: route('admin.websites.sitemaps.index'),
                                        isActive: route().current('admin.websites.sitemaps.index'),
                                        access: hasRole('site.sitemap.access'),
                                    },
                                    {
                                        title: t('common:labels.configs'),
                                        url: route('admin.websites.configs.index'),
                                        isActive: route().current('admin.websites.configs.index'),
                                        access: isSuperAdmin,
                                    },
                                    {
                                        title: t('common:labels.settings'),
                                        url: route('admin.settings.edit'),
                                        isActive: route().current('admin.settings.*'),
                                        access: isSuperAdmin,
                                    },
                                ],
                            },
                        ]}
                        orders={[]}
                        deposits={[]}
                        services={[]}
                        supports={[]}
                    />
                ) : (
                    <NavMenu
                        general={[
                            { title: t('common:labels.dashboard'), routeName: 'guest.dashboard', icon: Store },
                            { title: t('common:labels.leaderboard'), routeName: 'user.leaderboard', icon: Trophy, auth: true },
                            { title: t('common:labels.affiliate'), routeName: 'user.affiliate.index', icon: Link03Icon, auth: true },
                            { title: t('common:labels.signin'), routeName: 'user.auth.signin', icon: UserRoundCheck, auth: false },
                            { title: t('common:labels.signup'), routeName: 'user.auth.signup', icon: UserRoundPlus, auth: false },
                            { title: t('common:labels.forgot-password'), routeName: 'user.auth.password.request', icon: UserRoundCog, auth: false },
                        ]}
                        orders={[
                            {
                                title: t('common:actions.create-item', {
                                    item: '',
                                }),
                                routeName: 'user.orders.create',
                                icon: ShoppingBagAddIcon,
                            },
                            { title: t('common:labels.list'), routeName: 'user.orders.index', icon: Database },
                            { title: t('common:labels.refill'), routeName: 'user.orders.refills.index', icon: RotateCcw },
                        ]}
                        deposits={[
                            {
                                title: t('common:actions.create-item', {
                                    item: '',
                                }),
                                routeName: 'user.deposits.create',
                                icon: WalletAdd01Icon,
                            },
                            { title: t('common:labels.list'), routeName: 'user.deposits.index', icon: Database },
                        ]}
                        services={[
                            { title: t('common:labels.services'), routeName: 'guest.services.index', icon: Tags },
                            { title: t('common:labels.update'), routeName: 'guest.services.updates', icon: Info },
                            { title: t('common:labels.monitoring'), routeName: 'guest.services.monitoring', icon: Activity },
                        ]}
                        supports={[
                            { title: t('common:labels.contact-us'), routeName: 'guest.services.index', icon: CustomerService02Icon, contact: true },
                            { title: t('common:labels.tickets'), routeName: 'user.tickets.index', icon: MailLove01Icon, auth: true },
                            { title: t('common:labels.api-docs'), routeName: 'user.api_docs', icon: ApiIcon, auth: true },
                        ]}
                    />
                )}
            </SidebarContent>
            <SidebarFooter>
                {auth.user && (
                    <NavUser
                        user={{
                            name: auth?.user?.full_name ?? 'Jhon Delton',
                            email: auth?.user?.email ?? 'business@jhonroot.dev',
                            group: auth?.user?.group?.name ?? 'Member',
                            avatar: '/assets/images/avatar.avif',
                        }}
                    />
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
