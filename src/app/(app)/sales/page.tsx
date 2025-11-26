
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { PageHeader } from '@/components/app/page-header';
import { ProtectedPage } from '@/components/app/protected-page';
import { useAppContext } from '@/hooks/use-app-context';

export default function SalesPage() {
  const { state } = useAppContext();

  const getPaymentMethod = (sale: (typeof state.sales)[0]) => {
      const hasCash = sale.payment.cash > 0;
      const hasCard = sale.payment.card > 0;
      if (hasCash && hasCard) return 'Split';
      if (hasCash) return 'Cash';
      if (hasCard) return 'Card';
      return 'N/A';
  }

  return (
    <ProtectedPage permission="sales.view">
      <PageHeader title="Sales History" description="A log of all sales transactions." />
        <Card>
          <CardHeader>
            <CardTitle>All Sales</CardTitle>
            <CardDescription>A list of all completed and pending sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.sales.map((sale) => (
                  <TableRow key={sale.invoiceNumber}>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{new Date(sale.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{sale.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'Completed' ? 'default' : 'secondary'} className={sale.status === 'Pending Sync' ? 'bg-yellow-500' : ''}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPaymentMethod(sale)}</TableCell>
                    <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </ProtectedPage>
  );
}
