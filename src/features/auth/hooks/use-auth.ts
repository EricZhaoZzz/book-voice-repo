"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { apiClient } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types/api";

type AuthState = {
  supabaseUser: SupabaseUser | null;
  isGuest: boolean;
  isLoading: boolean;
};

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    supabaseUser: null,
    isGuest: false,
    isLoading: true,
  });

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: !!state.supabaseUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isGuest = document.cookie.includes("guest_mode=true");

      if (session?.access_token) {
        apiClient.setAccessToken(session.access_token);
      }

      setState({
        supabaseUser: session?.user ?? null,
        isGuest,
        isLoading: false,
      });
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        apiClient.setAccessToken(session.access_token);
      } else {
        apiClient.setAccessToken(null);
      }

      setState((prev) => ({
        ...prev,
        supabaseUser: session?.user ?? null,
        isLoading: false,
      }));

      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
      } else {
        queryClient.removeQueries({ queryKey: authKeys.me() });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const checkGuestMode = useCallback(() => {
    const isGuest = document.cookie.includes("guest_mode=true");
    setState((prev) => ({ ...prev, isGuest }));
    return isGuest;
  }, []);

  const user: User | null = userData?.user ?? null;

  return {
    user,
    supabaseUser: state.supabaseUser,
    isGuest: state.isGuest,
    isLoading: state.isLoading || (!!state.supabaseUser && isUserLoading),
    isAuthenticated: !!state.supabaseUser || state.isGuest,
    checkGuestMode,
    refetchUser,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      apiClient.setAccessToken(data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username: string;
    }) => authApi.register(email, password, username),
    onSuccess: (data) => {
      apiClient.setAccessToken(data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      apiClient.setAccessToken(null);
      queryClient.removeQueries({ queryKey: authKeys.me() });
      queryClient.clear();
    },
  });
}

export function useWechatLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authApi.wechatLogin(code),
    onSuccess: (data) => {
      apiClient.setAccessToken(data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
