import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, PlayCircle, Coffee, ShoppingBag, Timer, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      if (!loading) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const updatedOrder = change.doc.data() as Order;
            const orderId = change.doc.id.slice(-6).toUpperCase();
            
            if (updatedOrder.status === 'preparing') {
              toast.info(`Order #${orderId} is now being prepared!`);
            } else if (updatedOrder.status === 'ready') {
              toast.success(`Order #${orderId} is ready for pickup!`, {
                description: "Head over to the counter to get your meal.",
                duration: 8000,
              });
            } else if (updatedOrder.status === 'completed') {
              toast.success(`Order #${orderId} completed. Enjoy your meal!`);
            }
          }
        });
      }

      setOrders(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user, loading]);

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
    cancelled: Clock,
  };

  const statusSteps = ['pending', 'preparing', 'ready', 'completed'];
  const getStatusIndex = (status: OrderStatus) => statusSteps.indexOf(status);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-stone-500">
        <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
        <p>Please sign in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">My Orders</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Live Tracking Enabled</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto mb-4"></div>
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-stone-500 border-2 border-dashed border-stone-200 rounded-3xl">
          <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => {
              const Icon = statusIcons[order.status];
              const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
              const statusIndex = getStatusIndex(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50 text-stone-600 border border-stone-100">
                              <Coffee className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Order #{order.id.slice(-6).toUpperCase()}</p>
                                {order.status !== 'completed' && <Timer className="h-3 w-3 text-blue-500 animate-pulse" />}
                              </div>
                              <p className="text-xs text-stone-400">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn("text-[10px] font-bold px-3 py-1", statusColors[order.status])}>
                            <Icon className="mr-1.5 h-3 w-3" />
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Progress Tracker */}
                        {order.status !== 'cancelled' && (
                          <div className="mb-8 px-2">
                            <div className="relative flex justify-between">
                              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 -z-10" />
                              <div 
                                className="absolute top-1/2 left-0 h-0.5 bg-stone-900 -translate-y-1/2 -z-10 transition-all duration-1000" 
                                style={{ width: `${(statusIndex / (statusSteps.length - 1)) * 100}%` }}
                              />
                              {statusSteps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center gap-2">
                                  <div className={cn(
                                    "h-3 w-3 rounded-full border-2 transition-all duration-500",
                                    idx <= statusIndex ? "bg-stone-900 border-stone-900 scale-125" : "bg-white border-stone-200"
                                  )} />
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-tighter",
                                    idx <= statusIndex ? "text-stone-900" : "text-stone-300"
                                  )}>
                                    {step}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-3 bg-stone-50/50 rounded-xl p-4 border border-stone-100">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-stone-400 text-xs font-medium">{item.quantity}x</span>
                                <span className="text-stone-700 font-medium">{item.name}</span>
                              </div>
                              <span className="text-stone-900 font-bold">₱{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="pt-3 mt-3 border-t border-stone-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-stone-400 uppercase">Total Amount</span>
                            <span className="text-lg font-black text-stone-900">₱{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      
                      {order.status === 'ready' && (
                        <div className="bg-green-600 p-3 text-center text-white text-xs font-bold animate-pulse flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          YOUR ORDER IS READY FOR PICKUP!
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

