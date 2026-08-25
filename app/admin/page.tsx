"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
    </div>
  );
}
