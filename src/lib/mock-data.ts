import type { User, Product, Supplier, Sale, StockAdjustment, PurchaseOrder } from './definitions';

export const mockUsers: User[] = [
  { id: 1, username: 'cashier1', role: 'Cashier', status: 'Active' },
  { id: 2, username: 'manager1', role: 'Manager', status: 'Active' },
  { id: 3, username: 'owner1', role: 'Owner', status: 'Active' },
  { id: 4, username: 'cashier2', role: 'Cashier', status: 'Inactive' },
];

export const mockProducts: Product[] = [
  { id: 'SKU001', barcode: '1234567890123', name: 'Organic Bananas', category: 'Produce', taxClass: 'Zero', costPrice: 0.5, sellingPrice: 0.99, reorderLevel: 50, stock: 120, imageUrl: "https://picsum.photos/seed/101/400/400", imageHint: "fruit" },
  { id: 'SKU002', barcode: '2345678901234', name: 'Whole Milk, 1 Gallon', category: 'Dairy', taxClass: 'Zero', costPrice: 2.5, sellingPrice: 3.99, reorderLevel: 30, stock: 45, imageUrl: "https://picsum.photos/seed/102/400/400", imageHint: "milk carton" },
  { id: 'SKU003', barcode: '3456789012345', name: 'Artisan Sourdough Bread', category: 'Bakery', taxClass: 'Standard', costPrice: 3.0, sellingPrice: 5.49, reorderLevel: 20, stock: 35, imageUrl: "https://picsum.photos/seed/103/400/400", imageHint: "bread loaf" },
  { id: 'SKU004', barcode: '4567890123456', name: 'Premium Ground Coffee', category: 'Pantry', taxClass: 'Standard', costPrice: 8.0, sellingPrice: 12.99, reorderLevel: 40, stock: 60, imageUrl: "https://picsum.photos/seed/104/400/400", imageHint: "coffee bag" },
  { id: 'SKU005', barcode: '5678901234567', name: 'Wireless Mouse', category: 'Electronics', taxClass: 'Standard', costPrice: 15.0, sellingPrice: 29.99, reorderLevel: 10, stock: 25, imageUrl: "https://picsum.photos/seed/105/400/400", imageHint: "computer mouse" },
  { id: 'SKU006', barcode: '6789012345678', name: 'Cotton T-Shirt', category: 'Apparel', taxClass: 'Standard', costPrice: 5.0, sellingPrice: 14.99, reorderLevel: 50, stock: 200, imageUrl: "https://picsum.photos/seed/106/400/400", imageHint: "t-shirt" },
];

export const mockSuppliers: Supplier[] = [
  { id: 1, name: 'Fresh Foods Inc.', contactPerson: 'John Doe', phone: '123-456-7890', email: 'john@freshfoods.com' },
  { id: 2, name: 'Gadget Masters', contactPerson: 'Jane Smith', phone: '098-765-4321', email: 'jane@gadgetmasters.com' },
  { id: 3, name: 'Pantry Provisions Co.', contactPerson: 'Peter Jones', phone: '555-555-5555', email: 'peter@pantryco.com' },
];

export const mockSales: Sale[] = [
    {
      invoiceNumber: 'INV-2024-001',
      items: [
        { productId: 'SKU001', quantity: 2, unitPrice: 0.99 },
        { productId: 'SKU003', quantity: 1, unitPrice: 5.49 },
      ],
      total: 7.47,
      payment: { cash: 10.00, card: 0 },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
    },
     {
      invoiceNumber: 'INV-2024-002',
      items: [
        { productId: 'SKU005', quantity: 1, unitPrice: 29.99 },
      ],
      total: 29.99,
      payment: { cash: 0, card: 29.99 },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
    }
];

export const mockParkedSales: Sale[] = [
  {
    invoiceNumber: 'PARK-001',
    items: [
      { productId: 'SKU002', quantity: 1, unitPrice: 3.99 },
      { productId: 'SKU004', quantity: 1, unitPrice: 12.99 },
    ],
    total: 16.98,
    payment: { cash: 0, card: 0 },
    timestamp: new Date().toISOString(),
    status: 'Parked',
  },
];

export const mockStockAdjustments: StockAdjustment[] = [
    { id: 'ADJ-001', productId: 'SKU001', quantityChange: -5, reason: 'Spoilage', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), userId: 2 },
    { id: 'ADJ-002', productId: 'SKU005', quantityChange: -1, reason: 'Theft', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), userId: 3 },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplierId: 1, items: [{ productId: 'SKU001', quantity: 100, costPrice: 0.5 }, { productId: 'SKU002', quantity: 50, costPrice: 2.5 }], status: 'Ordered', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), orderedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'PO-002', supplierId: 2, items: [{ productId: 'SKU005', quantity: 20, costPrice: 15.0 }], status: 'Draft', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];
