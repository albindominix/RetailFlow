"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppSidebar } from '@/components/app/sidebar';
import { AppHeader } from '@/components/app/header';
import { useAppContext } from '@/hooks/use-app-context';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!state.role) {
      const storedRole = localStorage.getItem("retail-flow-role");
      if (!storedRole) {
        router.replace('/');
      }
    }
  }, [state.role, router]);

  if (!state.role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="text-lg">Loading your workspace...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <AppHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
