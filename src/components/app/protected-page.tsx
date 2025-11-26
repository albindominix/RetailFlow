"use client";

import { useAccessControl } from "@/hooks/use-access-control";
import type { Permission } from "@/lib/permissions";
import { AccessDenied } from "@/components/app/access-denied";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";

export function ProtectedPage({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { canAccess, isLoading } = useAccessControl();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
             <Loader2 className="h-6 w-6 animate-spin text-primary" />
             <p>Checking permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccess(permission)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
