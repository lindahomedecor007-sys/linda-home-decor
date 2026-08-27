"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { CompanySettingsData } from "@/lib/companySettings";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  WhatsappIcon,
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/SocialIcons";

interface ContactSectionProps {
  title?: string;
  description?: string;
  className?: string;
  companySettings?: CompanySettingsData | null;
}

function ContactSectionContent({
  title = "You Need More Help?",
  description = "One of our workspace experts will reach out to you based on your question.",
  className = "",
  companySettings: propCompanySettings,
}: ContactSectionProps) {
  const searchParams = useSearchParams();
  const productParam = searchParams?.get("product") || "";

  const { companySettings: contextCompanySettings, addEnquiry } = useStore();
  const companySettings = propCompanySettings || contextCompanySettings;

  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    email: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    if (!formData.mobile_number.trim()) {
      setErrorMsg("Please enter your mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const finalNote = productParam
        ? (formData.note.trim() ? `[Product: ${productParam}]\n${formData.note.trim()}` : `[Product: ${productParam}]`)
        : formData.note.trim();

      await addEnquiry({
        name: formData.name,
        mobile_number: formData.mobile_number,
        email: formData.email,
        note: finalNote,
      });

      setSuccess(true);
      setFormData({
        name: "",
        mobile_number: "",
        email: "",
        note: "",
      });

      setTimeout(() => {
        setSuccess(false);
      }, 6000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={`w-full py-16 sm:py-20 md:pt-12 md:pb-12 bg-white text-neutral-900 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Column: Heading, Description, Company Details & Social Links */}
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-tight">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Company Info */}
            {companySettings && (
              <div className="space-y-4 pt-2 border-t border-neutral-100">
                {companySettings.phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-sm bg-neutral-100 text-[#FF9E15] flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${companySettings.phone}`}
                        className="text-neutral-800 hover:text-[#FF9E15] font-semibold transition-colors"
                      >
                        {companySettings.phone}
                      </a>
                      {companySettings.alternate_phone && (
                        <span className="block text-xs text-neutral-500">
                          Alt: {companySettings.alternate_phone}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {companySettings.email && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-sm bg-neutral-100 text-[#FF9E15] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${companySettings.email}`}
                        className="text-neutral-800 hover:text-[#FF9E15] font-medium transition-colors"
                      >
                        {companySettings.email}
                      </a>
                    </div>
                  </div>
                )}

                {companySettings.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-sm bg-neutral-100 text-[#FF9E15] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Location
                      </span>
                      <p className="text-neutral-700 leading-snug">
                        {companySettings.address}
                        {companySettings.city ? `, ${companySettings.city}` : ""}
                        {companySettings.state ? `, ${companySettings.state}` : ""}
                        {companySettings.postal_code ? ` - ${companySettings.postal_code}` : ""}
                        {companySettings.country ? `, ${companySettings.country}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {companySettings.opening_hours && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-sm bg-neutral-100 text-[#FF9E15] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Working Hours
                      </span>
                      <p className="text-neutral-700 text-xs leading-snug">
                        {companySettings.opening_hours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Media Links - Real authentic brand colors */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <span className="block text-xs font-bold text-neutral-800 tracking-wide uppercase">
                Follow us
              </span>
              <div className="flex items-center gap-3">
                {/* 1. WhatsApp (#25D366) */}
                {(() => {
                  const rawNum = companySettings?.whatsapp_number || companySettings?.phone || "";
                  const cleanNum = rawNum.replace(/[^0-9]/g, "");
                  const whatsappHref = cleanNum ? `https://wa.me/${cleanNum}` : "#";
                  return (
                    <a
                      href={whatsappHref}
                      target={whatsappHref !== "#" ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xs"
                      aria-label="WhatsApp"
                      title="WhatsApp"
                    >
                      <WhatsappIcon className="w-4.5 h-4.5" />
                    </a>
                  );
                })()}

                {/* 2. Instagram (#E4405F) */}
                <a
                  href={companySettings?.instagram_url || "#"}
                  target={companySettings?.instagram_url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xs"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <InstagramIcon className="w-4.5 h-4.5" />
                </a>

                {/* 3. Facebook (#1877F2) */}
                <a
                  href={companySettings?.facebook_url || "#"}
                  target={companySettings?.facebook_url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xs"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <FacebookIcon className="w-4.5 h-4.5" />
                </a>

                {/* 4. YouTube (#FF0000) */}
                <a
                  href={companySettings?.youtube_url || "#"}
                  target={companySettings?.youtube_url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xs"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <YoutubeIcon className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Form */}
          <div className="w-full">
            <div className="space-y-6">
              {/* Selected Product Banner */}
              {productParam && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-sm flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-sm bg-[#FF9E15] text-white flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Product Enquiry</p>
                      <p className="text-xs font-bold text-neutral-900 truncate">{productParam}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#FF9E15] bg-white px-2.5 py-0.5 rounded-xs border border-amber-200 shrink-0">
                    Active Product
                  </span>
                </div>
              )}

              {/* Error Notification */}
              {errorMsg && (
                <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-xs font-medium">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                  >
                    Name <span className="text-[#FF9E15]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label
                    htmlFor="contact-mobile"
                    className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                  >
                    Mobile Number <span className="text-[#FF9E15]">*</span>
                  </label>
                  <input
                    id="contact-mobile"
                    type="tel"
                    name="mobile_number"
                    required
                    value={formData.mobile_number}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                </div>

                {/* Email Address (Not mandatory) */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                  >
                    Email address <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                </div>

                {/* Message / Note (Optional) */}
                <div>
                  <label
                    htmlFor="contact-note"
                    className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                  >
                    Your Message <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    id="contact-note"
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className={`w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-90 active:scale-98 ${
                      success
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-[#FF9E15] hover:bg-[#e0890f]"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting your message...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submitted Successfully!
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit your message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ContactSection(props: ContactSectionProps) {
  return (
    <Suspense fallback={null}>
      <ContactSectionContent {...props} />
    </Suspense>
  );
}

