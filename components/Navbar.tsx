"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

// Fires synchronously before browser paint on client; falls back to useEffect on server
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Navbar() {
  const pathname = usePathname();
  const { categories } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // useLayoutEffect fires synchronously before paint — reads real scrollY before anything
  // is visible, so there is never a white-flash on transparent pages.
  useIsomorphicLayoutEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Early return for admin pages (after all hooks are called)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isHomePage =
    !pathname ||
    pathname === "/" ||
    pathname === "" ||
    pathname.startsWith("/#") ||
    pathname.startsWith("/?");

  // Navbar is transparent ONLY on the home page when not scrolled.
  // On all other pages or when scrolled, it is white.
  const isTransparent = isHomePage && !isScrolled;

  const handleProductsMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsProductsDropdownOpen(true);
  };

  const handleProductsMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProductsDropdownOpen(false);
    }, 150);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-colors duration-300 ${
          isTransparent
            ? "bg-transparent shadow-none"
            : "bg-white shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 select-none"
            >
              <Image
                src="/logo/logo-with-name.png"
                alt="Linda Home Decor Logo"
                width={160}
                height={50}
                priority
                className="h-11 w-auto object-contain"
              />
            </Link>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
              {navLinks.map((link) => {
                if (link.name === "Products") {
                  return (
                    <div
                      key={link.name}
                      className="relative py-4"
                      onMouseEnter={handleProductsMouseEnter}
                      onMouseLeave={handleProductsMouseLeave}
                    >
                      <Link
                        href="/products"
                        className={`font-medium text-base inline-flex items-center gap-1.5 transition-colors duration-200 ${
                          isProductsDropdownOpen
                            ? "text-[#FF9E15]"
                            : isTransparent
                            ? "text-white hover:text-[#FF9E15]"
                            : "text-neutral-900 hover:text-[#FF9E15]"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isProductsDropdownOpen
                              ? "rotate-180 text-[#FF9E15]"
                              : isTransparent
                              ? "text-white"
                              : "text-neutral-900"
                          }`}
                        />
                      </Link>

                      {/* Desktop Categories Dropdown */}
                      <AnimatePresence>
                        {isProductsDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-[85%] left-0 pt-2 z-50 min-w-[210px]"
                          >
                            <div className="bg-white rounded-md shadow-xl py-2 overflow-hidden border-none">
                              <Link
                                href="/products"
                                onClick={() => setIsProductsDropdownOpen(false)}
                                className="block px-4 py-2 text-sm text-[#FF9E15] hover:bg-neutral-50 font-semibold"
                              >
                                All Products
                              </Link>
                              {categories &&
                                categories.length > 0 &&
                                categories.map((cat) => (
                                  <Link
                                    key={cat.id}
                                    href={`/products?category=${cat.slug || cat.id}`}
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                    className="block px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50 hover:text-[#FF9E15] transition-colors font-medium"
                                  >
                                    {cat.name}
                                  </Link>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-medium text-base transition-colors duration-200 ${
                      isTransparent
                        ? "text-white hover:text-[#FF9E15]"
                        : "text-neutral-900 hover:text-[#FF9E15]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Enquiry CTA Button (Desktop) */}
            <div className="hidden md:flex items-center">
              <Link
                href="/contact"
                className="bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium px-8 py-2.5 rounded-full shadow-sm transition-all duration-200"
              >
                Enquiry
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 focus:outline-none transition-colors ${
                  isTransparent ? "text-white" : "text-neutral-900"
                }`}
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Slides in from the right, pure white background, no borders) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50"
              onClick={closeMobileMenu}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-[80%] max-w-sm h-full bg-white text-neutral-900 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto border-none"
            >
              <div>
                {/* Drawer Top Header: Logo + Close Button */}
                <div className="flex items-center justify-between pb-6">
                  <Link href="/" onClick={closeMobileMenu}>
                    <Image
                      src="/logo/logo-with-name.png"
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
                    className="p-1 text-neutral-900 hover:text-[#FF9E15] transition-colors focus:outline-none"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Drawer Navigation Links */}
                <nav className="flex flex-col space-y-3 pt-2">
                  {navLinks.map((link) => {
                    if (link.name === "Products") {
                      return (
                        <div key={link.name} className="flex flex-col">
                          <div className="flex items-center justify-between py-2">
                            <Link
                              href="/products"
                              onClick={closeMobileMenu}
                              className="text-neutral-900 font-medium text-base hover:text-[#FF9E15] transition-colors"
                            >
                              Products
                            </Link>
                            {categories && categories.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setIsMobileProductsOpen((prev) => !prev)}
                                className="p-1 text-neutral-600 hover:text-[#FF9E15] focus:outline-none"
                                aria-label="Toggle categories"
                              >
                                <ChevronDown
                                  className={`w-5 h-5 transition-transform duration-200 ${
                                    isMobileProductsOpen ? "rotate-180 text-[#FF9E15]" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Mobile Subcategories (from database only) */}
                          {isMobileProductsOpen && categories && categories.length > 0 && (
                            <div className="pl-4 pb-2 space-y-2.5 pt-1">
                              <Link
                                href="/products"
                                onClick={closeMobileMenu}
                                className="block text-sm font-semibold text-[#FF9E15]"
                              >
                                • All Products
                              </Link>
                              {categories.map((cat) => (
                                <Link
                                  key={cat.id}
                                  href={`/products?category=${cat.slug || cat.id}`}
                                  onClick={closeMobileMenu}
                                  className="block text-sm text-neutral-700 hover:text-[#FF9E15] transition-colors"
                                >
                                  {cat.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="text-neutral-900 font-medium text-base py-2 hover:text-[#FF9E15] transition-colors"
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Enquiry CTA in Mobile Drawer */}
              <div className="pt-6 mt-6">
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="block w-full text-center bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium py-3 rounded-full shadow-sm transition-colors"
                >
                  Enquiry
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}