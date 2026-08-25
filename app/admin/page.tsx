"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminRootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/admin/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
    </div>
  );
}
