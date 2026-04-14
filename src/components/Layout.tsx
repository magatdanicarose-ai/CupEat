import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, ClipboardList, LayoutDashboard, User, ShoppingCart, LogOut, ChevronDown, ShieldCheck, Home, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '../lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, updateRole } = useAuth();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home, roles: ['customer', 'staff', 'admin'] },
    { name: 'Menu', href: '/menu', icon: Coffee, roles: ['customer', 'staff', 'admin'] },
    { name: 'My Orders', href: '/orders', icon: ShoppingCart, roles: ['customer', 'staff', 'admin'] },
    { name: 'Staff', href: '/staff', icon: ClipboardList, roles: ['staff', 'admin'] },
    { name: 'Admin', href: '/admin', icon: LayoutDashboard, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !profile || item.roles.includes(profile.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white"
            >
              <Coffee className="h-6 w-6" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">CupEatArea</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-stone-900",
                  location.pathname === item.href ? "text-stone-900" : "text-stone-500"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-stone-900"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 px-2 hover:bg-stone-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-stone-600 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="hidden text-left md:block">
                      <p className="text-xs font-bold leading-none">{profile?.displayName || 'User'}</p>
                      <p className="text-[10px] text-stone-500">{profile?.role.toUpperCase()}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  {/* Role Switcher for Prototype Convenience */}
                  <DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase text-stone-400">Switch Role (Prototype)</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => updateRole('customer')}>
                      <User className="mr-2 h-4 w-4" />
                      Customer View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateRole('staff')}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Staff View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateRole('admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin View
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => navigate('/login')} className="bg-stone-900 hover:bg-stone-800">
                  Login
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-stone-50 px-4 py-20 border-t border-stone-200">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                  <Coffee className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">CupEatArea</span>
              </div>
              <p className="text-stone-500 text-sm mb-6">
                The perfect blend of coffee, food, and sunset views at Bulan Boulevard.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-200">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-200">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-200">
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-stone-500">
                <li><button onClick={() => navigate('/')} className="hover:text-stone-900">Home</button></li>
                <li><button onClick={() => navigate('/menu')} className="hover:text-stone-900">Menu</button></li>
                <li><button onClick={() => navigate('/orders')} className="hover:text-stone-900">My Orders</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-stone-900">Login</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Categories</h4>
              <ul className="space-y-4 text-sm text-stone-500">
                <li><button onClick={() => navigate('/menu')} className="hover:text-stone-900">Coffee</button></li>
                <li><button onClick={() => navigate('/menu')} className="hover:text-stone-900">Meals</button></li>
                <li><button onClick={() => navigate('/menu')} className="hover:text-stone-900">Desserts</button></li>
                <li><button onClick={() => navigate('/menu')} className="hover:text-stone-900">Drinks</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm text-stone-500">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-stone-400 shrink-0" />
                  <span>Zone 2 Boulevard, Bulan, Sorsogon, Philippines</span>
                </li>
                <li>hello@cupeatarea.com</li>
                <li>+63 912 345 6789</li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-stone-200 text-center text-stone-400 text-xs">
            <p>© 2024 CupEatArea. All rights reserved. Designed with love in Sorsogon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

