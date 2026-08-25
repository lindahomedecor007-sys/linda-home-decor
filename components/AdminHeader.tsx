"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="hidden md:flex h-20 bg-white border-b border-neutral-200 px-6 lg:px-8 items-center justify-between shadow-xs shrink-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-black leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {actions}

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-semibold text-black bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-black" />
          Live Website
        </Link>

        <div className="h-4 w-px bg-neutral-200" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center font-bold text-xs">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-neutral-800 leading-tight truncate max-w-[150px]">
              {user?.email}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
