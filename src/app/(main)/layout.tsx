import { MainNav } from "@/components/layout/main-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
