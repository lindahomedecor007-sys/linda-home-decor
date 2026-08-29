"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { trackWhatsAppEnquiry } from "@/lib/enquiries";
import { Phone, X, MessageCircle, PhoneCall } from "lucide-react";
import { WhatsappIcon } from "@/components/SocialIcons";

export default function FloatingContact() {
  const pathname = usePathname();
  const { companySettings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Resolve numbers from company details
  const rawPhone = companySettings?.phone || companySettings?.alternate_phone || "";
  const rawWhatsapp = companySettings?.whatsapp_number || companySettings?.phone || "";

  const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, "");

  const phoneHref = cleanPhone ? `tel:${cleanPhone}` : "tel:";
  const whatsappHref = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}`
    : "https://wa.me/";

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-center w-14 pointer-events-auto select-none"
    >
      {/* Floating Options Menu - Icon only */}
      <div
        className={`flex flex-col items-center gap-3.5 mb-3.5 w-full transition-all duration-300 ease-out origin-bottom ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        }`}
      >
        {/* WhatsApp Icon Button */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setIsOpen(false);
            trackWhatsAppEnquiry({
              note: `[WhatsApp Direct Contact] Clicked floating WhatsApp button on page: ${pathname || "/"}`,
            });
          }}
          title="Chat on WhatsApp"
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsappIcon className="w-6 h-6 fill-current" />
        </a>

        {/* Direct Phone Call Icon Button */}
        <a
          href={phoneHref}
          onClick={() => setIsOpen(false)}
          title="Call Us"
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Call our phone line"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* Main Trigger FAB */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-neutral-900 rotate-90 shadow-neutral-900/30"
            : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/40"
        }`}
      >
        {/* Pulsing ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25 pointer-events-none" />
        )}

        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <PhoneCall className="w-6 h-6 transition-transform" />
          )}
        </div>
      </button>
    </div>
  );
}
