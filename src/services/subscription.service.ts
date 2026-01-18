import { createClient } from "@/lib/supabase/server";
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "@/lib/validations/subscription";

export async function createSubscription(data: CreateSubscriptionInput, userId: string) {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .insert({
      ...data,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return subscription;
}

export async function getSubscriptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSubscriptionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscriptions").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(id: string, data: UpdateSubscriptionInput) {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return subscription;
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) throw error;
}
