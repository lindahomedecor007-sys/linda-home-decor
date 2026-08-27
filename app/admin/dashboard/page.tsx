"use client";

import Link from "next/link";
import {
  Package,
  FolderKanban,
  Images,
  Mail,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboardPage() {
  return (
    <>
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
    </>
  );
}
