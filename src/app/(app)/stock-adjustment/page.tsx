"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { PageHeader } from "@/components/app/page-header";
import { ProtectedPage } from "@/components/app/protected-page";
import { useAppContext } from "@/hooks/use-app-context";
import { useToast } from "@/hooks/use-toast";
import type { StockAdjustment } from "@/lib/definitions";
import { recommendStockAdjustmentReason } from "@/ai/flows/stock-adjustment-reason-recommendation";

export default function StockAdjustmentPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleCreateAdjustment = () => {
    if (!selectedProduct || quantity === 0) {
      toast({ title: 'Invalid Adjustment', description: 'Please select a product and specify a quantity.', variant: 'destructive' });
      return;
    }
    const product = state.products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newAdjustment: StockAdjustment = {
      id: `ADJ-${Date.now()}`,
      productId: selectedProduct,
      quantityChange: quantity,
      reason: reason || 'Manual Adjustment',
      timestamp: new Date().toISOString(),
      userId: 1, // Mock user
    };
    
    dispatch({ type: 'ADD_STOCK_ADJUSTMENT', payload: newAdjustment });
    dispatch({ type: 'UPDATE_PRODUCT_STOCK', payload: { productId: selectedProduct, newStock: product.stock + quantity } });

    toast({ title: 'Stock Adjusted', description: `Stock for ${product.name} changed by ${quantity}.` });

    setSelectedProduct('');
    setQuantity(0);
    setReason('');
  };

  const handleGetAiSuggestion = async () => {
      if (!selectedProduct) {
        toast({ title: 'Product not selected', description: 'Please select a product to get an AI suggestion.', variant: 'destructive' });
        return;
      }
      setIsAiLoading(true);
      try {
        const product = state.products.find(p => p.id === selectedProduct);
        const historicalData = JSON.stringify(state.stockAdjustments.filter(adj => adj.productId === selectedProduct));
        const recommendation = await recommendStockAdjustmentReason({
            productName: product?.name || '',
            historicalData: historicalData,
        });
        setReason(recommendation.reason);
        toast({ title: 'AI Suggestion Received', description: `Confidence: ${(recommendation.confidence * 100).toFixed(0)}%` });
      } catch (error) {
          toast({ title: 'AI Suggestion Failed', description: 'Could not get a suggestion at this time.', variant: 'destructive' });
      } finally {
          setIsAiLoading(false);
      }
  };

  return (
    <ProtectedPage permission="stock_adjustment.create">
      <PageHeader title="Stock Adjustments" description="Manually adjust stock levels for products.">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">New Adjustment</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Stock Adjustment</DialogTitle>
              <DialogDescription>Adjust stock for a product due to spoilage, theft, or other reasons.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Product</Label>
                <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                  <SelectContent>
                    {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity Change</Label>
                <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 0)} placeholder="e.g., -5 or 10" />
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="reason">Reason</Label>
                    {/* <Button variant="ghost" size="sm" onClick={handleGetAiSuggestion} disabled={isAiLoading}>
                        {isAiLoading ? 'Getting suggestion...' : 'Get AI Suggestion'}
                    </Button> */}
                </div>
                <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Spoilage, Found in warehouse" />
              </div>
            </div>
            <DialogFooter>
              <DialogTrigger asChild><Button onClick={handleCreateAdjustment}>Create Adjustment</Button></DialogTrigger>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
          <CardDescription>View a log of all manual stock adjustments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.stockAdjustments.map(adj => {
                const product = state.products.find(p => p.id === adj.productId);
                const user = state.users.find(u => u.id === adj.userId);
                return (
                  <TableRow key={adj.id}>
                    <TableCell>{product?.name}</TableCell>
                    <TableCell className={adj.quantityChange > 0 ? 'text-green-600' : 'text-destructive'}>{adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}</TableCell>
                    <TableCell>{adj.reason}</TableCell>
                    <TableCell>{new Date(adj.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{user?.username}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ProtectedPage>
  );
}
