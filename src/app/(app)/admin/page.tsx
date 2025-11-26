"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

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
import type { User, Role, Supplier } from "@/lib/definitions";

export default function AdminPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  
  // New User State
  const [newUsername, setNewUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Cashier');
  
  // New Supplier State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');

  const handleAddUser = () => {
    if (!newUsername) {
      toast({ title: 'Username is required', variant: 'destructive' });
      return;
    }
    const newUser: User = {
      id: state.users.length + 1,
      username: newUsername,
      role: newUserRole,
      status: 'Active',
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    toast({ title: 'User Added', description: `${newUsername} has been added as a ${newUserRole}.` });
    setNewUsername('');
  };
  
  const handleAddSupplier = () => {
    if (!newSupplierName) {
        toast({ title: 'Supplier name is required', variant: 'destructive' });
        return;
    }
    const newSupplier: Supplier = {
        id: state.suppliers.length + 1,
        name: newSupplierName,
        contactPerson: newSupplierContact,
        phone: newSupplierPhone,
        email: newSupplierEmail,
    };
    dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
    toast({ title: 'Supplier Added', description: `${newSupplierName} has been added.` });
    setNewSupplierName('');
    setNewSupplierContact('');
    setNewSupplierPhone('');
    setNewSupplierEmail('');
  };

  return (
    <ProtectedPage permission="admin.manage_users">
      <PageHeader title="Admin" description="Manage users, suppliers, and system settings." />
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage user accounts and roles.</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild><Button size="sm"><PlusCircle className="h-4 w-4 mr-2" />Add User</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                                <Select onValueChange={(v: Role) => setNewUserRole(v)} defaultValue="Cashier">
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="Cashier">Cashier</SelectItem><SelectItem value="Manager">Manager</SelectItem><SelectItem value="Owner">Owner</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <DialogTrigger asChild><Button onClick={handleAddUser}>Add User</Button></DialogTrigger>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {state.users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell><Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="flex flex-row items-center">
                 <div className="grid gap-2">
                    <CardTitle>Suppliers</CardTitle>
                    <CardDescription>Manage your list of suppliers.</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                     <Dialog>
                        <DialogTrigger asChild><Button size="sm"><PlusCircle className="h-4 w-4 mr-2" />Add Supplier</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
                             <div className="grid gap-4 py-4">
                                <Input placeholder="Supplier Name" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} />
                                <Input placeholder="Contact Person" value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)} />
                                <Input placeholder="Phone" value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} />
                                <Input placeholder="Email" value={newSupplierEmail} onChange={e => setNewSupplierEmail(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogTrigger asChild><Button onClick={handleAddSupplier}>Add Supplier</Button></DialogTrigger>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                <TableBody>
                  {state.suppliers.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
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
