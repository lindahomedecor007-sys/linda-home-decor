"use client";

import React from "react";
import Link from "next/link";
import { FileText, Download, ArrowRight, Sparkles } from "lucide-react";

export interface CatalogDownloadSectionProps {
  categoryName?: string;
  catalogUrl?: string | null;
  variant?: "bar" | "banner" | "card";
  className?: string;
  showEnquiryFallback?: boolean;
}

export default function CatalogDownloadSection({
  categoryName = "Products",
  catalogUrl,
  variant = "bar",
  className = "",
  showEnquiryFallback = true,
}: CatalogDownloadSectionProps) {
  const hasCatalog = Boolean(catalogUrl && catalogUrl.trim());
  const displayTitle =
    categoryName.toLowerCase() === "all products" || categoryName.toLowerCase() === "products"
      ? "Linda Home Decor Complete Catalogue"
      : `${categoryName} Collection Catalogue`;

  // 1. BANNER VARIANT (Full width featured section)
  if (variant === "banner") {
    if (!hasCatalog && !showEnquiryFallback) return null;

    return (
      <div className={`w-full bg-neutral-900 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-y border-neutral-800 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left max-w-2xl">
            <div className="w-12 h-12 rounded-sm bg-[#FF9E15]/15 border border-[#FF9E15]/30 flex items-center justify-center shrink-0 text-[#FF9E15]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#FF9E15]">
                  PDF Download
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded-xs">
                  High Resolution
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-medium tracking-tight text-white mt-0.5">
                {displayTitle}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                {hasCatalog
                  ? "Download the full design specifications, material details, and high-res imagery."
                  : "Request our custom catalogue and pricing details directly from our interior design specialists."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            {hasCatalog ? (
              <a
                href={catalogUrl!}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF9E15] hover:bg-[#e0890f] text-white text-xs sm:text-sm font-semibold rounded-xs shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Catalogue (PDF)</span>
              </a>
            ) : (
              <Link
                href="/contact"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-medium rounded-xs transition-colors"
              >
                <span>Request Catalogue</span>
                <ArrowRight className="w-4 h-4 text-[#FF9E15]" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. CARD VARIANT (Compact Box)
  if (variant === "card") {
    if (!hasCatalog && !showEnquiryFallback) return null;

    return (
      <div className={`p-5 rounded-sm border border-neutral-200 bg-neutral-50/80 shadow-xs flex flex-col justify-between gap-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-amber-100 text-[#FF9E15] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 leading-snug">
              {displayTitle}
            </h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              {hasCatalog
                ? "Official PDF catalogue including textures, dimensions, and shades."
                : "Get the custom brochure delivered to your email or WhatsApp."}
            </p>
          </div>
        </div>

        {hasCatalog ? (
          <a
            href={catalogUrl!}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9E15] hover:bg-[#e0890f] text-white text-xs font-semibold rounded-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Catalogue</span>
          </a>
        ) : (
          <Link
            href="/contact"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xs transition-colors"
          >
            <span>Request Brochure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    );
  }

  // 3. BAR VARIANT (Default: Sleek strip between Banner & Filter bar)
  if (!hasCatalog && !showEnquiryFallback) return null;

  return (
    <div
      className={`w-full bg-neutral-950 text-white border-b border-neutral-800/80 transition-all ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4 text-left">
          {/* Left info badge & title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#FF9E15]/20 text-[#FF9E15] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium text-white truncate block">
                {displayTitle}
              </span>
            </div>
          </div>

          {/* Right action button (stays on same line on mobile) */}
          <div className="shrink-0">
            {hasCatalog ? (
              <a
                href={catalogUrl!}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xs shadow-xs transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="sm:hidden">Download</span>
                <span className="hidden sm:inline">Download Catalogue</span>
              </a>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xs transition-colors whitespace-nowrap"
              >
                <span className="sm:hidden">Request</span>
                <span className="hidden sm:inline">Request Catalogue</span>
                <ArrowRight className="w-3 h-3 text-[#FF9E15]" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
