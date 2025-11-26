
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
import type { PurchaseOrder, PurchaseOrderItem, GoodsReceiptNote } from "@/lib/definitions";

export default function ProcurementPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [newPOItems, setNewPOItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | GoodsReceiptNote | null>(null);

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
  
  const handleMarkAsOrdered = (e: React.MouseEvent, poId: string) => {
      e.stopPropagation();
      dispatch({ type: 'UPDATE_PURCHASE_ORDER_STATUS', payload: { id: poId, status: 'Ordered' } });
      toast({ title: 'PO Status Updated', description: `${poId} has been marked as Ordered.` });
  };
  
  const handleReceiveStock = (e: React.MouseEvent, po: PurchaseOrder) => {
      e.stopPropagation();
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
  
  const handleViewDetails = (order: PurchaseOrder | GoodsReceiptNote) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const isPurchaseOrder = (order: any): order is PurchaseOrder => 'supplierId' in order;

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
                          <TableRow key={po.id} onClick={() => handleViewDetails(po)} className="cursor-pointer">
                              <TableCell className="font-semibold">{po.id}</TableCell>
                              <TableCell>{supplier?.name}</TableCell>
                              <TableCell><Badge variant={po.status === 'Received' ? 'default' : po.status === 'Ordered' ? 'secondary' : 'outline'}>{po.status}</Badge></TableCell>
                              <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                  {po.status === 'Draft' && <Button size="sm" onClick={(e) => handleMarkAsOrdered(e, po.id)}>Mark as Ordered</Button>}
                                  {po.status === 'Ordered' && <Button size="sm" onClick={(e) => handleReceiveStock(e, po)}>Receive Stock</Button>}
                                  {po.status === 'Received' && <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(po);}}><Eye className="h-4 w-4" /></Button>}
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
                        <TableHeader><TableRow><TableHead>GRN ID</TableHead><TableHead>PO ID</TableHead><TableHead>Received Date</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                           {state.goodsReceiptNotes.map(grn => (
                               <TableRow key={grn.id} onClick={() => handleViewDetails(grn)} className="cursor-pointer">
                                   <TableCell className="font-semibold">{grn.id}</TableCell>
                                   <TableCell>{grn.poId}</TableCell>
                                   <TableCell>{new Date(grn.receivedAt).toLocaleDateString()}</TableCell>
                                   <TableCell>{grn.receivedItems.length} types, {grn.receivedItems.reduce((acc, item) => acc + item.quantity, 0)} units</TableCell>
                                   <TableCell className="text-right">
                                     <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(grn);}}><Eye className="h-4 w-4" /></Button>
                                   </TableCell>
                               </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            {selectedOrder && (
              <DialogDescription>
                {isPurchaseOrder(selectedOrder) ? `Details for Purchase Order ${selectedOrder.id}` : `Details for Goods Receipt Note ${selectedOrder.id}`}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              {isPurchaseOrder(selectedOrder) ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Supplier</Label>
                    <div className="col-span-3 font-medium">{state.suppliers.find(s => s.id === selectedOrder.supplierId)?.name}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <div className="col-span-3"><Badge variant={selectedOrder.status === 'Received' ? 'default' : selectedOrder.status === 'Ordered' ? 'secondary' : 'outline'}>{selectedOrder.status}</Badge></div>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Created</Label>
                    <div className="col-span-3">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  </div>
                </>
              ) : (
                 <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">PO ID</Label>
                    <div className="col-span-3 font-medium">{selectedOrder.poId}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Received By</Label>
                    <div className="col-span-3">{state.users.find(u => u.id === selectedOrder.receivedBy)?.username}</div>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Received At</Label>
                    <div className="col-span-3">{new Date(selectedOrder.receivedAt).toLocaleString()}</div>
                  </div>
                </>
              )}
              <Card>
                <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isPurchaseOrder(selectedOrder) ? selectedOrder.items : selectedOrder.receivedItems).map(item => {
                        const product = state.products.find(p => p.id === item.productId);
                        return (
                          <TableRow key={item.productId}>
                            <TableCell>{product?.name}</TableCell>
                            <TableCell>{item.productId}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.costPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${(item.quantity * item.costPrice).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  );
}
