import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, LogIn, ShieldCheck, User, ClipboardList, Mail, Lock, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signIn, loginWithEmail, signUpWithEmail, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'staff' | 'admin'>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && profile && !loading) {
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'staff') navigate('/staff');
      else navigate('/');
    }
  }, [user, profile, loading, navigate]);

  if (loading || (user && !profile)) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Coffee className="h-12 w-12 text-stone-900" />
        </motion.div>
        <p className="text-sm font-medium text-stone-500 animate-pulse">Detecting your role and preparing your dashboard...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        toast.success('Welcome back!');
      } else {
        await signUpWithEmail(email, password, name, role);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleCard = ({ title, description, icon: Icon, color, selected, onClick }: any) => (
    <motion.div 
      whileHover={{ x: 5, backgroundColor: "rgba(245, 245, 244, 0.5)" }}
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${
        selected ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-stone-200 hover:border-stone-400'
      }`}
    >
      <div className={`rounded-full p-2 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-bold text-stone-900">{title}</h3>
        <p className="text-xs text-stone-500">{description}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-stone-200 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 text-white"
            >
              <Coffee className="h-8 w-8" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Sign in to your CupEatArea account to continue.' 
                : 'Join us and start your sunset coffee experience.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-stone-500">Full Name</label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                        <Input 
                          placeholder="John Doe" 
                          className="pl-10" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-stone-500">Select Your Role</label>
                      <div className="grid gap-2">
                        <RoleCard 
                          title="Customer" 
                          description="Browse menu and place orders." 
                          icon={User} 
                          color="bg-green-100 text-green-600"
                          selected={role === 'customer'}
                          onClick={() => setRole('customer')}
                        />
                        <RoleCard 
                          title="Staff" 
                          description="Manage and process incoming orders." 
                          icon={ClipboardList} 
                          color="bg-blue-100 text-blue-600"
                          selected={role === 'staff'}
                          onClick={() => setRole('staff')}
                        />
                        <RoleCard 
                          title="Admin" 
                          description="Full access to analytics and settings." 
                          icon={ShieldCheck} 
                          color="bg-purple-100 text-purple-600"
                          selected={role === 'admin'}
                          onClick={() => setRole('admin')}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit"
                  className="w-full bg-stone-900 py-6 text-lg hover:bg-stone-800" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </Button>
              </motion.div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-stone-500">Or continue with</span>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline"
                className="w-full py-6 text-stone-600" 
                onClick={signIn}
                disabled={isSubmitting || loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="mr-2 h-5 w-5" alt="" />
                Google
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-stone-100 pt-6">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </CardFooter>
        </Card>
        <p className="mt-6 text-center text-xs text-stone-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
