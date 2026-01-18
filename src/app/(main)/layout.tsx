import { MainNav } from "@/components/layout/main-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
