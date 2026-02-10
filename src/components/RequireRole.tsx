import {useAuthentication, UserRole} from "../providers/AuthenticationProvider.tsx";
import {ReactNode} from "react";

type RequireRoleProps = {
    requiredRoles: UserRole[] | UserRole
    children: ReactNode;
}

export function RequireRole({requiredRoles, children}: RequireRoleProps)
{
    const {currentUser} = useAuthentication();
    if (!currentUser?.role) return null;

    return doesUserHaveRequiredRole(currentUser.role, requiredRoles) ? <>{children}</> : null;
}

export function doesUserHaveRequiredRole(user: UserRole, requiredRoles: UserRole[] | UserRole, includeAdmin: boolean = true): boolean
{
    if (!user) return false;
    return (user === UserRole.Admin && includeAdmin) || (Array.isArray(requiredRoles) ? requiredRoles.includes(user) : requiredRoles === user);
}