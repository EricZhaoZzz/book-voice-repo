import { supabase } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => router.push("/"),
  });

  const register = useMutation({
    mutationFn: async ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username: string;
    }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user!.id,
        email,
        username,
      });
      if (profileError) throw profileError;

      return authData;
    },
    onSuccess: () => router.push("/login"),
  });

  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => router.push("/login"),
  });

  return { login, register, logout };
}
