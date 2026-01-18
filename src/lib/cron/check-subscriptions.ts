import { createClient } from "@/lib/supabase/server";

export async function checkExpiringSubscriptions() {
  const supabase = await createClient();
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const { data: expiringSoon } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active")
    .lte("end_date", sevenDaysLater.toISOString().split("T")[0])
    .gte("end_date", today.toISOString().split("T")[0]);

  const { data: expired } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active")
    .lt("end_date", today.toISOString().split("T")[0]);

  for (const sub of expired || []) {
    await supabase.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);

    await supabase.from("users").update({ status: "suspended" }).eq("subscription_id", sub.id);
  }

  return {
    expiringSoon: expiringSoon?.length || 0,
    expired: expired?.length || 0,
  };
}
