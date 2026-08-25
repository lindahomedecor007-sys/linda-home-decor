"use client";

import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { AboutSectionData } from "@/lib/about";

interface MissionSectionProps {
  data?: AboutSectionData | null;
  initialData?: AboutSectionData | null;
  className?: string;
}

export default function MissionSection({
  data: propData,
  initialData,
  className = "",
}: MissionSectionProps) {
  const { aboutData: contextData, aboutLoading } = useStore();

  const data = propData !== undefined ? propData : (initialData || contextData);

  // Strict check: No mock data. If no database record or empty fields, do not render.
  if (
    !aboutLoading &&
    !data?.mission_heading &&
    !data?.mission_paragraph &&
    !data?.mission_image_url
  ) {
    return null;
  }

  const imageUrl = data?.mission_image_url || "";
  const heading = data?.mission_heading || "";
  const paragraph = data?.mission_paragraph || "";

  if (!heading && !paragraph && !imageUrl) {
    return null;
  }

  return (
    <section className={`w-full py-12 sm:py-16 md:pt-9 md:pb-9 bg-white text-neutral-900 select-none ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column (Desktop): Content */}
          <div className="lg:col-span-6 w-full space-y-4 sm:space-y-5 order-2 lg:order-1">
            <span className="inline-block text-xs sm:text-sm font-bold tracking-widest text-[#FF9E15] uppercase">
              Mission
            </span>

            {heading && (
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-neutral-900 leading-tight">
                {heading}
              </h2>
            )}

            {paragraph && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            )}
          </div>

          {/* Right Column (Desktop): Image */}
          <div className="lg:col-span-6 w-full order-1 lg:order-2">
            {imageUrl ? (
              <div className="relative w-full aspect-4/3 sm:aspect-16/11 rounded-sm overflow-hidden shadow-sm bg-neutral-100">
                <Image
                  src={imageUrl}
                  alt={heading || "Our Mission"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-103"
                />
              </div>
            ) : (
              <div className="w-full aspect-4/3 sm:aspect-16/11 rounded-sm bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
                <span>No image available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
