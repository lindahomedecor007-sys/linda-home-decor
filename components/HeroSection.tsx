"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/hero";
import { useStore } from "@/context/StoreContext";

interface HeroSectionProps {
  slides?: HeroSlide[];
  data?: HeroSlide | null;
}

export default function HeroSection({ slides: propSlides, data: propData }: HeroSectionProps) {
  const { heroSlides } = useStore();
  
  // Resolve slides from props or context
  const slides = propSlides || (propData ? [propData] : heroSlides);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides > 1) {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides > 1) {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  }, [totalSlides]);

  // Autoplay slider every 6 seconds
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [totalSlides, isPaused, nextSlide]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentIndex] || slides[0];

  if (!activeSlide || (!activeSlide.title && !activeSlide.image_url && !activeSlide.subheading)) {
    return null;
  }

  return (
    <section
      className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-neutral-900 text-white select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Ambient Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const desktopImg = slide.image_url;
          const mobileImg = slide.mobile_image_url || slide.image_url;

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {desktopImg ? (
                <>
                  {/* Desktop Image (md and above) */}
                  <div className="hidden md:block absolute inset-0 w-full h-full">
                    <Image
                      src={desktopImg}
                      alt={slide.title || "Hero Banner Desktop"}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center scale-100 transition-transform duration-700"
                    />
                  </div>
                  {/* Mobile Image (below md) */}
                  <div className="block md:hidden absolute inset-0 w-full h-full">
                    <Image
                      src={mobileImg || desktopImg}
                      alt={slide.title || "Hero Banner Mobile"}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center scale-100 transition-transform duration-700"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-neutral-900" />
              )}
            </div>
          );
        })}

        {/* Top Dark Shade for Transparent Navbar Readability */}
        <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 bg-gradient-to-b from-black/75 via-black/35 to-transparent z-15 pointer-events-none" />

        {/* Soft Vignette & Readability Gradient Overlay */}
        <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/80 via-black/35 to-black/30 md:from-black/75 md:via-black/25 md:to-black/20 pointer-events-none" />
      </div>

      {/* Decorative Vertical Grid Lines Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none hidden md:grid grid-cols-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-r border-white/10 h-full" />
        <div className="border-r border-white/10 h-full" />
        <div className="border-r border-white/10 h-full" />
        <div className="h-full" />
      </div>

      {/* Main Container */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8 flex flex-col justify-between flex-1">
        {/* Top spacer */}
        <div />

        {/* Center-Left Content Group (Subheading + Title + CTA Button) */}
        <div className="my-auto py-4 sm:py-8 max-w-2xl lg:max-w-3xl flex flex-col items-start">
          {/* Subheading: Clean typography matching reference */}
          {activeSlide.subheading && (
            <p className="text-sm sm:text-base font-normal tracking-wide text-white/90 mb-3 sm:mb-4 drop-shadow-xs transition-all animate-fade-in">
              {activeSlide.subheading}
            </p>
          )}

          {/* Main Headline Title: Bold modern typography matching reference */}
          {activeSlide.title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] mb-6 sm:mb-8 drop-shadow-sm transition-all animate-fade-in">
              {activeSlide.title}
            </h1>
          )}

          {/* CTA Button Style from reference image: Dark green pill + separate white round arrow badge */}
          {activeSlide.button_text && (
            <Link
              href={activeSlide.button_link || "/products"}
              className="group inline-flex items-center gap-2.5 transition-transform duration-300 active:scale-95 cursor-pointer"
            >
              <span className="bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {activeSlide.button_text}
              </span>
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300 shrink-0">
                <ArrowUpRight className="w-5 h-5 text-neutral-900" />
              </span>
            </Link>
          )}
        </div>

        {/* Bottom Horizontal Line */}
        <div className="pt-4 border-t border-white/15 flex items-center justify-between">
          <div />
        </div>
      </div>

      {/* Floating Next & Previous Navigation Buttons (Always visible in viewport) */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 lg:right-12 z-40 flex items-center gap-3">
        <button
          type="button"
          onClick={prevSlide}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-white text-white hover:text-neutral-900 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 shadow-xl cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-white text-white hover:text-neutral-900 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 shadow-xl cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
}
