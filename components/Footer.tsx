"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  WhatsappIcon,
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/SocialIcons";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "Services", href: "/services" },
  { name: "Contact Us", href: "/contact" },
];

export default function Footer() {
  const pathname = usePathname();
  const { companySettings, categories } = useStore();
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({});

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Hide footer in admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  // Clean numbers for WhatsApp link
  const rawNum =
    companySettings?.whatsapp_number || companySettings?.phone || "";
  const cleanNum = rawNum.replace(/[^0-9]/g, "");
  const whatsappHref = cleanNum ? `https://wa.me/${cleanNum}` : "#";

  return (
    <footer className="w-full bg-black text-white selection:bg-[#FF9E15] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
          {/* Column 1: Brand Info, Description & Address/Contact Details (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-end group">
              <Image
                src="/logo/logo.png"
                alt="Linda Home Decor"
                width={48}
                height={48}
                className="h-10 object-contain"
              />
              <span className="text-base sm:text-lg font-bold tracking-widest text-white uppercase group-hover:text-[#FF9E15] transition-colors leading-tight">
                LINDA HOME DECOR
              </span>
            </Link>

            <p className="text-sm text-neutral-300 m-0 max-w-sm">
              {companySettings?.tagline ||
                "Transforming spaces with elegance and precision. Discover curated furniture, custom interiors, and premium decor solutions."}
            </p>

            {/* Address & Contact Details */}
            <div className="space-y-3 pt-2 text-sm text-neutral-300">
              {/* Address */}
              {companySettings?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white shrink-0 mt-1" />
                  <p className="leading-snug">
                    {companySettings.address}
                    {companySettings.city ? `, ${companySettings.city}` : ""}
                    {companySettings.state ? `, ${companySettings.state}` : ""}
                    {companySettings.postal_code ? ` - ${companySettings.postal_code}` : ""}
                    {companySettings.country ? `, ${companySettings.country}` : ""}
                  </p>
                </div>
              )}

              {/* Phone */}
              {companySettings?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white shrink-0" />
                  <a
                    href={`tel:${companySettings.phone}`}
                    className="hover:text-[#FF9E15] font-medium transition-colors"
                  >
                    {companySettings.phone}
                    {companySettings.alternate_phone && (
                      <span className="text-xs text-neutral-400 ml-2">
                        / {companySettings.alternate_phone}
                      </span>
                    )}
                  </a>
                </div>
              )}

              {/* Email */}
              {companySettings?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white shrink-0" />
                  <a
                    href={`mailto:${companySettings.email}`}
                    className="hover:text-[#FF9E15] transition-colors truncate"
                  >
                    {companySettings.email}
                  </a>
                </div>
              )}

              {/* Working Hours */}
              {companySettings?.opening_hours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span className="text-xs text-neutral-300 leading-snug">
                    {companySettings.opening_hours}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links / Pages (lg:col-span-2) - Accordion on mobile */}
          <div className="lg:col-span-2 border-b border-white/10 md:border-b-0 pb-4 md:pb-0">
            {/* Desktop Header */}
            <h4 className="hidden md:block text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5">
              Quick Links
            </h4>

            {/* Mobile Accordion Toggle */}
            <button
              type="button"
              onClick={() => toggleAccordion("quickLinks")}
              className="flex md:hidden items-center justify-between w-full py-1 text-sm font-bold text-white uppercase tracking-wider text-left cursor-pointer select-none"
              aria-expanded={Boolean(openAccordions["quickLinks"])}
            >
              <span>Quick Links</span>
              <ChevronDown
                className={`w-4 h-4 text-[#FF9E15] transition-transform duration-200 ${
                  openAccordions["quickLinks"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Content (Collapsible on mobile, always visible on md+) */}
            <div
              className={`transition-all duration-200 ease-in-out md:!block ${
                openAccordions["quickLinks"] ? "block pt-3" : "hidden md:block md:pt-4"
              }`}
            >
              <ul className="space-y-2.5 text-sm">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-neutral-300 hover:text-[#FF9E15] transition-colors flex items-center gap-1.5 group py-0.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF9E15] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Categories (lg:col-span-2) - Accordion on mobile */}
          <div className="lg:col-span-2 border-b border-white/10 md:border-b-0 pb-4 md:pb-0">
            {/* Desktop Header */}
            <h4 className="hidden md:block text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5">
              Collections
            </h4>

            {/* Mobile Accordion Toggle */}
            <button
              type="button"
              onClick={() => toggleAccordion("collections")}
              className="flex md:hidden items-center justify-between w-full py-1 text-sm font-bold text-white uppercase tracking-wider text-left cursor-pointer select-none"
              aria-expanded={Boolean(openAccordions["collections"])}
            >
              <span>Collections</span>
              <ChevronDown
                className={`w-4 h-4 text-[#FF9E15] transition-transform duration-200 ${
                  openAccordions["collections"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Content (Collapsible on mobile, always visible on md+) */}
            <div
              className={`transition-all duration-200 ease-in-out md:!block ${
                openAccordions["collections"] ? "block pt-3" : "hidden md:block md:pt-4"
              }`}
            >
              <ul className="space-y-2.5 text-sm">
                {categories && categories.length > 0 ? (
                  categories.slice(0, 6).map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                        className="text-neutral-300 hover:text-[#FF9E15] transition-colors flex items-center gap-1.5 group py-0.5"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-[#FF9E15] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link href="/products" className="text-neutral-300 hover:text-[#FF9E15] transition-colors block py-0.5">
                        Living Room
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="text-neutral-300 hover:text-[#FF9E15] transition-colors block py-0.5">
                        Bedroom
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="text-neutral-300 hover:text-[#FF9E15] transition-colors block py-0.5">
                        Dining & Kitchen
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="text-neutral-300 hover:text-[#FF9E15] transition-colors block py-0.5">
                        Office Decor
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Column 4: Connect With Us & Social Media (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5">
              Connect With Us
            </h4>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Follow our social channels for latest interior designs, collections, and workspace updates.
            </p>
            <div className="flex items-center gap-4 pt-1">
              {/* WhatsApp */}
              <a
                href={whatsappHref}
                target={whatsappHref !== "#" ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF9E15] transition-colors duration-200"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <WhatsappIcon className="w-5 h-5" />
              </a>

              {/* Instagram */}
              <a
                href={companySettings?.instagram_url || "#"}
                target={companySettings?.instagram_url ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF9E15] transition-colors duration-200"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>

              {/* Facebook */}
              <a
                href={companySettings?.facebook_url || "#"}
                target={companySettings?.facebook_url ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF9E15] transition-colors duration-200"
                aria-label="Facebook"
                title="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>

              {/* YouTube */}
              <a
                href={companySettings?.youtube_url || "#"}
                target={companySettings?.youtube_url ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF9E15] transition-colors duration-200"
                aria-label="YouTube"
                title="YouTube"
              >
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>
            © {currentYear}{" "}
            <span className="text-white font-medium">
              {companySettings?.company_name || "Linda Home Decor"}
            </span>
            . All rights reserved.
          </p>
          <p className="text-neutral-400 text-xs">
            Crafted by{" "}
            <a
              href="https://ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9E15] hover:underline font-medium transition-colors"
            >
              Ekodrix
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#FF9E15] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-[#FF9E15] transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/contact" className="hover:text-[#FF9E15] transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
