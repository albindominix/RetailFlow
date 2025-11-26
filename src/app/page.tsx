"use client";

import { useRouter } from "next/navigation";
import { Briefcase, User, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/hooks/use-app-context";
import type { Role } from "@/lib/definitions";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { setRole } = useAppContext();

  const handleRoleSelect = (role: Role) => {
    setRole(role);
    router.push("/pos");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <svg
              className="w-12 h-12 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 7L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 7L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 4.5L7 9.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to RetailFlow</CardTitle>
          <CardDescription>Select your role to start the demo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleRoleSelect("Cashier")}
            className="w-full justify-start text-lg py-6"
            size="lg"
          >
            <Briefcase className="mr-3 h-6 w-6" />
            Cashier
          </Button>
          <Button
            onClick={() => handleRoleSelect("Manager")}
            className="w-full justify-start text-lg py-6"
            size="lg"
          >
            <User className="mr-3 h-6 w-6" />
            Manager
          </Button>
          <Button
            onClick={() => handleRoleSelect("Owner")}
            className="w-full justify-start text-lg py-6"
            size="lg"
          >
            <Crown className="mr-3 h-6 w-6" />
            Owner
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
