import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServicesSection } from "@/lib/services";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicesSection();
  const title = data?.heading || "Services";

  return {
    title: `${title} | Linda Home Decor`,
    description: "Explore our premium interior design and home decor services tailored to your space.",
  };
}

export default async function ServicesPage() {
  const data = await getServicesSection();
  const heading = data?.heading || "Services";
  const bannerImageUrl = data?.banner_image_url || undefined;
  const services = data?.services || [];

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      {/* 
        ========================================================================
        1. HALF-SCREEN BACKGROUND BANNER (Half of screen height, h-[45vh] to h-[50vh])
        ========================================================================
      */}
      <section className="relative w-full h-[45vh] min-h-[340px] max-h-[460px] flex flex-col items-center justify-center pt-16 overflow-hidden bg-neutral-900">
        {/* Background Banner Image */}
        {bannerImageUrl && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={bannerImageUrl}
              alt={heading}
              fill
              priority
              className="object-cover object-center scale-105 transition-all duration-1000 ease-out brightness-90"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
          </div>
        )}

        {/* Banner Content: Common Heading */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center justify-center my-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white drop-shadow-md">
            {heading}
          </h1>

          {services.length > 0 && (
            <div className="mt-3 inline-flex items-center justify-center text-xs sm:text-sm text-neutral-200">
              <span>
                {services.length} {services.length === 1 ? "Service" : "Services"} Available
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 
        ========================================================================
        2. SERVICES LISTING SECTION
        ========================================================================
      */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-20">
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, idx) => (
              <div
                key={service.id || idx}
                className="group relative p-6 sm:p-8 bg-neutral-50 hover:bg-white rounded-sm border border-neutral-200/80 hover:border-[#FF9E15]/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Service Icon */}
                  {service.icon_url && (
                    <div className="w-14 h-14 rounded-sm bg-white border border-neutral-200/80 shadow-xs p-3 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={service.icon_url}
                        alt={service.title}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Service Title / Heading */}
                  <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight group-hover:text-[#FF9E15] transition-colors mb-3">
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  {service.description && (
                    <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href="/contact"
                    className="text-xs font-semibold uppercase tracking-wider text-[#FF9E15] hover:text-[#e0890f] transition-colors flex items-center gap-1"
                  >
                    <span>Enquire Service</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-medium text-neutral-900">
              Services Coming Soon
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              We are updating our list of interior services. Please get in touch with our design consultants.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/contact"
                className="px-5 py-2 text-xs sm:text-sm font-medium bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white rounded-xs transition-colors shadow-xs"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
