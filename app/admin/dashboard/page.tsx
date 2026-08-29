"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Tag,
  MessageSquare,
  Store,
  Plus,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Sparkles,
  Layers,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import { useStore } from "@/context/StoreContext";

export default function AdminDashboardPage() {
  const {
    products,
    productsLoading,
    categories,
    categoriesLoading,
    enquiries,
    enquiriesLoading,
    heroSlides,
    brandsData,
    companySettings,
    refreshProducts,
    refreshCategories,
    refreshEnquiries,
    refreshHero,
    refreshCompanySettings,
  } = useStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual Refresh all store data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        refreshProducts(),
        refreshCategories(),
        refreshEnquiries(),
        refreshHero(),
        refreshCompanySettings(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculations from real live data
  const pendingEnquiries = enquiries.filter((e) => e.status === "pending");
  const categoriesWithCatalog = categories.filter((c) => (c.catalogs && c.catalogs.length > 0) || Boolean(c.catalog_url));
  const recentEnquiries = enquiries.slice(0, 5);
  const recentProducts = products.slice(0, 4);

  // Helper for human-readable dates
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* Reusable Top Header Navbar */}
      <AdminHeader
        title="Dashboard Overview"
        actions={
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FF9E15]" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        }
      />

      {/* Scrollable Content Below Header */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-100">
        <div className="max-w-7xl w-full mx-auto space-y-6">

          {/* 
            ====================================================================
            1. REAL-TIME STATS / KPI CARDS (Connected to Supabase live data)
            ====================================================================
          */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {/* Products Card */}
            <Link
              href="/admin/products"
              className="group bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/90 shadow-xs hover:border-[#FF9E15]/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider group-hover:text-black transition-colors">
                  Products
                </span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#FF9E15] group-hover:bg-[#FF9E15] group-hover:text-white transition-all flex items-center justify-center">
                  <Package className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {productsLoading ? "..." : products.length}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">items</span>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium mt-1 truncate">
                  {categories.length} categories active
                </p>
              </div>
            </Link>

            {/* Categories Card */}
            <Link
              href="/admin/categories"
              className="group bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/90 shadow-xs hover:border-blue-500/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider group-hover:text-black transition-colors">
                  Categories
                </span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center">
                  <Tag className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {categoriesLoading ? "..." : categories.length}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">total</span>
                </div>
                <p className="text-[11px] text-blue-600 font-semibold mt-1 truncate flex items-center gap-1">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span>{categoriesWithCatalog.length} with PDF Catalogues</span>
                </p>
              </div>
            </Link>

            {/* Enquiries Card */}
            <Link
              href="/admin/enquiries"
              className="group bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/90 shadow-xs hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider group-hover:text-black transition-colors">
                  Enquiries
                </span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {enquiriesLoading ? "..." : enquiries.length}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">messages</span>
                </div>
                <p className="text-[11px] text-amber-600 font-semibold mt-1 truncate flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{pendingEnquiries.length} pending review</span>
                </p>
              </div>
            </Link>

            {/* Store Content Card */}
            <Link
              href="/admin/store/hero"
              className="group bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/90 shadow-xs hover:border-purple-500/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider group-hover:text-black transition-colors">
                  Storefront
                </span>
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all flex items-center justify-center">
                  <Store className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {heroSlides.length}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">hero slides</span>
                </div>
                <p className="text-[11px] text-purple-600 font-semibold mt-1 truncate flex items-center gap-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{brandsData?.brands?.length || 0} partner brands</span>
                </p>
              </div>
            </Link>
          </div>

          {/* 
            ====================================================================
            2. TWO-COLUMN MAIN CONTENT (Recent Enquiries + Categories / Products)
            ====================================================================
          */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Columns: Recent Enquiries & Recent Products */}
            <div className="lg:col-span-2 space-y-6">

              {/* Recent Enquiries Box */}
              <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Recent Customer Enquiries</h3>
                      <p className="text-[11px] text-neutral-500">Direct inquiries submitted from website</p>
                    </div>
                  </div>

                  <Link
                    href="/admin/enquiries"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF9E15] hover:text-[#e0890f] transition-colors"
                  >
                    <span>View all ({enquiries.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-neutral-100">
                  {enquiriesLoading ? (
                    <div className="p-8 text-center text-xs text-neutral-400">Loading enquiries...</div>
                  ) : recentEnquiries.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-neutral-700">No customer enquiries yet</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        New inquiries from the website contact forms will appear here live.
                      </p>
                    </div>
                  ) : (
                    recentEnquiries.map((item) => {
                      const isPending = item.status === "pending";
                      return (
                        <div
                          key={item.id}
                          className="p-4 hover:bg-neutral-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-neutral-900">{item.name}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                  isPending
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}
                              >
                                {isPending ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                                <span className="capitalize">{item.status}</span>
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                • {formatTimeAgo(item.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-600">
                              <a
                                href={`tel:${item.mobile_number}`}
                                className="inline-flex items-center gap-1 text-[#FF9E15] hover:underline font-medium"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{item.mobile_number}</span>
                              </a>
                              {item.email && (
                                <a
                                  href={`mailto:${item.email}`}
                                  className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 truncate"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{item.email}</span>
                                </a>
                              )}
                            </div>

                            {item.note && (() => {
                              const productMatch = item.note.match(/\[Product:\s*([^\]]+)\]/i);
                              const productName = productMatch ? productMatch[1].trim() : null;
                              const cleanNote = item.note.replace(/\[Product:\s*[^\]]+\]\n?/i, "").trim();

                              return (
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {productName && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200/80">
                                      <Tag className="w-2.5 h-2.5 text-[#FF9E15]" />
                                      <span className="truncate max-w-[220px]">{productName}</span>
                                    </span>
                                  )}
                                  {cleanNote && (
                                    <span className="text-xs text-neutral-700 font-normal line-clamp-1 bg-neutral-50 px-2 py-0.5 rounded-xs border border-neutral-200/70">
                                      {cleanNote}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <Link
                              href="/admin/enquiries"
                              className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xs transition-colors"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recent Products Showcase */}
              <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-amber-50 text-[#FF9E15] flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Latest Products</h3>
                      <p className="text-[11px] text-neutral-500">Products currently published in the catalog</p>
                    </div>
                  </div>

                  <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF9E15] hover:text-[#e0890f] transition-colors"
                  >
                    <span>Manage all ({products.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4">
                  {productsLoading ? (
                    <div className="p-6 text-center text-xs text-neutral-400">Loading products...</div>
                  ) : recentProducts.length === 0 ? (
                    <div className="p-6 text-center">
                      <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-neutral-700">No products created yet</p>
                      <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#FF9E15] hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add your first product</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-md bg-neutral-200 relative overflow-hidden shrink-0 border border-neutral-300">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-neutral-900 truncate">{p.name}</h4>
                            <span className="text-[10px] font-medium text-[#FF9E15] bg-amber-50 px-1.5 py-0.5 rounded-xs mt-0.5 inline-block truncate max-w-full">
                              {p.category_name || "General"}
                            </span>
                          </div>
                          <Link
                            href="/admin/products"
                            className="p-1 text-neutral-400 hover:text-black transition-colors"
                            title="Edit product"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Categories & PDF Catalogue Status + Company Profile */}
            <div className="space-y-6">

              {/* Categories & Catalogues Overview */}
              <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Categories & Catalogues</h3>
                  </div>
                  <Link
                    href="/admin/categories"
                    className="text-xs font-semibold text-[#FF9E15] hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                <div className="divide-y divide-neutral-100 max-h-[360px] overflow-y-auto">
                  {categoriesLoading ? (
                    <div className="p-6 text-center text-xs text-neutral-400">Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">No categories found</div>
                  ) : (
                    categories.map((cat) => {
                      const count = products.filter(
                        (p) => p.category_id === cat.id || p.category_name?.toLowerCase() === cat.name.toLowerCase()
                      ).length;
                      const catalogCount = cat.catalogs?.length || (cat.catalog_url ? 1 : 0);
                      const catalogPreviewUrl = cat.catalogs?.[0]?.url || cat.catalog_url;

                      return (
                        <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-neutral-100 relative overflow-hidden shrink-0 border border-neutral-200">
                              {cat.image_url ? (
                                <Image
                                  src={cat.image_url}
                                  alt={cat.name}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <Tag className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">{cat.name}</p>
                              <span className="text-[10px] text-neutral-500 font-medium">
                                {count} {count === 1 ? "product" : "products"}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {catalogCount > 0 && catalogPreviewUrl ? (
                              <a
                                href={catalogPreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 hover:bg-emerald-100"
                                title={`${catalogCount} PDF Catalogue(s)`}
                              >
                                <FileText className="w-2.5 h-2.5" />
                                <span>{catalogCount > 1 ? `${catalogCount} PDFs` : "PDF"}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-xs">
                                No PDF
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Store Profile & Contact Info Card */}
              <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Store Settings</h3>
                  </div>
                  <Link
                    href="/admin/settings/company"
                    className="text-xs font-semibold text-[#FF9E15] hover:underline"
                  >
                    Edit Info
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-600">
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-[#FF9E15] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-800 block">Phone</span>
                      <span>{companySettings?.phone || "+91 99408 88874"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-[#FF9E15] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-800 block">Email</span>
                      <span className="truncate">{companySettings?.email || "lindahomedecor007@gmail.com"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF9E15] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-800 block">Address</span>
                      <span className="line-clamp-2">{companySettings?.address || "Chennai, Tamil Nadu, India"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <Link
                    href="/admin/settings/company"
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-sm transition-colors"
                  >
                    <span>Update Contact & Social Info</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF9E15]" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
