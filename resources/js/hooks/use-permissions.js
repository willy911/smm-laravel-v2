import { usePage } from '@inertiajs/react';
import { get } from 'lodash';
import { useMemo } from 'react';

export default function usePermissions() {
    const { auth } = usePage().props;

    const roles = useMemo(() => {
        return auth?.admin?.group?.roles ?? {};
    }, [auth]);

    const isSuperAdmin = useMemo(() => {
        return Boolean(auth?.admin?.group?.is_primary);
    }, [auth]);

    const hasRole = (path) => {
        if (isSuperAdmin) {
            return true;
        }

        return Boolean(get(roles, path, false));
    };

    const hasAnyRole = (permissions = []) => {
        if (isSuperAdmin) {
            return true;
        }

        return permissions.some((permission) => hasRole(permission));
    };

    const hasAllRoles = (permissions = []) => {
        if (isSuperAdmin) {
            return true;
        }

        return permissions.every((permission) => hasRole(permission));
    };

    return {
        roles,
        isSuperAdmin,
        hasRole,
        hasAnyRole,
        hasAllRoles,
    };
}
