"use client";

import { useState } from "react";
import Image from "next/image";
import { PlusCircle, MoreHorizontal, File, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeader } from "@/components/app/page-header";
import { ProtectedPage } from "@/components/app/protected-page";
import { useAppContext } from "@/hooks/use-app-context";
import { useAccessControl } from "@/hooks/use-access-control";
import { ProductDetailSheet } from "./components/product-detail-sheet";
import type { Product } from "@/lib/definitions";

export default function InventoryPage() {
  const { state, dispatch } = useAppContext();
  const { canAccess } = useAccessControl();
  const { products } = state;
  const canEdit = canAccess("inventory.edit");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setSheetOpen(true);
  };

  const handleSaveProduct = (product: Product, isNew: boolean) => {
    if (isNew) {
      dispatch({ type: "ADD_PRODUCT", payload: product });
    } else {
      dispatch({ type: "UPDATE_PRODUCT", payload: product });
    }
    setSheetOpen(false);
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedPage permission="inventory.view">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <PageHeader title="Products" description="Manage your products and view their inventory."/>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            {canEdit && (
              <Button size="sm" className="h-7 gap-1" onClick={handleAddProduct}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            )}
          </div>
        </div>
        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Image
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Status</TableHead>
                   {canAccess('reports.view_costs') && <TableHead className="hidden md:table-cell">Cost Price</TableHead>}
                  <TableHead>Selling Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Stock
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
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
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? "default" : "outline"} className={product.stock > 0 ? "" : "text-muted-foreground"}>
                        {product.stock > 0 ? "In stock" : "Out of stock"}
                      </Badge>
                    </TableCell>
                    {canAccess('reports.view_costs') && <TableCell className="hidden md:table-cell">${product.costPrice.toFixed(2)}</TableCell>}
                    <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            {canEdit ? 'Edit' : 'View Details'}
                          </DropdownMenuItem>
                          {canEdit && <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
      <ProductDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        isEditable={canEdit}
        canViewCosts={canAccess('reports.view_costs')}
      />
    </ProtectedPage>
  );
}
