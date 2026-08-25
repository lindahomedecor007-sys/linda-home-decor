"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isHomePage = pathname === "/";
  const isSolidNav = !isHomePage || isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isSolidNav
          ? "bg-white shadow-xs"
          : "bg-transparent shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <Image
              src="/logo/logo-with-name.png"
              alt="Linda Home Decor Logo"
              width={160}
              height={50}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium text-base transition-colors duration-200 hover:text-[#FF9E15] ${
                  isSolidNav ? "text-black" : "text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Enquiry Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/contact"
              className="bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium px-10 py-1.5 rounded-xs shadow-sm transition-all duration-200"
            >
              Enquiry
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className={`inline-flex items-center justify-center p-2 focus:outline-none transition-all duration-300 ease-in-out ${
                isSolidNav ? "text-black" : "text-white"
              } ${isMobileMenuOpen ? "rotate-90" : "rotate-0"}`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Right Side, 80% width with motion slide animation) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity animate-fade-in"
            onClick={closeMobileMenu}
          />

          {/* Right Drawer Content */}
          <div className="relative z-10 w-[80%] h-full bg-white shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slide-in-right">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <Link href="/" onClick={closeMobileMenu}>
                  <Image
                    src="/logo/logo.png"
                    alt="Linda Home Decor Logo"
                    width={140}
                    height={45}
                    priority
                    className="h-10 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-1.5 text-black focus:outline-none"
                  aria-label="Close menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex flex-col space-y-3 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="text-black font-medium text-base py-2 transition-colors duration-200 hover:text-[#FF9E15]/90"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Enquiry Button */}
            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="block w-full text-center bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium px-10 py-2.5 rounded-xs shadow-sm transition-all duration-200"
              >
                Enquiry
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
