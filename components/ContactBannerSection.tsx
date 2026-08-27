"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CompanySettingsData } from "@/lib/companySettings";
import { useStore } from "@/context/StoreContext";

interface ContactBannerSectionProps {
  companySettings?: CompanySettingsData | null;
  className?: string;
  backgroundImage?: string;
}

/**
 * Formats the phone number from company settings.
 */
function formatDisplayPhone(rawPhone?: string | null): { display: string; href: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      display: "+91 83040 65895",
      href: "tel:+918304065895",
    };
  }

  const trimmed = rawPhone.trim();
  const cleanDigits = trimmed.replace(/[^0-9+]/g, "");

  // If already contains country code with plus
  if (trimmed.startsWith("+")) {
    return {
      display: trimmed,
      href: `tel:${cleanDigits}`,
    };
  }

  // If 10 digits without prefix
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return {
      display: `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`,
      href: `tel:+91${digitsOnly}`,
    };
  }

  return {
    display: trimmed,
    href: `tel:${cleanDigits}`,
  };
}

export default function ContactBannerSection({
  companySettings: propCompanySettings,
  className = "",
  backgroundImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
}: ContactBannerSectionProps) {
  const { companySettings: contextCompanySettings } = useStore();
  const companySettings = propCompanySettings || contextCompanySettings;

  const rawPhone =
    companySettings?.phone ||
    companySettings?.alternate_phone ||
    "+91 83040 65895";

  const { display: phoneDisplay, href: phoneHref } = formatDisplayPhone(rawPhone);

  return (
    <section className={`w-full py-8 sm:py-12 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner with border radius sm and dark luxury background */}
        <div className="relative w-full rounded-sm overflow-hidden bg-[#0A192F] shadow-lg min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex items-center justify-center">
          {/* Background Image with Dark Navy Atmosphere Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={backgroundImage}
              alt="Linda Home Decor Enquiry"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-700"
              priority
            />
            {/* Dark Navy / Charcoal Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#061220]/95 via-[#0A1A2F]/90 to-[#061220]/95" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#061220]/60 via-transparent to-[#061220]/80" />

            {/* Subtle Abstract Wave Silhouettes matching the visual style */}
            <svg
              className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
              viewBox="0 0 1200 400"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M-100,200 C300,50 600,380 1300,120 L1300,400 L-100,400 Z"
                fill="#132B45"
                fillOpacity="0.5"
              />
              <path
                d="M-50,280 C400,160 800,320 1250,180 L1250,400 L-50,400 Z"
                fill="#0E2238"
                fillOpacity="0.6"
              />
            </svg>
          </div>

          {/* Centered Enquiry Content */}
          <div className="relative z-10 w-full py-12 sm:py-16 md:py-20 px-6 sm:px-10 text-center flex flex-col items-center justify-center">
            {/* Title: For Any Queries Contact : */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-tight mb-2 sm:mb-3">
              For Any Queries Contact :
            </h2>

            {/* Large Phone Number */}
            <a
              href={phoneHref}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold sm:font-black text-white tracking-tight leading-none hover:text-neutral-200 transition-colors my-2 sm:my-3"
              title={`Call ${phoneDisplay}`}
            >
              {phoneDisplay}
            </a>

            {/* CTA Button with sm border radius and glassmorphism styling */}
            <div className="mt-6 sm:mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 sm:px-9 sm:py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/25 backdrop-blur-md text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-sm shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>CONTACT US</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
