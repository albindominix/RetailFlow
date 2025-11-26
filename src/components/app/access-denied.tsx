"use client";
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function AccessDenied() {
    const router = useRouter();
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
}
