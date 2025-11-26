"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/lib/definitions";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product, isNew: boolean) => void;
  isEditable: boolean;
  canViewCosts: boolean;
}

const initialProductState: Omit<Product, 'imageUrl' | 'imageHint'> = {
  id: `SKU${Date.now()}`,
  barcode: "",
  name: "",
  category: "",
  taxClass: "Standard",
  costPrice: 0,
  sellingPrice: 0,
  reorderLevel: 0,
  stock: 0,
};

export function ProductDetailSheet({
  open,
  onOpenChange,
  product,
  onSave,
  isEditable,
  canViewCosts
}: ProductDetailSheetProps) {
  const [formData, setFormData] = useState<Omit<Product, 'imageUrl' | 'imageHint'>>(initialProductState);
  const isNew = !product;

  useEffect(() => {
    if (open) {
      if (product) {
        setFormData(product);
      } else {
        setFormData({
            ...initialProductState,
            id: `SKU${Math.floor(Date.now() / 1000)}`
        });
      }
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name.endsWith('Price') || name.startsWith('reorder') || name.startsWith('stock') ? parseFloat(value) : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSaveClick = () => {
    const imageData = {
        imageUrl: product?.imageUrl || "https://picsum.photos/seed/new-product/400/400",
        imageHint: product?.imageHint || "product item"
    }
    onSave({...formData, ...imageData}, isNew);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isNew ? "Add New Product" : "Edit Product"}</SheetTitle>
          <SheetDescription>
            {isNew ? "Fill in the details for the new product." : `Editing ${product?.name}`}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="grid gap-4 py-4 px-1">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={!isEditable} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id">SKU</Label>
            <Input id="id" name="id" value={formData.id} onChange={handleChange} disabled={!isNew || !isEditable} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} disabled={!isEditable} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} disabled={!isEditable} />
          </div>
           <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} disabled={!isEditable} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input id="reorderLevel" name="reorderLevel" type="number" value={formData.reorderLevel} onChange={handleChange} disabled={!isEditable} />
                </div>
           </div>
          <div className="grid grid-cols-2 gap-4">
            {canViewCosts && (
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input id="costPrice" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} disabled={!isEditable} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input id="sellingPrice" name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} disabled={!isEditable} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxClass">Tax Class</Label>
            <Select name="taxClass" value={formData.taxClass} onValueChange={(v) => handleSelectChange('taxClass', v)} disabled={!isEditable}>
              <SelectTrigger id="taxClass">
                <SelectValue placeholder="Select a tax class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Reduced">Reduced</SelectItem>
                <SelectItem value="Zero">Zero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        </ScrollArea>
        {isEditable && (
            <SheetFooter>
                <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" onClick={handleSaveClick}>Save Changes</Button>
            </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
