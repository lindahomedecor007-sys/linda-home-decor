"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Store,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Tag,
  Settings,
  MessageSquare,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Automatically keep Store and Settings expanded if current route is active
  const isStoreActive = pathname.startsWith("/admin/store");
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Store: isStoreActive,
    Settings: isSettingsActive,
  });

  useEffect(() => {
    setOpenDropdowns((prev) => ({
      ...prev,
      Store: isStoreActive,
      Settings: isSettingsActive,
    }));
  }, [isStoreActive, isSettingsActive]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace("/admin/login");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/admin/dashboard",
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tag,
      current: pathname.startsWith("/admin/categories"),
    },
    {
      name: "Store",
      href: "/admin/store/hero",
      icon: Store,
      current: pathname.startsWith("/admin/store"),
      subItems: [
        {
          name: "Hero Section",
          href: "/admin/store/hero",
          current: pathname === "/admin/store/hero",
        },
        {
          name: "Featured Section",
          href: "/admin/store/featured",
          current: pathname === "/admin/store/featured",
        },
        {
          name: "Brands Section",
          href: "/admin/store/brands",
          current: pathname === "/admin/store/brands",
        },
        {
          name: "Statistics Section",
          href: "/admin/store/statistics",
          current: pathname === "/admin/store/statistics",
        },
        {
          name: "Who We Are",
          href: "/admin/store/who-we-are",
          current: pathname === "/admin/store/who-we-are",
        },
        {
          name: "About Section",
          href: "/admin/store/about",
          current: pathname === "/admin/store/about",
        },
      ],
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      current: pathname === "/admin/products",
    },
    {
      name: "Enquiries",
      href: "/admin/enquiries",
      icon: MessageSquare,
      current: pathname.startsWith("/admin/enquiries"),
    },
    {
      name: "Settings",
      href: "/admin/settings/company",
      icon: Settings,
      current: pathname.startsWith("/admin/settings"),
      subItems: [
        {
          name: "Company Details",
          href: "/admin/settings/company",
          current: pathname === "/admin/settings/company" || pathname === "/admin/settings",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden h-16 bg-white border-b border-neutral-200 px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo/logo.png"
            alt="Linda Home Decor"
            width={100}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-neutral-600 hover:text-black rounded-sm hover:bg-neutral-100 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-slide-in-right">
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
                <Image
                  src="/logo/logo.png"
                  alt="Linda Home Decor"
                  width={110}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User badge */}
              <div className="mt-4 p-3 rounded-sm bg-neutral-50 border border-neutral-100 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-sm bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-neutral-800 truncate">
                    {user?.email}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active Session
                  </span>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="mt-5 space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const hasSub = !!item.subItems;
                  const isOpen = !!openDropdowns[item.name];

                  return (
                    <div key={item.name} className="space-y-1">
                      {hasSub ? (
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.name)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors cursor-pointer ${
                            item.current
                              ? "bg-[#FF9E15] text-white"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            {item.name}
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            } ${item.current ? "text-white" : "text-neutral-400"}`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                            item.current
                              ? "bg-[#FF9E15] text-white"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      )}

                      {hasSub && isOpen && (
                        <div className="pl-9 space-y-1 animate-fade-in">
                          {item.subItems?.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                                sub.current
                                  ? "text-[#FF9E15] font-semibold bg-amber-50"
                                  : "text-neutral-500 hover:text-neutral-900"
                              }`}
                            >
                              • {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-100 space-y-2 shrink-0">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-sm text-xs font-medium text-neutral-600 hover:bg-neutral-50"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Public Website
                </span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-neutral-200 flex-col justify-between shrink-0 md:h-screen">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand header - Fixed & Centered */}
          <div className="h-20 px-6 border-b border-neutral-200 shrink-0 flex items-center justify-center">
            <Link href="/admin/dashboard" className="flex items-center justify-center">
              <Image
                src="/logo/logo-with-name.png"
                alt="Linda Home Decor"
                width={130}
                height={42}
                className="h-15 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasSub = !!item.subItems;
              const isOpen = !!openDropdowns[item.name];

              return (
                <div key={item.name} className="space-y-1">
                  {hasSub ? (
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-all cursor-pointer ${
                        item.current
                          ? "bg-[#FF9E15] text-white shadow-xs"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        } ${item.current ? "text-white" : "text-neutral-400"}`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-all ${
                        item.current
                          ? "bg-[#FF9E15] text-white shadow-xs"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </div>
                    </Link>
                  )}

                  {hasSub && isOpen && (
                    <div className="pl-6 pt-1 space-y-1 border-l-2 border-amber-200 ml-4">
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`block px-3 py-1.5 rounded-sm text-xs transition-colors ${
                            sub.current
                              ? "text-[#FF9E15] font-semibold bg-amber-50"
                              : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User profile & sign out - Fixed at bottom */}
        <div className="p-4 border-t border-neutral-100 space-y-3 shrink-0">
          <div className="p-3 rounded-sm bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-sm bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-neutral-800 truncate max-w-[110px]">
                  {user?.email}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">Online</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              title="Sign Out"
              className="p-1.5 rounded-sm text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
