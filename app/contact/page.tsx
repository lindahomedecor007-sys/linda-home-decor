import ContactSection from "@/components/ContactSection";
import { getCompanySettings } from "@/lib/companySettings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Linda Home Decor",
  description: "Get in touch with Linda Home Decor for custom interior design, furniture, and workspace inquiries.",
};

export default async function ContactPage() {
  const companySettings = await getCompanySettings();

  return (
    <div className="w-full pt-16 min-h-screen bg-white">
      <ContactSection companySettings={companySettings} />
    </div>
  );
}
