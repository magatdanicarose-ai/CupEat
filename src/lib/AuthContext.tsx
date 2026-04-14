import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: 'customer' | 'staff' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: 'customer' | 'staff' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch or create user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          // Default role is admin for the owner email, otherwise customer
          const role = currentUser.email === 'luigigaspi01@gmail.com' ? 'admin' : 'customer';
          
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            role: role,
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', currentUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, requestedRole: 'customer' | 'staff' | 'admin' = 'customer') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    // For prototype convenience, we'll respect the requested role if it's not admin, 
    // or if the email is the owner email. In a real app, staff/admin would be assigned.
    let role: 'customer' | 'staff' | 'admin' = requestedRole;
    if (email === 'luigigaspi01@gmail.com') {
      role = 'admin';
    } else if (requestedRole === 'admin') {
      role = 'customer'; // Prevent self-promotion to admin
    }

    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: email,
      displayName: name,
      role: role,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
    setProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateRole = async (role: 'customer' | 'staff' | 'admin') => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
      setProfile(prev => prev ? { ...prev, role } : null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, loginWithEmail, signUpWithEmail, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
