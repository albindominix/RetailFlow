import type { Role } from './definitions';

export type Permission = 
  | 'pos.create'
  | 'pos.refunds'
  | 'pos.approve_high_value_refund'
  | 'inventory.view'
  | 'inventory.edit'
  | 'procurement.manage'
  | 'reports.view_financials'
  | 'reports.view_costs'
  | 'stock_adjustment.create'
  | 'admin.manage_users'
  | 'admin.manage_suppliers'
  | 'sales.view';

export const permissions: Record<Role, Permission[]> = {
  Cashier: [
    'pos.create',
    'pos.refunds',
    'inventory.view',
  ],
  Manager: [
    'pos.create',
    'pos.refunds',
    'pos.approve_high_value_refund',
    'inventory.view',
    'procurement.manage',
    'reports.view_financials',
    'reports.view_costs',
    'stock_adjustment.create',
    'sales.view',
  ],
  Owner: [
    'pos.create',
    'pos.refunds',
    'pos.approve_high_value_refund',
    'inventory.view',
    'inventory.edit',
    'procurement.manage',
    'reports.view_financials',
    'reports.view_costs',
    'stock_adjustment.create',
    'admin.manage_users',
    'admin.manage_suppliers',
    'sales.view',
  ],
};
