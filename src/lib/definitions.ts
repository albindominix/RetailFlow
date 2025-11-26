export type Role = "Cashier" | "Manager" | "Owner";

export type User = {
  id: number;
  username: string;
  role: Role;
  status: "Active" | "Inactive";
};

export type Product = {
  id: string; // SKU
  barcode: string;
  name: string;
  category: string;
  taxClass: 'Standard' | 'Reduced' | 'Zero';
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  stock: number;
  imageUrl: string;
  imageHint: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Sale = {
  invoiceNumber: string;
  items: CartItem[];
  total: number;
  payment: {
    cash: number;
    card: number;
  };
  timestamp: string;
  status: 'Completed' | 'Parked' | 'Pending Sync';
};

export type Refund = {
  id: string;
  originalInvoiceNumber: string;
  items: CartItem[];
  total: number;
  timestamp: string;
  processedBy: number; // User ID
};

export type Supplier = {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
};

export type PurchaseOrderItem = {
  productId: string;
  quantity: number;
  costPrice: number;
};

export type PurchaseOrder = {
  id: string;
  supplierId: number;
  items: PurchaseOrderItem[];
  status: 'Draft' | 'Ordered' | 'Received';
  createdAt: string;
  orderedAt?: string;
};

export type GoodsReceiptNote = {
  id: string;
  poId: string;
  receivedItems: PurchaseOrderItem[];
  receivedAt: string;
  receivedBy: number; // User ID
};

export type StockAdjustment = {
  id: string;
  productId: string;
  quantityChange: number;
  reason: string;
  timestamp: string;
  userId: number;
};

export type AppState = {
  role: Role | null;
  online: boolean;
  users: User[];
  products: Product[];
  sales: Sale[];
  refunds: Refund[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  stockAdjustments: StockAdjustment[];
};

export type Action =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'TOGGLE_ONLINE_STATUS' }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_PRODUCT_STOCK'; payload: { productId: string; newStock: number } }
  | { type: 'ADD_STOCK_ADJUSTMENT'; payload: StockAdjustment }
  | { type: 'ADD_USER', payload: User }
  | { type: 'ADD_SUPPLIER', payload: Supplier }
  | { type: 'ADD_PRODUCT', payload: Product }
  | { type: 'UPDATE_PRODUCT', payload: Product }
  | { type: 'ADD_PURCHASE_ORDER', payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER_STATUS', payload: { id: string; status: 'Draft' | 'Ordered' | 'Received' } }
  | { type: 'ADD_GRN', payload: GoodsReceiptNote };
