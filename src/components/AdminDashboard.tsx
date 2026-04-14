import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, ShoppingBag, TrendingUp, DollarSign, Database, UserPlus, Shield, User, Search, Filter, Package, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, doc, setDoc, onSnapshot, query, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { INITIAL_MENU } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserProfile, Order, MenuItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const SALES_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const POPULAR_ITEMS = [
  { name: 'Espresso', orders: 45 },
  { name: 'Macchiato', orders: 38 },
  { name: 'Matcha', orders: 32 },
  { name: 'Muffin', orders: 28 },
  { name: 'Pasta', orders: 24 },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'staff' | 'admin'>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('category', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMenuItems(items);
      setLoadingMenu(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menu');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(userList);
      setLoadingUsers(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(orderList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const staffPerformance = useMemo(() => {
    const performance: Record<string, { name: string, orders: number }> = {};
    orders.forEach(order => {
      if (order.handledBy && order.handledByName) {
        if (!performance[order.handledBy]) {
          performance[order.handledBy] = { name: order.handledByName, orders: 0 };
        }
        performance[order.handledBy].orders += 1;
      }
    });
    return Object.values(performance).sort((a, b) => b.orders - a.orders);
  }, [orders]);

  const stats = [
    { name: 'Total Revenue', value: `₱${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'text-green-600' },
    { name: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, trend: '+8.2%', color: 'text-blue-600' },
    { name: 'Low Stock Items', value: menuItems.filter(i => i.stock <= 5).length.toString(), icon: Package, trend: 'Critical', color: 'text-red-600' },
    { name: 'Active Users', value: users.length.toString(), icon: Users, trend: '+4.1%', color: 'text-purple-600' },
  ];

  const seedMenu = async () => {
    setIsSeeding(true);
    setSuccessMessage(null);
    try {
      for (const item of INITIAL_MENU) {
        await setDoc(doc(collection(db, 'menu'), item.id), {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          isAvailable: item.isAvailable,
          stock: item.stock
        });
      }
      setSuccessMessage('Menu seeded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'menu');
    } finally {
      setIsSeeding(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'customer' ? 'staff' : 'customer';
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setSuccessMessage(`User role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'menu', itemId), { isAvailable: !currentStatus });
      setSuccessMessage(`Item availability updated`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menu/${itemId}`);
    }
  };

  const updateStock = async (itemId: string, newStock: number) => {
    try {
      await updateDoc(doc(db, 'menu', itemId), { 
        stock: newStock,
        isAvailable: newStock > 0
      });
      setSuccessMessage(`Stock updated successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menu/${itemId}`);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-stone-500">
        <p>Only administrators can view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Live Monitoring Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={seedMenu} 
              disabled={isSeeding}
              className="gap-2 border-stone-200"
            >
              <Database className="h-4 w-4" />
              {isSeeding ? 'Seeding...' : 'Seed Menu Data'}
            </Button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100 flex items-center justify-between"
          >
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="text-green-900/50 hover:text-green-900">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-stone-100 p-1 rounded-xl">
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Analytics</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Users & Staff</TabsTrigger>
          <TabsTrigger value="menu" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6 space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="border-stone-200 shadow-sm overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">{stat.name}</CardTitle>
                  <div className={cn("p-2 rounded-lg bg-stone-50 transition-colors group-hover:bg-stone-100", stat.color)}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      stat.trend === 'Critical' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      {stat.trend}
                    </span>
                    <span className="text-[10px] text-stone-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trends</CardTitle>
                <CardDescription>Real-time sales performance tracking.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1a1a1a' }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#1a1a1a" strokeWidth={3} dot={{ r: 4, fill: '#1a1a1a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Products</CardTitle>
                <CardDescription>Order volume by menu category.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={POPULAR_ITEMS} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} width={80} />
                    <Tooltip 
                      cursor={{ fill: '#f5f5f5' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px' }}
                    />
                    <Bar dataKey="orders" fill="#1a1a1a" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="border-stone-200 shadow-sm lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">User Directory</CardTitle>
                    <CardDescription>Manage roles and access permissions.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9 w-[200px] border-stone-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="py-10 text-center text-stone-500">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-stone-100">
                        <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">User</TableHead>
                        <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Email</TableHead>
                        <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Role</TableHead>
                        <TableHead className="text-right text-stone-400 font-bold uppercase text-[10px] tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.uid} className="border-stone-50">
                          <TableCell className="font-medium">{u.displayName}</TableCell>
                          <TableCell className="text-stone-500 text-sm">{u.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5",
                                u.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                u.role === 'staff' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                "bg-stone-50 text-stone-700 border-stone-100"
                              )}
                            >
                              {u.role.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {u.role !== 'admin' && (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => toggleRole(u.uid, u.role)}
                                  className="text-xs hover:bg-stone-100"
                                >
                                  {u.role === 'customer' ? (
                                    <><UserPlus className="mr-2 h-3 w-3" /> Make Staff</>
                                  ) : (
                                    <><User className="mr-2 h-3 w-3" /> Make Customer</>
                                  )}
                                </Button>
                              </motion.div>
                            )}
                            {u.role === 'admin' && (
                              <span className="text-xs text-stone-400 italic">Owner</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Staff Activity</CardTitle>
                <CardDescription>Live order processing metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {staffPerformance.map((staff, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 text-sm font-bold transition-colors group-hover:bg-stone-900 group-hover:text-white">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{staff.name}</p>
                          <p className="text-xs text-stone-500">{staff.orders} orders processed</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-stone-50 text-stone-600 font-bold">
                        {Math.round((staff.orders / orders.length) * 100) || 0}%
                      </Badge>
                    </div>
                  ))}
                  {staffPerformance.length === 0 && (
                    <div className="text-center py-10 text-stone-400 text-sm">
                      No staff activity recorded yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Inventory Monitoring</CardTitle>
                  <CardDescription>Real-time stock levels and availability control.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-stone-50 text-stone-500 border-stone-200">
                  {menuItems.length} Total Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMenu ? (
                <div className="py-10 text-center text-stone-500">Loading inventory...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-stone-100">
                      <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Product</TableHead>
                      <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Category</TableHead>
                      <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Stock Level</TableHead>
                      <TableHead className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                      <TableHead className="text-right text-stone-400 font-bold uppercase text-[10px] tracking-wider">Inventory Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id} className="border-stone-50 group">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-stone-100">
                              <img 
                                src={item.image || 'https://picsum.photos/seed/coffee/100/100'} 
                                alt={item.name} 
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <p className="font-bold">{item.name}</p>
                              <p className="text-[10px] text-stone-400">₱{item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-stone-50 text-stone-500 text-[10px] font-bold">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 rounded-md border-stone-200"
                                onClick={() => updateStock(item.id, Math.max(0, item.stock - 1))}
                              >
                                <RefreshCw className="h-3 w-3 text-stone-400" />
                              </Button>
                              <span className={cn(
                                "w-8 text-center font-bold text-sm",
                                item.stock <= 5 ? "text-red-600" : "text-stone-900"
                              )}>
                                {item.stock}
                              </span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 rounded-md border-stone-200"
                                onClick={() => updateStock(item.id, item.stock + 1)}
                              >
                                <Plus className="h-3 w-3 text-stone-400" />
                              </Button>
                            </div>
                            {item.stock <= 5 && item.stock > 0 && (
                              <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5",
                              item.isAvailable ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                            )}
                          >
                            {item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleAvailability(item.id, item.isAvailable)}
                              className="text-xs hover:bg-stone-100"
                            >
                              {item.isAvailable ? 'Disable Item' : 'Enable Item'}
                            </Button>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

