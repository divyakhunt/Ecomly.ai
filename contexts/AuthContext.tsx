import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<User>;
  googleSignIn: () => Promise<User>;
  signUp: (data: { email: string; firstName: string; lastName: string; password?: string }) => Promise<User>;
  signOut: () => Promise<void>;
  sendOtp: (email: string, purpose: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore.
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
                uid: firebaseUser.uid,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
            });
        } else {
            console.warn("User exists in Auth, but not in Firestore. Attempting to create profile...");
            // This case can happen with a new Google Sign-In where the profile is created on sign-in itself.
            // Awaiting the profile management to complete.
            try {
              const appUser = await authService.googleSignIn();
              setUser(appUser);
            } catch(e) {
              console.error("Could not reconcile user profile. Signing out.", e);
              await authService.signOut();
              setUser(null);
            }
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user && !isLoading,
    isLoading,
    signIn: authService.signIn,
    googleSignIn: authService.googleSignIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    sendOtp: authService.sendOtp,
    verifyOtp: authService.verifyOtp,
    sendPasswordResetEmail: authService.sendPasswordResetEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};