"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { categories } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const [isProductsHovered, setIsProductsHovered] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef(0);

  // --- Scroll tracking (solid bg + mobile hide/reveal) ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Solid background state
      setIsScrolled(currentScrollY > 20);

      // Mobile smart hide on scroll down / reveal on scroll up
      if (currentScrollY <= 20) {
        setIsMobileNavVisible(true);
      } else {
        if (currentScrollY > lastScrollYRef.current + 5) {
          // Scrolling down -> hide on mobile
          setIsMobileNavVisible(false);
        } else if (currentScrollY < lastScrollYRef.current - 5) {
          // Scrolling up (scroll back) -> show on mobile
          setIsMobileNavVisible(true);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Lock body scroll when mobile menu is open ---
  // NOTE: this hook MUST stay above the `if (pathname?.startsWith("/admin"))`
  // early return below. Hooks can never be called conditionally / after an
  // early return, or React loses track of hook order between renders and
  // component state (like isScrolled) starts behaving unpredictably.
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

  // All hooks are declared above this line — safe to return conditionally now.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  };

  const handleMouseEnterProducts = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsProductsHovered(true);
  };

  const handleMouseLeaveProducts = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProductsHovered(false);
    }, 150);
  };

  const isHomePage =
    !pathname ||
    pathname === "/" ||
    pathname === "" ||
    pathname.startsWith("/#") ||
    pathname.startsWith("/?");
  const isSolidNav = !isHomePage || isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-in-out md:translate-y-0 ${
          isMobileNavVisible || isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        } ${
          isSolidNav
            ? "bg-white shadow-md"
            : "bg-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
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
              {navLinks.map((link) => {
                if (link.name === "Products") {
                  return (
                    <div
                      key={link.name}
                      className="relative py-4"
                      onMouseEnter={handleMouseEnterProducts}
                      onMouseLeave={handleMouseLeaveProducts}
                    >
                      <Link
                        href="/products"
                        className={`font-medium text-base transition-colors duration-200 hover:text-[#FF9E15] inline-flex items-center gap-1.5 ${
                          isSolidNav ? "text-black" : "text-white"
                        } ${isProductsHovered ? "text-[#FF9E15]" : ""}`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isProductsHovered ? "rotate-180 text-[#FF9E15]" : ""
                          }`}
                        />
                      </Link>

                      {/* Desktop Categories Dropdown Menu */}
                      <AnimatePresence>
                        {isProductsHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-[85%] left-0 pt-2 z-50 min-w-[200px]"
                          >
                            <div className="bg-white rounded-sm shadow-xl border border-neutral-100 py-1.5 overflow-hidden">
                              <Link
                                href="/products"
                                onClick={() => setIsProductsHovered(false)}
                                className="block px-4 py-2 text-sm text-[#FF9E15] hover:bg-[#FF9E15] hover:text-white transition-colors duration-150 font-semibold border-b border-neutral-100"
                              >
                                All Products
                              </Link>
                              {categories && categories.length > 0 ? (
                                categories.map((cat) => (
                                  <Link
                                    key={cat.id}
                                    href={`/products?category=${cat.slug || cat.id}`}
                                    onClick={() => setIsProductsHovered(false)}
                                    className="block px-4 py-2 text-sm text-neutral-800 hover:bg-[#FF9E15] hover:text-white transition-colors duration-150 font-medium"
                                  >
                                    {cat.name}
                                  </Link>
                                ))
                              ) : null}
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
                    className={`font-medium text-base transition-colors duration-200 hover:text-[#FF9E15] ${
                      isSolidNav ? "text-black" : "text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Enquiry Button */}
            <div className="hidden md:flex items-center">
              <Link
                href="/contact"
                className="bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium px-10 py-2 rounded-full shadow-sm transition-all duration-200"
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
      </header>

      {/* Mobile Drawer (Outside transformed header so fixed inset-0 spans full viewport) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50"
              onClick={closeMobileMenu}
            />

            {/* Right Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-[82%] max-w-sm h-full max-h-screen bg-white text-neutral-900 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
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
                    className="p-1.5 text-neutral-900 hover:text-[#FF9E15] transition-colors focus:outline-none cursor-pointer"
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
                <nav className="flex flex-col space-y-2 pt-4">
                  {navLinks.map((link) => {
                    if (link.name === "Products") {
                      return (
                        <div key={link.name} className="flex flex-col pb-2">
                          <div className="flex items-center justify-between py-2">
                            <Link
                              href="/products"
                              onClick={closeMobileMenu}
                              className="text-neutral-900 font-medium text-base transition-colors duration-200 hover:text-[#FF9E15]"
                            >
                              Products
                            </Link>
                            {categories && categories.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setIsMobileProductsOpen((prev) => !prev)}
                                className="p-1 text-neutral-500 hover:text-[#FF9E15] focus:outline-none cursor-pointer"
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

                          {/* Expandable Mobile Subcategories */}
                          {isMobileProductsOpen && categories && categories.length > 0 && (
                            <div className="pl-3 pb-2 space-y-2 border-l-2 border-[#FF9E15]/40 ml-2 mt-1">
                              <Link
                                href="/products"
                                onClick={closeMobileMenu}
                                className="block py-1 text-xs font-semibold text-[#FF9E15] uppercase tracking-wider"
                              >
                                • All Products
                              </Link>
                              {categories.map((cat) => (
                                <Link
                                  key={cat.id}
                                  href={`/products?category=${cat.slug || cat.id}`}
                                  onClick={closeMobileMenu}
                                  className="flex items-center gap-2 py-1 text-sm text-neutral-600 hover:text-[#FF9E15] transition-colors"
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
                        className="text-neutral-900 font-medium text-base py-2 transition-colors duration-200 hover:text-[#FF9E15]"
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Enquiry Button */}
              <div className="pt-6 border-t border-neutral-100 mt-6">
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="block w-full text-center bg-[#FF9E15] hover:bg-[#e0890f] text-white font-semibold px-10 py-3 rounded-sm shadow-sm transition-all duration-200"
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