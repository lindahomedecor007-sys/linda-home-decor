"use client";

import { useEffect, useState, useRef } from "react";
import { StatisticsSectionData } from "@/lib/statistics";
import { useStore } from "@/context/StoreContext";

interface StatisticsSectionProps {
  data?: StatisticsSectionData | null;
}

// Smooth count increasing animation component
function AnimatedCount({ value, isVisible }: { value: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isVisible) return;

    // Parse prefix, numeric value, suffix (e.g. "$150+", "250", "99%")
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

export default function StatisticsSection({ data: propData }: StatisticsSectionProps) {
  const { statisticsData } = useStore();
  const data = propData !== undefined ? propData : statisticsData;
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

  // Strict check: No mock data. Return null if no statistics data exists in database
  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  const title = data.title || "Our Achievements.";
  const validItems = data.items.filter((item) => Boolean(item.value && item.label));

  if (validItems.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="w-full py-8 sm:py-10 md:pt-18 md:pb-9 bg-white text-neutral-900 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with horizontal line accents and square endpoint indicators matching reference image */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-neutral-900 text-center px-1 shrink-0">
            {title}
          </h2>
        </div>

        {/* 4-Card Statistics Grid with compact, proportional sizing */}
        <div
          className={`grid grid-cols-2 ${
            validItems.length >= 4 ? "md:grid-cols-4" : validItems.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-3 sm:gap-4 lg:gap-5`}
        >
          {validItems.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-[#f7f7f7] hover:bg-[#f2f2f2] rounded-xl py-6 px-4 sm:py-8 sm:px-6 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-2xs hover:shadow-xs group"
            >
              {/* Main bold count / number with increasing animation */}
              <span className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-neutral-900 transition-transform duration-300 group-hover:scale-105 tabular-nums">
                <AnimatedCount value={item.value} isVisible={isVisible} />
              </span>

              {/* Subtitle / label below */}
              <p className="text-xs sm:text-sm font-normal text-neutral-500 mt-2 sm:mt-2.5 leading-snug">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

