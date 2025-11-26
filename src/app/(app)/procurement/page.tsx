"use client";

import { useState } from "react";
import { PlusCircle, File, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/app/page-header";
import { ProtectedPage } from "@/components/app/protected-page";
import { useAppContext } from "@/hooks/use-app-context";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseOrder, PurchaseOrderItem } from "@/lib/definitions";

export default function ProcurementPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [newPOItems, setNewPOItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);

  const handleCreatePO = () => {
    if (!selectedSupplier || newPOItems.length === 0) {
      toast({ title: 'Incomplete PO', description: 'Please select a supplier and add items.', variant: 'destructive' });
      return;
    }
    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      supplierId: selectedSupplier,
      items: newPOItems,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PURCHASE_ORDER', payload: newPO });
    toast({ title: 'Purchase Order Created', description: `${newPO.id} has been saved as a draft.` });
    setNewPOItems([]);
    setSelectedSupplier(null);
  };
  
  const addPOItem = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    const existingItem = newPOItems.find(item => item.productId === productId);
    if (!existingItem) {
        setNewPOItems([...newPOItems, { productId, quantity: 1, costPrice: product.costPrice }]);
    }
  };

  const updatePOItemQuantity = (productId: string, quantity: number) => {
      setNewPOItems(newPOItems.map(item => item.productId === productId ? {...item, quantity: quantity} : item).filter(item => item.quantity > 0));
  };
  
  const handleMarkAsOrdered = (poId: string) => {
      dispatch({ type: 'UPDATE_PURCHASE_ORDER_STATUS', payload: { id: poId, status: 'Ordered' } });
      toast({ title: 'PO Status Updated', description: `${poId} has been marked as Ordered.` });
  };
  
  const handleReceiveStock = (po: PurchaseOrder) => {
      dispatch({ type: 'ADD_GRN', payload: {
          id: `GRN-${Date.now()}`,
          poId: po.id,
          receivedItems: po.items,
          receivedAt: new Date().toISOString(),
          receivedBy: 1, // Mock user
      }});
      
      po.items.forEach(item => {
          const product = state.products.find(p => p.id === item.productId);
          if (product) {
              dispatch({ type: 'UPDATE_PRODUCT_STOCK', payload: { productId: item.productId, newStock: product.stock + item.quantity }});
          }
      });
      
      dispatch({ type: 'UPDATE_PURCHASE_ORDER_STATUS', payload: { id: po.id, status: 'Received' } });
      
      toast({ title: 'Stock Received', description: `Stock for ${po.id} has been added to inventory.` });
  };

  return (
    <ProtectedPage permission="procurement.manage">
      <PageHeader title="Procurement" description="Manage purchase orders and goods receipts." />
      <Tabs defaultValue="lpo">
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="lpo">Purchase Orders (LPO)</TabsTrigger>
                <TabsTrigger value="grn">Goods Receipt Notes (GRN)</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-7 gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create LPO</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader><DialogTitle>Create Local Purchase Order</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="supplier">Supplier</Label>
                                <Select onValueChange={(val) => setSelectedSupplier(Number(val))}>
                                    <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                                    <SelectContent>
                                        {state.suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label>Add Products</Label>
                                <Select onValueChange={addPOItem}>
                                    <SelectTrigger><SelectValue placeholder="Select a product to add" /></SelectTrigger>
                                    <SelectContent>
                                        {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Card>
                                <CardContent className="p-2">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Quantity</TableHead><TableHead>Cost</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {newPOItems.map(item => {
                                                const product = state.products.find(p => p.id === item.productId);
                                                return <TableRow key={item.productId}><TableCell>{product?.name}</TableCell><TableCell><Input type="number" value={item.quantity} onChange={e => updatePOItemQuantity(item.productId, Number(e.target.value))} className="w-20" /></TableCell><TableCell>${(item.quantity * item.costPrice).toFixed(2)}</TableCell></TableRow>;
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                        <DialogFooter>
                            <DialogTrigger asChild><Button onClick={handleCreatePO}>Create PO</Button></DialogTrigger>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <TabsContent value="lpo">
          <Card>
            <CardHeader><CardTitle>Local Purchase Orders</CardTitle><CardDescription>Manage all your local purchase orders.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>PO ID</TableHead><TableHead>Supplier</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {state.purchaseOrders.map(po => {
                      const supplier = state.suppliers.find(s => s.id === po.supplierId);
                      return (
                          <TableRow key={po.id}>
                              <TableCell className="font-semibold">{po.id}</TableCell>
                              <TableCell>{supplier?.name}</TableCell>
                              <TableCell><Badge variant={po.status === 'Received' ? 'default' : po.status === 'Ordered' ? 'secondary' : 'outline'}>{po.status}</Badge></TableCell>
                              <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                  {po.status === 'Draft' && <Button size="sm" onClick={() => handleMarkAsOrdered(po.id)}>Mark as Ordered</Button>}
                                  {po.status === 'Ordered' && <Button size="sm" onClick={() => handleReceiveStock(po)}>Receive Stock</Button>}
                                  {po.status === 'Received' && <span className="text-sm text-muted-foreground">Completed</span>}
                              </TableCell>
                          </TableRow>
                      );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="grn">
            <Card>
                <CardHeader><CardTitle>Goods Receipt Notes</CardTitle><CardDescription>History of all received goods.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>GRN ID</TableHead><TableHead>PO ID</TableHead><TableHead>Received Date</TableHead><TableHead>Items</TableHead></TableRow></TableHeader>
                        <TableBody>
                           {state.goodsReceiptNotes.map(grn => (
                               <TableRow key={grn.id}>
                                   <TableCell className="font-semibold">{grn.id}</TableCell>
                                   <TableCell>{grn.poId}</TableCell>
                                   <TableCell>{new Date(grn.receivedAt).toLocaleDateString()}</TableCell>
                                   <TableCell>{grn.receivedItems.length} types, {grn.receivedItems.reduce((acc, item) => acc + item.quantity, 0)} units</TableCell>
                               </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </ProtectedPage>
  );
}
