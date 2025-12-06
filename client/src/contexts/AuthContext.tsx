import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { usersCollection } from "@/lib/firestore";
import type { User, UserRole } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(
      "🔵 AuthProvider: Initializing, Firebase configured:",
      isFirebaseConfigured,
    );

    if (!isFirebaseConfigured || !auth) {
      console.log("⚠️ Firebase not configured, setting loading to false");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("🟢 onAuthStateChanged triggered:", {
        hasUser: !!fbUser,
        uid: fbUser?.uid,
        email: fbUser?.email,
        displayName: fbUser?.displayName,
      });

      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          console.log("🔍 Checking if user exists in Firestore:", fbUser.uid);
          let existingUser = await usersCollection.get(fbUser.uid);

          if (!existingUser) {
            console.log(
              "➕ User not found in Firestore, creating new user document",
            );

            // Get role from localStorage if it exists (from signup)
            const storedRole =
              (localStorage.getItem(`user_role_${fbUser.uid}`) as UserRole) ||
              "doctor";

            existingUser = await usersCollection.create(fbUser.uid, {
              email: fbUser.email || "",
              displayName: fbUser.displayName || "User",
              photoURL: fbUser.photoURL || undefined,
              role: storedRole,
            });

            console.log("✅ User created in Firestore:", existingUser);

            // Clean up localStorage after using it
            localStorage.removeItem(`user_role_${fbUser.uid}`);
          } else {
            console.log("✅ User found in Firestore:", existingUser);
          }

          setUser(existingUser);
        } catch (error) {
          console.error("🔴 Error loading/creating user in Firestore:", error);

          // Fallback: Create a temporary user object from Firebase data
          // This allows the user to access the app even if Firestore fails
          const fallbackUser: User = {
            id: fbUser.uid,
            email: fbUser.email || "",
            displayName: fbUser.displayName || "User",
            photoURL: fbUser.photoURL || undefined,
            role: "doctor" as UserRole,
          };

          console.log("⚠️ Using fallback user object:", fallbackUser);
          setUser(fallbackUser);
        }
      } else {
        console.log("🔓 No Firebase user, clearing user state");
        setUser(null);
      }

      console.log("✅ Setting loading to false");
      setLoading(false);
    });

    return () => {
      console.log("🔵 Cleaning up onAuthStateChanged listener");
      unsubscribe();
    };
  }, []);

  // Debug log when user or loading state changes
  useEffect(() => {
    console.log("🟡 Auth state changed:", {
      hasUser: !!user,
      loading,
      userEmail: user?.email,
      userRole: user?.role,
    });
  }, [user, loading]);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error(
        "Firebase is not configured. Please check your environment variables.",
      );
    }
    try {
      console.log("🔵 Starting Google sign in");
      await signInWithPopup(auth, googleProvider);
      console.log("✅ Google sign in successful");
    } catch (error) {
      console.error("🔴 Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      console.log("🔵 Signing out");
      await firebaseSignOut(auth);
      setUser(null);
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("🔴 Error signing out:", error);
      throw error;
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) return;
    try {
      console.log("🔵 Updating user role to:", role);
      await usersCollection.update(user.id, { role });
      setUser({ ...user, role });
      console.log("✅ User role updated");
    } catch (error) {
      console.error("🔴 Error updating user role:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        signOut,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
