"use client";

import { useAppContext } from "./use-app-context";
import { permissions, type Permission } from "@/lib/permissions";

export const useAccessControl = () => {
  const { state } = useAppContext();
  const { role } = state;

  const canAccess = (permissionToCheck: Permission): boolean => {
    if (!role) {
      return false;
    }
    return permissions[role]?.includes(permissionToCheck) || false;
  };
  
  return { canAccess, role, isLoading: !role };
};
