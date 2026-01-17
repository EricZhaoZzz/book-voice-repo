import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = (await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/10 p-4">
        <h1 className="text-lg font-bold mb-6 px-2">Admin Panel</h1>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
