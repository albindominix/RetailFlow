"use client";

import { useState, useMemo } from "react";
import {
  PlusCircle,
  Search,
  Users,
  CreditCard,
  DollarSign,
  ParkingSquare,
  History,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAppContext } from "@/hooks/use-app-context";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItem, Sale } from "@/lib/definitions";
import { ProtectedPage } from "@/components/app/protected-page";
import { PageHeader } from "@/components/app/page-header";
import Image from "next/image";

export default function PosPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [payment, setPayment] = useState({ cash: 0, card: 0 });
  const [parkedSales, setParkedSales] = useState<Sale[]>([]);
  
  const handleAddToConversion = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        { productId: product.id, quantity: 1, unitPrice: product.sellingPrice },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => item.productId === productId ? {...item, quantity} : item));
    }
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return state.products;
    return state.products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, state.products]);

  const completeSale = () => {
    if (cart.length === 0) {
        toast({ title: 'Cart is empty', description: 'Add products to the cart to complete a sale.', variant: 'destructive' });
        return;
    }

    const totalPaid = payment.cash + payment.card;
    if (totalPaid < cartTotal) {
        toast({ title: 'Insufficient payment', description: `Paid: $${totalPaid.toFixed(2)}, Required: $${cartTotal.toFixed(2)}`, variant: 'destructive' });
        return;
    }

    const newSale: Sale = {
        invoiceNumber: `INV-${Date.now()}`,
        items: cart,
        total: cartTotal,
        payment: payment,
        timestamp: new Date().toISOString(),
        status: state.online ? 'Completed' : 'Pending Sync'
    };

    dispatch({ type: 'ADD_SALE', payload: newSale });

    cart.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) {
            dispatch({ type: 'UPDATE_PRODUCT_STOCK', payload: { productId: item.productId, newStock: product.stock - item.quantity }});
        }
    });

    toast({
        title: `Sale ${state.online ? 'Completed' : 'Queued'}`,
        description: `Invoice ${newSale.invoiceNumber} has been processed.`,
    });

    setCart([]);
    setPayment({ cash: 0, card: 0 });
  };
  
  const parkSale = () => {
    if (cart.length === 0) return;
    const newParkedSale: Sale = {
      invoiceNumber: `PARK-${Date.now()}`,
      items: cart,
      total: cartTotal,
      payment: { cash: 0, card: 0 },
      timestamp: new Date().toISOString(),
      status: 'Parked',
    }
    setParkedSales([...parkedSales, newParkedSale]);
    setCart([]);
    toast({ title: 'Sale Parked', description: 'The current sale has been parked.' });
  }

  const resumeSale = (sale: Sale) => {
    setCart(sale.items);
    setParkedSales(parkedSales.filter(s => s.invoiceNumber !== sale.invoiceNumber));
    toast({ title: 'Sale Resumed', description: `Sale ${sale.invoiceNumber} has been restored.` });
  }


  return (
    <ProtectedPage permission="pos.create">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <PageHeader title="Point of Sale" />
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products by name or SKU..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.imageUrl}
                          width="64"
                          data-ai-hint={product.imageHint}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > product.reorderLevel ? 'default' : 'destructive'}>{product.stock}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${product.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleAddToConversion(product)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-[80px] text-center">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map(item => {
                      const product = state.products.find(p => p.id === item.productId);
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>{product?.name}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              className="w-16 text-center"
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                              min={0}
                            />
                          </TableCell>
                          <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {cart.length > 0 && (
                <>
                <Separator />
                <CardFooter className="flex-col items-stretch p-4">
                <div className="flex justify-between font-semibold text-lg mb-4">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="lg"><CreditCard className="mr-2 h-4 w-4" /> Payment</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Complete Payment</DialogTitle>
                                <DialogDescription>Total Amount: ${cartTotal.toFixed(2)}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" placeholder="Cash Amount" className="pl-8" onChange={(e) => setPayment({...payment, cash: parseFloat(e.target.value) || 0})} />
                                </div>
                                <div className="relative">
                                    <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" placeholder="Card Amount" className="pl-8" onChange={(e) => setPayment({...payment, card: parseFloat(e.target.value) || 0})} />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Amount Paid: ${(payment.cash + payment.card).toFixed(2)}
                                </div>
                                <div className="text-sm font-medium">
                                    Change Due: ${Math.max(0, payment.cash - (cartTotal - payment.card)).toFixed(2)}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={completeSale}>Complete Sale</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button size="lg" variant="outline" onClick={parkSale}><ParkingSquare className="mr-2 h-4 w-4"/> Park Sale</Button>
                </div>
              </CardFooter>
              </>
            )}
             <Separator />
             <CardFooter className="p-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full"><History className="mr-2 h-4 w-4"/> Resume Sale</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Parked Sales</DialogTitle></DialogHeader>
                        <div className="space-y-2">
                            {parkedSales.map(sale => (
                                <div key={sale.invoiceNumber} className="flex items-center justify-between p-2 border rounded-md">
                                    <div>
                                        <p className="font-medium">{sale.invoiceNumber}</p>
                                        <p className="text-sm text-muted-foreground">${sale.total.toFixed(2)} - {sale.items.length} items</p>
                                    </div>
                                    <DialogTrigger asChild><Button onClick={() => resumeSale(sale)}>Resume</Button></DialogTrigger>
                                </div>
                            ))}
                            {parkedSales.length === 0 && <p className="text-muted-foreground text-center py-4">No parked sales.</p>}
                        </div>
                    </DialogContent>
                </Dialog>
             </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
