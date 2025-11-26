"use client";

import { useMemo } from 'react';
import { DollarSign, Landmark, ReceiptText, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from 'recharts';

import { PageHeader } from '@/components/app/page-header';
import { ProtectedPage } from '@/components/app/protected-page';
import { useAppContext } from '@/hooks/use-app-context';
import { useAccessControl } from '@/hooks/use-access-control';

const chartData = [
  { month: "January", sales: 186, profit: 80 },
  { month: "February", sales: 305, profit: 200 },
  { month: "March", sales: 237, profit: 120 },
  { month: "April", sales: 73, profit: 190 },
  { month: "May", sales: 209, profit: 130 },
  { month: "June", sales: 214, profit: 140 },
];
const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  profit: { label: "Profit", color: "hsl(var(--chart-2))" },
};

export default function ReportsPage() {
  const { state } = useAppContext();
  const { canAccess } = useAccessControl();
  const canViewCosts = canAccess('reports.view_costs');

  const reportData = useMemo(() => {
    const totalSales = state.sales.reduce((sum, sale) => sum + sale.total, 0);
    
    let totalCost = 0;
    if (canViewCosts) {
      totalCost = state.sales.reduce((sum, sale) => {
        const saleCost = sale.items.reduce((itemSum, item) => {
          const product = state.products.find(p => p.id === item.productId);
          return itemSum + (product?.costPrice || 0) * item.quantity;
        }, 0);
        return sum + saleCost;
      }, 0);
    }

    const totalProfit = totalSales - totalCost;
    const totalTax = totalSales * 0.05; // Assuming a flat 5% tax for demo

    return { totalSales, totalCost, totalProfit, totalTax };
  }, [state.sales, state.products, canViewCosts]);
  
  return (
    <ProtectedPage permission="reports.view_financials">
      <PageHeader title="Reports" description="View financial reports and sales analytics." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        {canViewCosts && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+18.1% from last month</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalTax.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Based on a 5% tax rate</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Sales & Profit Overview</CardTitle>
                <CardDescription>Monthly sales and profit data.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <RechartsBarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                    {canViewCosts && <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />}
                  </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
}
