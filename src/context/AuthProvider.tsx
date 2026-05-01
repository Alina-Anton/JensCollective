import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { AuthContext } from "@/context/authContext";
import type { AppUser } from "@/lib/appUser";
import { firebaseUserToAppUser } from "@/lib/appUser";
import { getAuthMode } from "@/lib/authMode";
import { cleanupDeletedAccountData } from "@/lib/accountDeletionCleanup";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import {
  upsertMemberDirectoryEntryFromUser,
} from "@/lib/memberDirectory";
import {
  getLocalSessionUser,
  LOCAL_AUTH_SESSION_KEY,
  localDeleteCurrentUser,
  localSignInWithEmail,
  localSignOut,
  localSignUpWithEmail,
} from "@/lib/localCredentialsAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode = getAuthMode();
  const [user, setUser] = useState<AppUser | null>(() =>
    mode === "local" ? getLocalSessionUser() : null,
  );
  const [loading, setLoading] = useState(() =>
    mode === "local" ? false : isFirebaseConfigured(),
  );

  useEffect(() => {
    if (mode === "local") {
      const onStorage = (e: StorageEvent) => {
        if (e.key === LOCAL_AUTH_SESSION_KEY || e.key === null) {
          setUser(getLocalSessionUser());
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    if (!isFirebaseConfigured()) {
      return;
    }
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (next) => {
      setUser(next ? firebaseUserToAppUser(next) : null);
      setLoading(false);
    });
  }, [mode]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (mode === "local") {
        const u = await localSignInWithEmail(email, password);
        upsertMemberDirectoryEntryFromUser(u);
        setUser(u);
        return;
      }
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      upsertMemberDirectoryEntryFromUser(
        auth.currentUser ? firebaseUserToAppUser(auth.currentUser) : null,
      );
    },
    [mode],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (mode === "local") {
        const u = await localSignUpWithEmail(
          email,
          password,
          displayName.trim(),
        );
        upsertMemberDirectoryEntryFromUser(u);
        setUser(u);
        return;
      }
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const name = displayName.trim();
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      upsertMemberDirectoryEntryFromUser(firebaseUserToAppUser(cred.user));
    },
    [mode],
  );

  const signOutUser = useCallback(async () => {
    if (mode === "local") {
      localSignOut();
      setUser(null);
      return;
    }
    if (!isFirebaseConfigured()) return;
    await signOut(getFirebaseAuth());
  }, [mode]);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      if (mode === "local") {
        throw Object.assign(
          new Error(
            "Password reset is not available for local browser accounts.",
          ),
          {
            code: "auth/password-reset-local-only",
          },
        );
      }
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email.trim());
    },
    [mode],
  );

  const deleteAccount = useCallback(async () => {
    if (mode === "local") {
      const current = getLocalSessionUser();
      await cleanupDeletedAccountData(current);
      localDeleteCurrentUser();
      setUser(null);
      return;
    }
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    const current = auth.currentUser;
    if (!current) return;
    await cleanupDeletedAccountData(firebaseUserToAppUser(current));
    await deleteUser(current);
    setUser(null);
  }, [mode]);

  const authReady = mode === "local" || isFirebaseConfigured();

  const value = useMemo(
    () => ({
      user,
      loading,
      authReady,
      signInWithEmail,
      signUpWithEmail,
      signOutUser,
      sendPasswordReset,
      deleteAccount,
    }),
    [
      user,
      loading,
      authReady,
      signInWithEmail,
      signUpWithEmail,
      signOutUser,
      sendPasswordReset,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
