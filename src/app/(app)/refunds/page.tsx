"use client";

import { useState } from 'react';
import { Search, Hash, AlertTriangle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { PageHeader } from '@/components/app/page-header';
import { ProtectedPage } from '@/components/app/protected-page';
import { useAppContext } from '@/hooks/use-app-context';
import { useAccessControl } from '@/hooks/use-access-control';
import { useToast } from '@/hooks/use-toast';
import type { Sale } from '@/lib/definitions';

const REFUND_APPROVAL_LIMIT = 50;

export default function RefundsPage() {
  const { state } = useAppContext();
  const { canAccess } = useAccessControl();
  const { toast } = useToast();
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [foundSale, setFoundSale] = useState<Sale | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSearch = () => {
    const sale = state.sales.find(s => s.invoiceNumber === invoiceNumber);
    if (sale) {
      setFoundSale(sale);
      setSelectedItems(sale.items.map(i => i.productId));
    } else {
      setFoundSale(null);
      toast({
        title: 'Invoice not found',
        description: `No sale record found for invoice ${invoiceNumber}.`,
        variant: 'destructive',
      });
    }
  };

  const refundTotal = foundSale
    ? foundSale.items
        .filter(item => selectedItems.includes(item.productId))
        .reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    : 0;

  const requiresApproval = refundTotal > REFUND_APPROVAL_LIMIT;
  const canApprove = canAccess('pos.approve_high_value_refund');
  const refundDisabled = requiresApproval && !canApprove;

  const processRefund = () => {
    if (refundDisabled) return;
    toast({
      title: 'Refund Processed (Simulated)',
      description: `Refund of $${refundTotal.toFixed(2)} for invoice ${foundSale?.invoiceNumber} has been recorded. Inventory updated.`,
    });
    setFoundSale(null);
    setInvoiceNumber('');
  };

  return (
    <ProtectedPage permission="pos.refunds">
      <PageHeader title="Refunds and Returns" description="Process customer refunds and returns." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Find Sale</CardTitle>
            <CardDescription>Enter an invoice number to find the original sale.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="INV-..."
                  className="pl-8"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {foundSale && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Invoice: {foundSale.invoiceNumber}</CardTitle>
              <CardDescription>Select items to return.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foundSale.items.map(item => {
                    const product = state.products.find(p => p.id === item.productId);
                    return (
                      <TableRow key={item.productId}>
                        <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="flex justify-end items-center gap-4">
                <div className="font-bold text-xl">
                  Refund Total: ${refundTotal.toFixed(2)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
                {requiresApproval && (
                    <div className="flex items-center gap-2 rounded-lg border p-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <div>
                            <p className="font-semibold">Manager Approval Required</p>
                            <p className="text-sm text-muted-foreground">Refund amount exceeds ${REFUND_APPROVAL_LIMIT}.</p>
                        </div>
                        {canApprove ? (
                           <Badge variant="default" className="ml-auto bg-green-500 hover:bg-green-600"><BadgeCheck className="mr-1 h-4 w-4"/> Approved</Badge>
                        ) : (
                           <Badge variant="destructive" className="ml-auto">Approval Needed</Badge>
                        )}
                    </div>
                )}
                <Button size="lg" onClick={processRefund} disabled={refundDisabled}>
                    Process Refund
                </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </ProtectedPage>
  );
}
