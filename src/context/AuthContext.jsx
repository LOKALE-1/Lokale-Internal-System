import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'Founder / Ops Manager',
  MARKETING: 'Marketing',
  PARTNERSHIPS: 'Partnerships / Growth',
  IT: 'IT / Product'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        let userData;
        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          // Fallback role mapping for first-time login
          let role = ROLES.ADMIN;
          let name = 'Founder';

          if (firebaseUser.email.includes('marketing')) {
            role = ROLES.MARKETING;
            name = 'Marketing Lead';
          } else if (firebaseUser.email.includes('growth') || firebaseUser.email.includes('partnerships')) {
            role = ROLES.PARTNERSHIPS;
            name = 'Partnerships Lead';
          } else if (firebaseUser.email.includes('dev') || firebaseUser.email.includes('it')) {
            role = ROLES.IT;
            name = 'Lead Developer';
          }

          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name,
            role
          };

          // Store in Firestore for future
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }

        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  const signup = async (email, password, fullName, role) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: fullName,
        role: role || ROLES.ADMIN
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser(userData);
    } catch (error) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const switchRole = async (newRole) => {
    if (!user || user.role !== ROLES.ADMIN) return;
    const updatedUser = {
      ...user,
      role: newRole
    };
    setUser(updatedUser);
    await setDoc(doc(db, 'users', user.uid), updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, switchRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
