"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { CompanySettingsData } from "@/lib/companySettings";
import { useStore } from "@/context/StoreContext";

interface EnquirySectionProps {
  companySettings?: CompanySettingsData | null;
  className?: string;
  backgroundImage?: string;
}

/**
 * Formats the phone number from company settings cleanly.
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

  // If phone already starts with +, display it directly
  if (trimmed.startsWith("+")) {
    return {
      display: trimmed,
      href: `tel:${cleanDigits}`,
    };
  }

  // If 10 digits without country code
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

export default function EnquirySection({
  companySettings: propCompanySettings,
  className = "",
  backgroundImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
}: EnquirySectionProps) {
  const { companySettings: contextCompanySettings } = useStore();
  const companySettings = propCompanySettings || contextCompanySettings;

  const rawPhone =
    companySettings?.phone ||
    companySettings?.alternate_phone ||
    "+91 83040 65895";

  const { display: phoneDisplay, href: phoneHref } = formatDisplayPhone(rawPhone);

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#071629] min-h-[200px] sm:min-h-[220px] md:min-h-[240px] flex items-center justify-center ${className}`}
    >
      {/* Background Image with Dark Blue Atmosphere Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Linda Home Decor Enquiry"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
          priority
        />
        {/* Deep Navy / Dark Blue Atmospheric Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061426]/95 via-[#0A1F38]/90 to-[#061426]/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061426]/70 via-transparent to-[#061426]/85" />

        {/* Subtle Abstract Wave Silhouettes matching the visual style */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100,190 C280,60 580,360 1300,130 L1300,400 L-100,400 Z"
            fill="#132B45"
            fillOpacity="0.6"
          />
          <path
            d="M-50,270 C380,170 780,310 1250,190 L1250,400 L-50,400 Z"
            fill="#0E2238"
            fillOpacity="0.7"
          />
        </svg>
      </div>

      {/* Centered Enquiry Content - Compact & Refined Sizes */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        {/* Title: For Any Queries Contact : */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-tight mb-1 sm:mb-1.5">
          For Any Queries Contact :
        </h2>

        {/* Scaled-down Phone Number */}
        <a
          href={phoneHref}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight hover:text-neutral-200 transition-colors my-1 sm:my-1.5"
          title={`Call ${phoneDisplay}`}
        >
          {phoneDisplay}
        </a>

        {/* CTA Button matching navbar button color (#FF9E15) with sm border radius */}
        <div className="mt-3.5 sm:mt-4">
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 sm:px-7 sm:py-2.5 bg-[#FF9E15] hover:bg-[#e0890f] active:bg-[#c87807] text-white font-medium text-xs sm:text-sm uppercase tracking-wider rounded-sm shadow-sm hover:shadow-md transition-all duration-200 group"
            title={`Call ${phoneDisplay}`}
          >
            <span>CONTACT US</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </section>
  );
}
