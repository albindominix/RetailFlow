"use client";

import { createContext, useReducer, ReactNode, Dispatch, useEffect } from "react";
import type { AppState, Action, Role } from "@/lib/definitions";
import {
  mockUsers,
  mockProducts,
  mockSuppliers,
  mockSales,
  mockStockAdjustments,
  mockPurchaseOrders
} from "@/lib/mock-data";

const initialState: AppState = {
  role: null,
  online: true,
  users: mockUsers,
  products: mockProducts,
  suppliers: mockSuppliers,
  sales: mockSales,
  stockAdjustments: mockStockAdjustments,
  purchaseOrders: mockPurchaseOrders,
  refunds: [],
  goodsReceiptNotes: [],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "TOGGLE_ONLINE_STATUS":
      return { ...state, online: !state.online };
    case "ADD_SALE":
      return { ...state, sales: [...state.sales, action.payload] };
    case 'UPDATE_PRODUCT_STOCK':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.productId
            ? { ...p, stock: action.payload.newStock }
            : p
        ),
      };
    case 'ADD_STOCK_ADJUSTMENT':
      return {
        ...state,
        stockAdjustments: [action.payload, ...state.stockAdjustments],
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'ADD_PURCHASE_ORDER':
        return { ...state, purchaseOrders: [action.payload, ...state.purchaseOrders] };
    case 'UPDATE_PURCHASE_ORDER_STATUS':
        return {
            ...state,
            purchaseOrders: state.purchaseOrders.map(po =>
                po.id === action.payload.id ? { ...po, status: action.payload.status } : po
            ),
        };
    case 'ADD_GRN':
        return { ...state, goodsReceiptNotes: [action.payload, ...state.goodsReceiptNotes] };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: Dispatch<Action>;
  setRole: (role: Role) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Persist role in localStorage to survive page reloads during demo
    const storedRole = localStorage.getItem("retail-flow-role") as Role;
    if (storedRole && !state.role) {
      dispatch({ type: "SET_ROLE", payload: storedRole });
    }
  }, [state.role]);

  const setRole = (role: Role) => {
    localStorage.setItem("retail-flow-role", role);
    dispatch({ type: "SET_ROLE", payload: role });
  };
  
  return (
    <AppContext.Provider value={{ state, dispatch, setRole }}>
      {children}
    </AppContext.Provider>
  );
};
