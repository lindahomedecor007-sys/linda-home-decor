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
  const slides =
    propSlides && propSlides.length > 0
      ? propSlides
      : propData
      ? [propData]
      : heroSlides && heroSlides.length > 0
      ? heroSlides
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  // Autoplay slider every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentIndex] || slides[0];

  if (!activeSlide || (!activeSlide.title && !activeSlide.image_url && !activeSlide.subheading)) {
    return null;
  }

  return (
    <section
      className="relative w-full h-[90dvh] min-h-[620px] md:h-[100dvh] md:min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-neutral-900 text-white select-none group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
                  <div className="hidden md:block absolute w-full h-full">
                    <Image
                      src={desktopImg}
                      alt={slide.title || "Hero Banner Desktop"}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                  {/* Mobile Image (below md) */}
                  <div className="block md:hidden absolute inset-0 w-full h-full">
                    <Image
                      src={mobileImg || desktopImg}
                      alt={slide.title || "Hero Banner Mobile"}
                      fill
                      priority={index === 0}
                      quality={90}
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



        {/* Soft Bottom Shade for Headline Text Readability */}
        <div className="absolute inset-0 z-[15] bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-10 flex flex-col justify-end md:justify-between flex-1">
        {/* Top spacer (Desktop only) */}
        <div className="hidden md:block" />

        {/* Center-Left Content Group (Subheading + Title + CTA Button) */}
        <div
          key={activeSlide.id || currentIndex}
          className="mt-auto mb-1 md:my-auto py-2 sm:py-4 md:py-8 max-w-2xl lg:max-w-3xl flex flex-col items-start"
        >
          {/* Subheading: Clean typography matching reference */}
          {activeSlide.subheading && (
            <p className="text-sm sm:text-base font-bold tracking-wide text-white/90 mb-2 sm:mb-4 drop-shadow-xs transition-all animate-fade-in">
              {activeSlide.subheading}
            </p>
          )}

          {/* Main Headline Title: Bold modern typography matching reference */}
          {activeSlide.title && (
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] sm:leading-[1.08] mb-4 sm:mb-8 drop-shadow-sm transition-all animate-fade-in">
              {activeSlide.title}
            </h1>
          )}

          {/* CTA Button Style from reference image */}
          {activeSlide.button_text && (
            <Link
              href={activeSlide.button_link || "/products"}
              className="group inline-flex items-center gap-2 sm:gap-2.5 transition-transform duration-300 active:scale-95 cursor-pointer"
            >
              <span className="bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white font-medium text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {activeSlide.button_text}
              </span>
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300 shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Previous & Next Slide Navigation Buttons (Desktop only, visible only when hovering over the button itself) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/45 hover:bg-[#FF9E15] text-white border border-white/25 backdrop-blur-sm items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden md:flex absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/45 hover:bg-[#FF9E15] text-white border border-white/25 backdrop-blur-sm items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </section>
  );
}
