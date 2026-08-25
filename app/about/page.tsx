import AboutSection from "@/components/AboutSection";
import VisionSection from "@/components/VisionSection";
import MissionSection from "@/components/MissionSection";
import StatisticsSection from "@/components/StatisticsSection";
import WhoWeAreSection from "@/components/WhoWeAreSection";
import { getAboutSection } from "@/lib/about";
import { getStatisticsSection } from "@/lib/statistics";
import { getWhoWeAreSection } from "@/lib/whoWeAre";
import { getBrandsSection } from "@/lib/brands";
import type { Metadata } from "next";
import BrandsSection from "@/components/BrandsSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us | Linda Home Decor",
  description:
    "Learn about Linda Home Decor's story, vision, mission, craftsmanship, and dedication to creating timeless spaces.",
};

export default async function AboutPage() {
  const [aboutRes, statsRes, whoRes, brandsRes] = await Promise.allSettled([
    getAboutSection(),
    getStatisticsSection(),
    getWhoWeAreSection(),
    getBrandsSection(),
  ]);

  const aboutData = aboutRes.status === "fulfilled" ? aboutRes.value : null;
  const statisticsData = statsRes.status === "fulfilled" ? statsRes.value : null;
  const whoWeAreData = whoRes.status === "fulfilled" ? whoRes.value : null;
  const brandsData = brandsRes.status === "fulfilled" ? brandsRes.value : null;

  return (
    <div className="w-full pt-16 min-h-screen bg-white">
      <AboutSection initialData={aboutData} />
      <StatisticsSection data={statisticsData} />
      <VisionSection initialData={aboutData} />
      <MissionSection initialData={aboutData} />
      <BrandsSection data={brandsData} />
      <WhoWeAreSection data={whoWeAreData} />
    </div>
  );
}

