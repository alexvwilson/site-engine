import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserProvider } from "@/contexts/UserContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import { MobileHeaderContent } from "@/components/layout/MobileHeaderContent";
import { getCurrentUser } from "@/lib/auth";

// Force dynamic rendering to prevent static generation issues with authentication
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user with role information from database
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Read sidebar state from cookie server-side
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarState?.value === "false" ? false : true;

  return (
    <UserProvider value={user}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <MobileHeaderContent />
            <main className="flex-1 pt-14 lg:pt-0 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
