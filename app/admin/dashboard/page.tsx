"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Loader2,
  FolderKanban,
  Images,
  Mail,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        {/* Reusable Top Header Navbar */}
        <AdminHeader title="Dashboard Overview" />

        {/* Scrollable Content Below Header */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            {/* KPI Stat Cards (Mobile-first grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">
                    Products
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FF9E15] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-black">Active</span>
                  <p className="text-[11px] text-neutral-600 font-medium mt-1">Catalog management</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">
                    Projects
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-black">Showcase</span>
                  <p className="text-[11px] text-neutral-600 font-medium mt-1">Completed works</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">
                    Gallery
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Images className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-black">Media</span>
                  <p className="text-[11px] text-neutral-600 font-medium mt-1">High-res assets</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">
                    Enquiries
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-black">Inbox</span>
                  <p className="text-[11px] text-neutral-600 font-medium mt-1">Customer contacts</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </main>
  </div>
);
}
