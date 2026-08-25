"use client";

import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { AboutSectionData } from "@/lib/about";

interface AboutSectionProps {
  initialData?: AboutSectionData | null;
  className?: string;
}

export default function AboutSection({
  initialData,
  className = "",
}: AboutSectionProps) {
  const { aboutData: contextData, aboutLoading } = useStore();

  const data = initialData || contextData;

  // Don't show mock data; if no content from DB, return null or clean empty state
  if (!aboutLoading && !data?.about_heading && !data?.about_paragraph && !data?.about_image_url) {
    return null;
  }

  const imageUrl = data?.about_image_url || "";
  const subtitle = data?.about_subtitle || "";
  const heading = data?.about_heading || "";
  const paragraph = data?.about_paragraph || "";

  return (
    <section className={`w-full py-16 sm:py-20 md:pt-9 md:pb-9 bg-white text-neutral-900 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column: Image */}
          <div className="w-full">
            {imageUrl ? (
              <div className="relative w-full aspect-4/3 sm:aspect-16/11 rounded-sm overflow-hidden shadow-md bg-neutral-100">
                <Image
                  src={imageUrl}
                  alt={heading || "About Linda Home Decor"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-103"
                  priority
                />
              </div>
            ) : (
              <div className="w-full aspect-4/3 sm:aspect-16/11 rounded-sm bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
                No image available
              </div>
            )}
          </div>

          {/* Right Column: Content */}
          <div className="w-full space-y-6">
            {subtitle && (
              <span className="inline-block text-xs sm:text-sm font-bold tracking-widest text-[#FF9E15] uppercase">
                {subtitle}
              </span>
            )}

            {heading && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-tight">
                {heading}
              </h1>
            )}

            {paragraph && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
