import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const AuthContext = createContext({
  session: null,
  isAuthReady: false,
  isSupabaseEnabled: false,
  sendOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  signOut: async () => ({ error: null })
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setIsAuthReady(true);
      return undefined;
    }

    let isMounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(data.session || null);
        setIsAuthReady(true);
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const sendOtp = async (phone) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error("Supabase is not configured.") };
    }
    const { error } = await supabase.auth.signInWithOtp({
      phone
    });
    return { error };
  };

  const verifyOtp = async (phone, token) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error("Supabase is not configured.") };
    }
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms"
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = useMemo(
    () => ({
      session,
      isAuthReady,
      isSupabaseEnabled: isSupabaseConfigured,
      sendOtp,
      verifyOtp,
      signOut
    }),
    [session, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
