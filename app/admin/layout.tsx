"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (authLoading) return;

    if (!user && !isLoginPage) {
      router.replace("/admin/login");
    } else if (user && isLoginPage) {
      router.replace("/admin/dashboard");
    }
  }, [user, authLoading, isLoginPage, router]);

  // 1. Show loading state while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // 2. Prevent flash of protected content if user is unauthenticated
  if (!user && !isLoginPage) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // 3. Render login page directly without admin sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 4. Render persistent admin layout shell (sidebar persists across all page navigations)
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
