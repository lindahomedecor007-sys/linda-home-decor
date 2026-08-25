import { getHeroSlides } from "@/lib/hero";
import { getFeaturedSection } from "@/lib/featured";
import { getBrandsSection } from "@/lib/brands";
import { getStatisticsSection } from "@/lib/statistics";
import { getWhoWeAreSection } from "@/lib/whoWeAre";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { getCompanySettings } from "@/lib/companySettings";
import HeroSection from "@/components/HeroSection";
import StatisticsSection from "@/components/StatisticsSection";
import WhoWeAreSection from "@/components/WhoWeAreSection";
import FeaturedSection from "@/components/FeaturedSection";
import CategorySection from "@/components/CategorySection";
import ProductCarouselSection from "@/components/ProductCarouselSection";
import BrandsSection from "@/components/BrandsSection";
import ContactSection from "@/components/ContactSection";

// Cache rendered page for 60 seconds (Incremental Static Regeneration)
export const revalidate = 60;

export default async function Home() {
  // Parallel fetch with error resilience: one failing section never crashes the whole page
  const [
    heroRes,
    statsRes,
    whoRes,
    featRes,
    brandsRes,
    catsRes,
    prodsRes,
    settingsRes,
  ] = await Promise.allSettled([
    getHeroSlides(),
    getStatisticsSection(),
    getWhoWeAreSection(),
    getFeaturedSection(),
    getBrandsSection(),
    getCategories(),
    getProducts({ limit: 12 }),
    getCompanySettings(),
  ]);

  const heroSlides = heroRes.status === "fulfilled" ? heroRes.value : [];
  const statisticsData = statsRes.status === "fulfilled" ? statsRes.value : null;
  const whoWeAreData = whoRes.status === "fulfilled" ? whoRes.value : null;
  const featuredData = featRes.status === "fulfilled" ? featRes.value : null;
  const brandsData = brandsRes.status === "fulfilled" ? brandsRes.value : null;
  const categories = catsRes.status === "fulfilled" ? catsRes.value : [];
  const products = prodsRes.status === "fulfilled" ? prodsRes.value : [];
  const companySettings = settingsRes.status === "fulfilled" ? settingsRes.value : null;

  return (
    <main className="w-full min-h-screen">
      <HeroSection slides={heroSlides} />
      <StatisticsSection data={statisticsData} />
      <FeaturedSection data={featuredData} />
      <CategorySection categories={categories} />
      <ProductCarouselSection products={products} />
      <BrandsSection data={brandsData} />
      <WhoWeAreSection data={whoWeAreData} />
      <ContactSection companySettings={companySettings} />
    </main>
  );
}
