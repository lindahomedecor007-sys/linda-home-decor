import AboutSection from "@/components/AboutSection";
import StatisticsSection from "@/components/StatisticsSection";
import { getAboutSection } from "@/lib/about";
import { getStatisticsSection } from "@/lib/statistics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Linda Home Decor",
  description:
    "Learn about Linda Home Decor's story, craftsmanship, and dedication to creating timeless spaces.",
};

export default async function AboutPage() {
  const [aboutData, statisticsData] = await Promise.all([
    getAboutSection(),
    getStatisticsSection(),
  ]);

  return (
    <div className="w-full pt-16 min-h-screen bg-white">
      <AboutSection initialData={aboutData} />
      <StatisticsSection data={statisticsData} />
    </div>
  );
}
