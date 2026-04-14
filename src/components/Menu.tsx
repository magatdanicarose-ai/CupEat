import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { MenuItem, OrderItem } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, LogIn, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Menu() {
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'menu'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMenuItems(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menu');
    });

    return () => unsubscribe();
  }, [user]);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  
  const filteredMenu = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    
    const currentQty = cart[id] || 0;
    if (currentQty >= item.stock) {
      toast.error(`Only ${item.stock} units of ${item.name} available.`);
      return;
    }
    
    setCart(prev => ({ ...prev, [id]: currentQty + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const totalItems = (Object.values(cart) as number[]).reduce((sum, count) => sum + count, 0);
  const totalPrice = menuItems.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  const handleCheckout = async () => {
    if (!user || !profile) return;
    
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const orderItems: OrderItem[] = [];
      
      for (const [id, quantity] of Object.entries(cart)) {
        const item = menuItems.find(m => m.id === id)!;
        
        // Final stock check
        if (item.stock < (quantity as number)) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
        
        orderItems.push({
          menuItemId: id,
          name: item.name,
          price: item.price,
          quantity: quantity as number
        });
        
        // Update stock in Firestore
        const itemRef = doc(db, 'menu', id);
        batch.update(itemRef, {
          stock: item.stock - (quantity as number),
          isAvailable: (item.stock - (quantity as number)) > 0
        });
      }

      // Add order document
      const orderRef = doc(collection(db, 'orders'));
      batch.set(orderRef, {
        customerId: user.uid,
        customerName: profile.displayName || user.email,
        items: orderItems,
        totalAmount: totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      setCart({});
      toast.success('Order placed successfully! We\'re preparing your meal.');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order. Please try again.');
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full bg-stone-100 p-6">
          <LogIn className="h-12 w-12 text-stone-400" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Welcome to CupEatArea</h2>
        <p className="mb-8 text-stone-500">Please sign in to browse our menu and place orders.</p>
        <Button onClick={signIn} className="bg-stone-900 hover:bg-stone-800">
          Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Our Menu</h1>
          <p className="text-stone-500">Freshly brewed coffee and delicious meals.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <motion.div
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {menuItems.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          No menu items available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenu.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-stone-200 transition-all hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={item.image || 'https://picsum.photos/seed/coffee/400/300'}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2 bg-stone-100 text-stone-600">
                        {item.category}
                      </Badge>
                      <CardTitle className="text-xl">{item.name}</CardTitle>
                    </div>
                    <span className="text-lg font-bold text-stone-900">₱{item.price}</span>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {item.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                      item.stock > 10 ? "bg-green-50 text-green-600" : 
                      item.stock > 0 ? "bg-orange-50 text-orange-600 animate-pulse" : 
                      "bg-red-50 text-red-600"
                    )}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                    {item.stock <= 5 && item.stock > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  {cart[item.id] ? (
                    <div className="flex w-full items-center justify-between rounded-lg bg-stone-100 p-1">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 rounded-md hover:bg-white"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.span 
                        key={cart[item.id]}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-medium"
                      >
                        {cart[item.id]}
                      </motion.span>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addToCart(item.id)}
                          className="h-8 w-8 rounded-md hover:bg-white"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div 
                      className="w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full bg-stone-900 hover:bg-stone-800"
                        onClick={() => addToCart(item.id)}
                        disabled={!item.isAvailable}
                      >
                        {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                      </Button>
                    </motion.div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4"
          >
            <div className="flex items-center justify-between rounded-2xl bg-stone-900 p-4 text-white shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 p-0 text-[10px] font-bold">
                    {totalItems}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-400">Total Amount</p>
                  <p className="text-lg font-bold">₱{totalPrice}</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-white text-stone-900 hover:bg-stone-100"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Checkout'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

