import { Suspense } from "react";
import ContactSection from "@/components/ContactSection";
import { getCompanySettings } from "@/lib/companySettings";
import type { Metadata } from "next";
import EnquirySection from "@/components/EnquirySection";

export const metadata: Metadata = {
  title: "Contact Us | Linda Home Decor",
  description: "Get in touch with Linda Home Decor for custom interior design, furniture, and workspace inquiries.",
};

export default async function ContactPage() {
  const companySettings = await getCompanySettings();

  return (
    <div className="w-full pt-16 min-h-screen bg-white">
        <EnquirySection companySettings={companySettings} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-neutral-900">
          Contact Us
        </h1>
      </div>
      <Suspense fallback={<div className="w-full py-12 text-center text-sm text-neutral-400">Loading...</div>}>
        <ContactSection companySettings={companySettings} />
      </Suspense>
       
    </div>
  );
}
