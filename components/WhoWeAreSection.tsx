"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { WhoWeAreSectionData } from "@/lib/whoWeAre";
import { useStore } from "@/context/StoreContext";

interface WhoWeAreSectionProps {
  data?: WhoWeAreSectionData | null;
}

// Smooth count increasing animation component
function AnimatedCount({ value, isVisible }: { value: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isVisible) return;

    const match = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || "";
    const rawNumberStr = match[2].replace(/,/g, "");
    const suffix = match[3] || "";
    const targetNumber = parseFloat(rawNumberStr);

    if (isNaN(targetNumber)) {
      setDisplayValue(value);
      return;
    }

    const isDecimal = rawNumberStr.includes(".");
    const decimalPlaces = isDecimal ? rawNumberStr.split(".")[1].length : 0;
    const hasComma = match[2].includes(",");

    const duration = 1800; // ms
    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNumber = targetNumber * easeOut;

      let formattedNumber: string;
      if (decimalPlaces > 0) {
        formattedNumber = currentNumber.toFixed(decimalPlaces);
      } else {
        formattedNumber = Math.round(currentNumber).toString();
      }

      if (hasComma) {
        const parts = formattedNumber.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formattedNumber = parts.join(".");
      }

      setDisplayValue(`${prefix}${formattedNumber}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, isVisible]);

  return <>{isVisible ? displayValue : "0"}</>;
}

export default function WhoWeAreSection({ data: propData }: WhoWeAreSectionProps) {
  const { whoWeAreData } = useStore();
  const data = propData !== undefined ? propData : whoWeAreData;
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation when the section scrolls into viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Strict check: No mock data. Return null if no section data exists in database
  if (!data || (!data.image_url && !data.heading && !data.description)) {
    return null;
  }

  const {
    image_url,
    subtitle,
    heading,
    description,
    button_text,
    button_link,
    show_stats,
    stats,
  } = data;

  const validStats = Array.isArray(stats)
    ? stats.filter((s) => Boolean(s.count && s.label)).slice(0, 2)
    : [];

  const hasStats = Boolean(show_stats && validStats.length > 0);

  return (
    <section ref={sectionRef} className="w-full py-10 sm:py-14 md:pt-12 md:pb-12 bg-white text-neutral-900 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 lg:items-stretch">
          {/* Left Column: Featured Image */}
          <div className="lg:col-span-6 flex flex-col">
            {image_url ? (
              <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-full lg:min-h-[480px] rounded-sm overflow-hidden shadow-sm bg-neutral-100">
                <Image
                  src={image_url}
                  alt={heading || "Who We Are"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-103"
                />
              </div>
            ) : (
              <div className="w-full h-[320px] sm:h-[420px] lg:h-full lg:min-h-[480px] rounded-sm bg-neutral-100 flex items-center justify-center text-neutral-400">
                <span>Image not available</span>
              </div>
            )}
          </div>

          {/* Right Column: Text Content & Optional Mini Stats */}
          <div
            className={`lg:col-span-6 flex flex-col ${
              hasStats
                ? "justify-between h-full space-y-6"
                : "justify-center h-full space-y-5 sm:space-y-6 my-auto"
            }`}
          >
            {/* Top Content Block */}
            <div className="space-y-4 sm:space-y-5">
              {/* Subtitle */}
              {subtitle && (
                <span className="text-xs sm:text-sm font-normal tracking-wider text-neutral-500 uppercase block">
                  {subtitle}
                </span>
              )}

              {/* Main Heading */}
              {heading && (
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-neutral-900 leading-tight">
                  {heading}
                </h2>
              )}

              {/* Description */}
              {description && (
                <p className="text-neutral-500 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
                  {description}
                </p>
              )}

              {/* Button */}
              {button_text && (
                <div className="pt-1">
                  <Link
                    href={button_link || "/contact"}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-neutral-900 text-sm font-medium transition-all group shadow-2xs"
                  >
                    <span>{button_text}</span>
                    <span className="w-6 h-6 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Second Image Section: Mini Metric Cards (Toggleable) */}
            {hasStats && (
              <div className="pt-4 sm:pt-6 border-t border-neutral-100 mt-auto">
                <div
                  className={`grid grid-cols-2 ${
                    validStats.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                  } gap-3 sm:gap-4`}
                >
                  {validStats.map((stat, idx) => (
                    <div
                      key={stat.id || idx}
                      className="bg-[#f7f7f7] hover:bg-[#f2f2f2] rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-2xs hover:shadow-xs group"
                    >
                      {/* Icon Image */}
                      {stat.icon_url && (
                        <div className="relative mb-2.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                          <Image
                            src={stat.icon_url}
                            alt={stat.label || "Stat icon"}
                            fill
                            sizes="32px"
                            className="object-contain"
                          />
                        </div>
                      )}

                      {/* Count with increasing animation */}
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
                        <AnimatedCount value={stat.count} isVisible={isVisible} />
                      </span>

                      {/* Label / Heading */}
                      <p className="text-[11px] sm:text-xs font-normal text-neutral-500 mt-1 leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
