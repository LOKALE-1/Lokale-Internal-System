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

// Map roles to their default board paths
export const ROLE_DEFAULT_BOARDS = {
  [ROLES.ADMIN]: '/',
  [ROLES.MARKETING]: '/growth',
  [ROLES.PARTNERSHIPS]: '/onboarding',
  [ROLES.IT]: '/it-board'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null); // Session-only board view
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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
            role,
            defaultBoard: ROLE_DEFAULT_BOARDS[role]
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }

        // Ensure defaultBoard exists
        if (!userData.defaultBoard) {
          userData.defaultBoard = ROLE_DEFAULT_BOARDS[userData.role];
          await setDoc(doc(db, 'users', firebaseUser.uid), userData, { merge: true });
        }

        setUser(userData);
        // Initialize activeBoard to user's default board
        setActiveBoard(userData.defaultBoard);
      } else {
        setUser(null);
        setActiveBoard(null);
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
        role: role || ROLES.ADMIN,
        defaultBoard: ROLE_DEFAULT_BOARDS[role || ROLES.ADMIN]
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser(userData);
      setActiveBoard(userData.defaultBoard);
    } catch (error) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setActiveBoard(null);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  // Session-only board switching (only for Founders, never modifies role)
  const switchBoard = (boardPath) => {
    if (!user || user.role !== ROLES.ADMIN) return;
    setActiveBoard(boardPath);
  };

  // Get user's accessible boards based on their role
  const getAccessibleBoards = () => {
    if (!user) return [];

    if (user.role === ROLES.ADMIN) {
      // Founders can access all boards
      return [
        { path: '/', label: 'Dashboard', role: ROLES.ADMIN },
        { path: '/growth', label: 'Growth & Campaigns', role: ROLES.MARKETING },
        { path: '/onboarding', label: 'Brand Onboarding', role: ROLES.PARTNERSHIPS },
        { path: '/it-board', label: 'IT / Product Board', role: ROLES.IT }
      ];
    }

    // Non-founders only see their default board
    return [{ path: user.defaultBoard, label: 'My Board', role: user.role }];
  };

  return (
    <AuthContext.Provider value={{
      user,
      activeBoard,
      login,
      signup,
      logout,
      switchBoard,
      getAccessibleBoards,
      loading
    }}>
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
