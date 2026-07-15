"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { myProfileData } from '@/data/mockDb';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    ...myProfileData,
    firstName: '',
    lastName: '',
    dob: '14/01/2005',
    bio: '',
    instagram: '',
    twitter: '',
    youtube: '',
    avatarUrl: null, 
    isAdmin: false 
  });

  useEffect(() => {
    // Session expiration logic (30 days inactivity)
    const SESSION_TIMEOUT_DAYS = 30;
    const lastActive = localStorage.getItem('arcade_last_active');
    const now = Date.now();
    
    if (lastActive) {
      const daysSinceActive = (now - parseInt(lastActive)) / (1000 * 60 * 60 * 24);
      if (daysSinceActive > SESSION_TIMEOUT_DAYS) {
        signOut(auth);
      }
    }
    
    localStorage.setItem('arcade_last_active', now.toString());
    
    const interval = setInterval(() => {
      localStorage.setItem('arcade_last_active', Date.now().toString());
    }, 60000); // Update every minute while tab is open

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setLoading(false);
        
        // Listen to profile data in real-time
        const docRef = doc(db, "users", user.uid);
        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const emailLower = user.email?.toLowerCase();
            const isAdminUser = emailLower === 'aditya@resengalstudio.live' || emailLower === 'admin@resengalstudio.live' || emailLower === 'test@resengalstudio.live' || userData.isAdmin;
            
            setProfile(prev => ({
              ...prev,
              ...userData,
              isAdmin: isAdminUser
            }));
            
            if (isAdminUser && !userData.isAdmin) {
              setDoc(docRef, { isAdmin: true }, { merge: true }).catch(() => {});
            }
          } else {
            const emailLower = user.email?.toLowerCase();
            const isAdminUser = emailLower === 'aditya@resengalstudio.live' || emailLower === 'admin@resengalstudio.live' || emailLower === 'test@resengalstudio.live';
            setProfile(prev => ({ ...prev, isAdmin: isAdminUser, email: user.email }));
            setDoc(docRef, { email: user.email, isAdmin: isAdminUser }, { merge: true }).catch(() => {});
          }
        }, (err) => {
          const emailLower = user.email?.toLowerCase();
          const isAdminUser = emailLower === 'aditya@resengalstudio.live' || emailLower === 'admin@resengalstudio.live' || emailLower === 'test@resengalstudio.live';
          setProfile(prev => ({ ...prev, isAdmin: isAdminUser, email: user.email }));
        });
      } else {
        setIsLoggedIn(false);
        setProfile(prev => ({ ...prev, isAdmin: false, username: '' }));
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      clearInterval(interval);
    };
  }, []);

  const updateProfile = async (newData) => {
    const updated = { ...profile, ...newData };
    updated.name = `${updated.firstName} ${updated.lastName}`.trim();
    if (!updated.avatarUrl) {
      updated.initials = ((updated.firstName[0] || '') + (updated.lastName[0] || '')).toUpperCase();
    }
    setProfile(updated);
    
    // Save to Firestore if logged in
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, updated, { merge: true });
    }
  };

  const addNotification = async (targetUsername, notification) => {
    try {
      const { collection, query, where, getDocs, updateDoc, arrayUnion } = await import('firebase/firestore');
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", targetUsername.replace('@', '')));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          notifications: arrayUnion({
            id: Date.now().toString(),
            ...notification,
            read: false,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          })
        });
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const markNotificationsRead = async () => {
    if (auth.currentUser && profile.notifications) {
      const updatedNotifs = profile.notifications.map(n => ({ ...n, read: true }));
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { notifications: updatedNotifs }, { merge: true });
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (username, password, email, phone) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const emailLower = email.toLowerCase();
      const isAdminUser = emailLower === 'aditya@resengalstudio.live' || emailLower === 'admin@resengalstudio.live' || emailLower === 'test@resengalstudio.live';
      
      const newUser = {
        username,
        email,
        phone,
        isAdmin: isAdminUser,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), newUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const setupRecaptcha = (buttonId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const sendOTP = async (phoneNumber, appVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      
      // Ensure user document exists
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          phone: result.user.phoneNumber,
          isAdmin: false,
          createdAt: new Date().toISOString()
        });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile, 
      isLoggedIn, 
      loading,
      login, 
      signup, 
      logout, 
      resetPassword,
      setupRecaptcha,
      sendOTP,
      verifyOTP,
      addNotification,
      markNotificationsRead
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
