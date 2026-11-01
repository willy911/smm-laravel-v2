import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { cn, toHTML } from '@/lib/utils';
import axios from 'axios';
import { Alert01Icon } from 'hugeicons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const getRoleGroups = (t) => [
    {
        key: 'leaderboard',
        label: t('common:labels.leaderboard'),

        menus: [
            {
                key: 'leaderboard',
                label: t('common:labels.leaderboard'),
                permissions: ['access'],
            },
        ],
    },

    {
        key: 'user',
        label: t('common:labels.users'),

        menus: [
            {
                key: 'self',
                label: t('common:labels.list'),
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'group',
                label: t('common:labels.group'),
                permissions: ['access', 'create', 'update', 'delete'],
            },
        ],
    },

    {
        key: 'service',
        label: t('common:labels.services'),

        menus: [
            {
                key: 'self',
                label: t('common:labels.list'),
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'provider',
                label: t('admin/common:labels.provider'),
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'category',
                label: `${t('common:labels.category')} - ${t('common:labels.list')}`,
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'category_group',
                label: `${t('common:labels.category')} - ${t('common:labels.group')}`,
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'custom_price',
                label: t('common:labels.custom-price'),
                permissions: ['access', 'create', 'update', 'delete'],
            },
        ],
    },

    {
        key: 'order',
        label: t('common:labels.orders'),

        menus: [
            {
                key: 'self',
                label: t('common:labels.list'),
                permissions: ['access', 'update'],
            },

            {
                key: 'refill',
                label: t('common:labels.refill'),
                permissions: ['access', 'update'],
            },
        ],
    },

    {
        key: 'deposit',
        label: t('common:labels.deposits'),

        menus: [
            {
                key: 'deposit',
                label: t('common:labels.deposits'),
                permissions: ['access', 'create', 'update'],
            },
        ],
    },

    {
        key: 'ticket',
        label: t('common:labels.tickets'),

        menus: [
            {
                key: 'ticket',
                label: t('common:labels.tickets'),
                permissions: ['access', 'update'],
            },
        ],
    },

    {
        key: 'payment_method',
        label: t('common:labels.payment-methods'),

        menus: [
            {
                key: 'payment_method',
                label: t('common:labels.payment-methods'),
                permissions: ['access', 'create', 'update', 'delete'],
            },
        ],
    },

    {
        key: 'log',
        label: t('common:labels.logs'),

        menus: [
            {
                key: 'user',
                label: t('common:labels.user'),

                children: [
                    {
                        key: 'signin',
                        label: t('common:labels.signin'),
                        permissions: ['access'],
                    },

                    {
                        key: 'signup',
                        label: t('common:labels.signup'),
                        permissions: ['access'],
                    },

                    {
                        key: 'activity',
                        label: t('common:labels.activity'),
                        permissions: ['access'],
                    },

                    {
                        key: 'balance',
                        label: t('common:labels.balance'),
                        permissions: ['access'],
                    },
                ],
            },

            {
                key: 'admin',
                label: t('admin/common:labels.admin'),

                children: [
                    {
                        key: 'signin',
                        label: t('common:labels.signin'),
                        permissions: ['access'],
                    },

                    {
                        key: 'activity',
                        label: t('common:labels.activity'),
                        permissions: ['access'],
                    },
                ],
            },
        ],
    },

    {
        key: 'site',
        label: t('common:labels.site'),

        menus: [
            {
                key: 'blog',
                label: t('common:labels.blog'),
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'news',
                label: t('common:labels.news'),
                permissions: ['access', 'create', 'update', 'delete'],
            },

            {
                key: 'sitemap',
                label: t('common:labels.sitemap'),
                permissions: ['access', 'create', 'update', 'delete'],
            },
        ],
    },
];

const generateRoles = (roleGroups) => {
    const roles = {};

    roleGroups.forEach((group) => {
        roles[group.key] = {};

        group.menus.forEach((menu) => {
            /*
            |--------------------------------------------------------------------------
            | Has children
            |--------------------------------------------------------------------------
            */

            if (menu.children) {
                roles[group.key][menu.key] = {};

                menu.children.forEach((child) => {
                    roles[group.key][menu.key][child.key] = {};

                    child.permissions.forEach((permission) => {
                        roles[group.key][menu.key][child.key][permission] = false;
                    });
                });

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Root permissions
            |--------------------------------------------------------------------------
            */

            if (menu.key === 'self') {
                menu.permissions.forEach((permission) => {
                    roles[group.key][permission] = false;
                });

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Single menu
            |--------------------------------------------------------------------------
            */

            if (group.menus.length === 1 && menu.key === group.key) {
                menu.permissions.forEach((permission) => {
                    roles[group.key][permission] = false;
                });

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Nested permissions
            |--------------------------------------------------------------------------
            */

            roles[group.key][menu.key] = {};

            menu.permissions.forEach((permission) => {
                roles[group.key][menu.key][permission] = false;
            });
        });
    });

    return roles;
};

export default function Form({ pageProps, isCreateDialogOpened, setIsCreateDialogOpened, fetchData, tableStateRef, target, setTarget }) {
    const { t, i18n } = useTranslation(['admin/common']);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequestCloseDialogOpened, setIsRequestCloseDialogOpened] = useState(false);
    const ROLE_GROUPS = useMemo(() => getRoleGroups(t), [t]);

    const isUpdate = useMemo(() => {
        return Object.keys(target).length > 0 && target.id;
    }, [target]);

    const method = isUpdate ? 'put' : 'post';

    const form = useForm(
        method,
        isUpdate
            ? route('admin.admins.groups.update', {
                  target: target.id,
              })
            : route('admin.admins.groups.store'),
        {
            admin: {
                group: {
                    name: target.name ?? '',
                },
            },

            roles: target.roles ?? generateRoles(ROLE_GROUPS),
        },
    );

    form.setValidationTimeout(3000);

    const initialData = useMemo(
        () => ({
            admin: {
                group: {
                    name: target.name ?? '',
                },
            },

            roles: target.roles ?? generateRoles(ROLE_GROUPS),
        }),
        [target],
    );

    const hasUnsavedChanges = useCallback(() => {
        return (
            JSON.stringify(form.data.admin) !== JSON.stringify(initialData.admin) ||
            JSON.stringify(form.data.roles) !== JSON.stringify(initialData.roles)
        );
    }, [form.data, initialData]);

    const handleRequestClose = useCallback(() => {
        if (hasUnsavedChanges()) {
            setIsRequestCloseDialogOpened(true);

            return;
        }
        form.reset();
        form.setErrors([]);
        setIsCreateDialogOpened(false);
    }, [hasUnsavedChanges, form, setIsCreateDialogOpened]);

    const getPermissions = (roles, groupKey, menuKey, childKey = null) => {
        /*
        |--------------------------------------------------------------------------
        | Root permissions
        |--------------------------------------------------------------------------
        */

        if (menuKey === 'self' || menuKey === groupKey) {
            return roles?.[groupKey] ?? {};
        }

        /*
        |--------------------------------------------------------------------------
        | Children permissions
        |--------------------------------------------------------------------------
        */

        if (childKey) {
            return roles?.[groupKey]?.[menuKey]?.[childKey] ?? {};
        }

        /*
        |--------------------------------------------------------------------------
        | Nested permissions
        |--------------------------------------------------------------------------
        */

        return roles?.[groupKey]?.[menuKey] ?? {};
    };

    const setNestedPermissions = (roles, groupKey, menuKey, permissions, childKey = null) => {
        const updatedRoles = structuredClone(roles);

        /*
        |--------------------------------------------------------------------------
        | Root permissions
        |--------------------------------------------------------------------------
        */

        if (menuKey === 'self' || menuKey === groupKey) {
            updatedRoles[groupKey] = {
                ...updatedRoles[groupKey],
                ...permissions,
            };

            return updatedRoles;
        }

        /*
        |--------------------------------------------------------------------------
        | Child permissions
        |--------------------------------------------------------------------------
        */

        if (childKey) {
            updatedRoles[groupKey] = {
                ...updatedRoles[groupKey],

                [menuKey]: {
                    ...updatedRoles[groupKey]?.[menuKey],

                    [childKey]: {
                        ...updatedRoles[groupKey]?.[menuKey]?.[childKey],
                        ...permissions,
                    },
                },
            };

            return updatedRoles;
        }

        /*
        |--------------------------------------------------------------------------
        | Nested permissions
        |--------------------------------------------------------------------------
        */

        updatedRoles[groupKey] = {
            ...updatedRoles[groupKey],

            [menuKey]: {
                ...updatedRoles[groupKey]?.[menuKey],
                ...permissions,
            },
        };

        return updatedRoles;
    };

    const handlePermissionChange = (groupKey, menuKey, permission, checked, childKey = null) => {
        form.setData((data) => {
            const currentPermissions = {
                ...getPermissions(data.roles, groupKey, menuKey, childKey),
            };

            /*
            |--------------------------------------------------------------------------
            | Access unchecked
            |--------------------------------------------------------------------------
            */

            if (permission === 'access' && !checked) {
                Object.keys(currentPermissions).forEach((key) => {
                    currentPermissions[key] = false;
                });
            } else {
                currentPermissions[permission] = checked;

                /*
                |--------------------------------------------------------------------------
                | Auto enable access
                |--------------------------------------------------------------------------
                */

                if (permission !== 'access' && checked) {
                    currentPermissions.access = true;
                }
            }

            return {
                ...data,

                roles: setNestedPermissions(data.roles, groupKey, menuKey, currentPermissions, childKey),
            };
        });
    };

    const isAllPermissionsChecked = (groupKey, menuKey, permissions, childKey = null) => {
        const currentPermissions = getPermissions(form.data.roles, groupKey, menuKey, childKey);

        return permissions.every((permission) => {
            return currentPermissions?.[permission];
        });
    };

    const handleToggleAllPermissions = (groupKey, menuKey, permissions, checked, childKey = null) => {
        form.setData((data) => {
            const updatedPermissions = {};

            permissions.forEach((permission) => {
                updatedPermissions[permission] = checked;
            });

            /*
            |--------------------------------------------------------------------------
            | If access unchecked
            |--------------------------------------------------------------------------
            */

            if (!checked) {
                permissions.forEach((permission) => {
                    updatedPermissions[permission] = false;
                });
            }

            return {
                ...data,

                roles: setNestedPermissions(data.roles, groupKey, menuKey, updatedPermissions, childKey),
            };
        });
    };

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setIsLoading(true);

            const url = isUpdate ? route('admin.admins.groups.update', { target: target.id }) : route('admin.admins.groups.store');

            axios[method](url, form.data)
                .then((response) => {
                    form.reset();
                    form.setErrors([]);
                    setTarget({});
                    setIsCreateDialogOpened(false);
                    toast({
                        variant: 'success',
                        description: toHTML(response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                    fetchData(tableStateRef.current);
                })
                .catch((error) => {
                    form.setErrors(error.response.data.errors);
                    toast({
                        variant: 'error',
                        description: toHTML(error.response?.data?.message ?? 'Terjadi kesalahan, silahkan muat ulang halaman ini.'),
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [isUpdate, target?.id, method, form, setTarget, setIsCreateDialogOpened, fetchData, tableStateRef],
    );

    return (
        <>
            <Dialog open={isCreateDialogOpened} onOpenChange={handleRequestClose}>
                <DialogContent className="sm:max-w-4xl">
                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        <DialogHeader>
                            <DialogTitle>
                                {target.id
                                    ? `${t('admin/common:actions.edit-item', {
                                          item: t('common:labels.group'),
                                      })} #${target.id}`
                                    : t('admin/common:actions.create-item', {
                                          item: t('common:labels.group'),
                                      })}
                            </DialogTitle>

                            <DialogDescription />
                        </DialogHeader>

                        <div className="grid gap-2">
                            <Label isRequired>{t('common:labels.name')}</Label>

                            <Input
                                value={form.data.admin.group.name}
                                onChange={(e) => {
                                    form.setData((data) => ({
                                        ...data,
                                        admin: {
                                            ...data.admin,
                                            group: {
                                                ...data.admin.group,
                                                name: e.target.value,
                                            },
                                        },
                                    }));
                                }}
                                onBlur={() => form.validate('admin.group.name')}
                                aria-invalid={form.invalid('admin.group.name')}
                            />
                            {form.invalid('admin.group.name') && <InputError message={form.errors['admin.group.name']} />}
                        </div>
                        <div className="space-y-3">
                            <Label isRequired>Roles & Permissions</Label>

                            <TabGroup>
                                <TabList className="hide-scrollbar -mb-px grid w-full transform grid-cols-2 items-center gap-2 overflow-auto border-b pb-2 duration-300 ease-in-out sm:grid-cols-3 md:gap-2 lg:grid-cols-4">
                                    {ROLE_GROUPS.map((group) => (
                                        <Tab
                                            key={group.key}
                                            className={({ selected }) =>
                                                cn(
                                                    'rounded-lg px-4 py-2 text-sm font-medium transition outline-none',
                                                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70',
                                                )
                                            }
                                        >
                                            {group.label}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels className="mt-4">
                                    {ROLE_GROUPS.map((group) => (
                                        <TabPanel key={group.key} className="space-y-4">
                                            {group.menus.map((menu) => {
                                                /*
                        |--------------------------------------------------------------------------
                        | Menu With Children
                        |--------------------------------------------------------------------------
                        */

                                                if (menu.children) {
                                                    return (
                                                        <div key={menu.key} className="space-y-4">
                                                            <div>
                                                                <h2 className="text-lg font-semibold">{menu.label}</h2>
                                                            </div>

                                                            {menu.children.map((child) => (
                                                                <div key={child.key} className="rounded-xl border p-4">
                                                                    <div className="mb-4 flex items-center justify-between gap-4">
                                                                        <h3 className="font-semibold">{child.label}</h3>

                                                                        <div className="flex items-center gap-2">
                                                                            <Checkbox
                                                                                id={`${group.key}.${menu.key}.${child.key}.all`}
                                                                                checked={isAllPermissionsChecked(
                                                                                    group.key,
                                                                                    menu.key,
                                                                                    child.permissions,
                                                                                    child.key,
                                                                                )}
                                                                                onCheckedChange={(checked) => {
                                                                                    handleToggleAllPermissions(
                                                                                        group.key,
                                                                                        menu.key,
                                                                                        child.permissions,
                                                                                        checked,
                                                                                        child.key,
                                                                                    );
                                                                                }}
                                                                            />

                                                                            <label
                                                                                htmlFor={`${group.key}.${menu.key}.${child.key}.all`}
                                                                                className="text-sm font-medium"
                                                                            >
                                                                                Select All
                                                                            </label>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                                                        {child.permissions.map((permission) => (
                                                                            <div key={permission} className="flex items-center gap-2">
                                                                                <Checkbox
                                                                                    id={`${group.key}.${menu.key}.${child.key}.${permission}`}
                                                                                    checked={
                                                                                        getPermissions(
                                                                                            form.data.roles,
                                                                                            group.key,
                                                                                            menu.key,
                                                                                            child.key,
                                                                                        )?.[permission] ?? false
                                                                                    }
                                                                                    onCheckedChange={(checked) => {
                                                                                        handlePermissionChange(
                                                                                            group.key,
                                                                                            menu.key,
                                                                                            permission,
                                                                                            checked,
                                                                                            child.key,
                                                                                        );
                                                                                    }}
                                                                                />

                                                                                <label
                                                                                    htmlFor={`${group.key}.${menu.key}.${child.key}.${permission}`}
                                                                                    className="text-sm font-medium capitalize"
                                                                                >
                                                                                    {permission}
                                                                                </label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                }

                                                /*
                        |--------------------------------------------------------------------------
                        | Normal Menu
                        |--------------------------------------------------------------------------
                        */

                                                return (
                                                    <div key={menu.key} className="rounded-xl border p-4">
                                                        <div className="mb-4 flex items-center justify-between gap-4">
                                                            <h3 className="font-semibold">{menu.label}</h3>

                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`${group.key}.${menu.key}.all`}
                                                                    checked={isAllPermissionsChecked(group.key, menu.key, menu.permissions)}
                                                                    onCheckedChange={(checked) => {
                                                                        handleToggleAllPermissions(group.key, menu.key, menu.permissions, checked);
                                                                    }}
                                                                />

                                                                <label htmlFor={`${group.key}.${menu.key}.all`} className="text-sm font-medium">
                                                                    Select All
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                                            {menu.permissions.map((permission) => (
                                                                <div key={permission} className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`${group.key}.${menu.key}.${permission}`}
                                                                        checked={
                                                                            getPermissions(form.data.roles, group.key, menu.key)?.[permission] ??
                                                                            false
                                                                        }
                                                                        onCheckedChange={(checked) => {
                                                                            handlePermissionChange(group.key, menu.key, permission, checked);
                                                                        }}
                                                                    />

                                                                    <label
                                                                        htmlFor={`${group.key}.${menu.key}.${permission}`}
                                                                        className="text-sm font-medium capitalize"
                                                                    >
                                                                        {permission}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </TabGroup>
                        </div>

                        <DialogFooter>
                            <Button type="submit" className={cn('w-full')} disabled={isLoading} onClick={handleSubmit}>
                                {!isLoading ? t('common:actions.submit') : t('common:loading.please-wait')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isRequestCloseDialogOpened} onOpenChange={setIsRequestCloseDialogOpened}>
                <AlertDialogContent className="sm:max-w-md" isBlur>
                    <AlertDialogHeader className="text-left">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-md bg-yellow-100 p-1.5 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-900/40">
                                <Alert01Icon />
                            </div>
                            <div className="space-y-1">
                                <AlertDialogTitle className="text-base">{t('admin/common:dialog.unsaved.title')}</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                                    {toHTML(t('admin/common:dialog.unsaved.description'))}
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel>{t('admin/common:dialog.unsaved.cancel-button')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                form.reset();
                                form.setErrors([]);
                                setIsRequestCloseDialogOpened(false);
                                setTarget({});
                                setIsCreateDialogOpened(false);
                            }}
                        >
                            {t('admin/common:dialog.unsaved.confirm-button')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
