import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle2, PlayCircle, XCircle, ShieldAlert, Timer, Activity, Coffee } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function StaffDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      if (!loading) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newOrder = change.doc.data() as Order;
            toast.info(`New Order from ${newOrder.customerName}!`, {
              description: `Order #${change.doc.id.slice(-6).toUpperCase()} received.`,
              duration: 5000,
            });
          }
        });
      }

      setOrders(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [loading]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        handledBy: profile?.uid,
        handledByName: profile?.displayName
      });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    preparing: 'bg-blue-50 text-blue-700 border-blue-100',
    ready: 'bg-green-50 text-green-700 border-green-100',
    completed: 'bg-stone-50 text-stone-700 border-stone-100',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
  };

  const statusIcons: Record<OrderStatus, any> = {
    pending: Clock,
    preparing: PlayCircle,
    ready: CheckCircle2,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const getOrderAge = (createdAt: any) => {
    if (!createdAt) return '0m';
    const start = createdAt.toDate();
    const diff = Math.floor((currentTime.getTime() - start.getTime()) / 1000 / 60);
    return `${diff}m`;
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const Icon = statusIcons[order.status];
    const age = getOrderAge(order.createdAt);
    const isOld = parseInt(age) > 15 && order.status !== 'completed';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className={cn(
          "border-stone-200 shadow-sm transition-all hover:shadow-md",
          isOld && "border-red-200 bg-red-50/30"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-bold text-stone-400 tracking-widest uppercase">
                  #{order.id.slice(-6).toUpperCase()}
                </CardTitle>
                {isOld && <Timer className="h-3 w-3 text-red-500 animate-pulse" />}
              </div>
              <p className="text-lg font-bold text-stone-900">{order.customerName}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", statusColors[order.status])}>
                <Icon className="mr-1 h-3 w-3" />
                {order.status.toUpperCase()}
              </Badge>
              <span className={cn("text-[10px] font-medium", isOld ? "text-red-500 font-bold" : "text-stone-400")}>
                {age} ago
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="mt-4 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-stone-100 text-[10px] font-bold text-stone-600">
                      {item.quantity}
                    </span>
                    <span className="text-stone-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-stone-400 text-xs">₱{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-stone-100 pt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Amount</span>
                <span className="text-sm font-bold text-stone-900">₱{order.totalAmount}</span>
              </div>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" onClick={() => updateStatus(order.id, 'preparing')} className="bg-stone-900 hover:bg-stone-800 text-xs h-8">
                      Start Preparing
                    </Button>
                  </motion.div>
                )}
                {order.status === 'preparing' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" onClick={() => updateStatus(order.id, 'ready')} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
                      Mark Ready
                    </Button>
                  </motion.div>
                )}
                {order.status === 'ready' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" onClick={() => updateStatus(order.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-xs h-8">
                      Hand Over
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (profile?.role !== 'staff' && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full bg-red-50 p-6">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Access Denied</h2>
        <p className="text-stone-500">You do not have permission to view the staff dashboard.</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Staff Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Order Monitoring Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Shift Progress</span>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-sm font-bold text-stone-900">{completedOrders.length} Completed</span>
            </div>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pending</span>
            <div className="flex items-center gap-2">
              <Coffee className="h-3 w-3 text-amber-500" />
              <span className="text-sm font-bold text-stone-900">{activeOrders.length} Active</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto mb-4"></div>
          Loading orders...
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-stone-100 p-1 rounded-xl">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              History ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {activeOrders.map(order => (
                  <div key={order.id}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </AnimatePresence>
              {activeOrders.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">
                  <Coffee className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium">No active orders at the moment.</p>
                  <p className="text-xs">New orders will appear here automatically.</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {completedOrders.map(order => (
                  <div key={order.id}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </AnimatePresence>
              {completedOrders.length === 0 && (
                <div className="col-span-full text-center py-20 text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">
                  No completed orders in this session.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

