"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isGuest: false,
    isLoading: true,
  });

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isGuest = document.cookie.includes("guest_mode=true");

      setState({
        user: session?.user ?? null,
        isGuest,
        isLoading: false,
      });
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkGuestMode = useCallback(() => {
    const isGuest = document.cookie.includes("guest_mode=true");
    setState((prev) => ({ ...prev, isGuest }));
    return isGuest;
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.user || state.isGuest,
    checkGuestMode,
  };
}
