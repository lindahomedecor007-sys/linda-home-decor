"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore, ProductItem } from "@/context/StoreContext";
import { Loader2, Send, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { WhatsappIcon } from "@/components/SocialIcons";

interface ProductEnquiryFormProps {
  product: ProductItem;
}

function ProductEnquiryFormContent({ product }: ProductEnquiryFormProps) {
  const { addEnquiry, companySettings } = useStore();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    email: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shouldEnquire = searchParams?.get("enquire") === "true" || searchParams?.has("enquiry");

  useEffect(() => {
    const isHashEnquiry = typeof window !== "undefined" && window.location.hash.includes("enquir");
    if (shouldEnquire || isHashEnquiry) {
      const timer = setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldEnquire]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const finalNote = formData.note.trim()
        ? `[Product: ${product.name}]\n${formData.note.trim()}`
        : `[Product: ${product.name}]`;

      await addEnquiry({
        name: formData.name.trim(),
        mobile_number: formData.mobile_number.trim(),
        email: formData.email.trim(),
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
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit enquiry. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={formRef} id="enquiry" className="mt-8 pt-6 border-t border-neutral-200 scroll-mt-24">
      <div className="p-2 space-y-4">
        {/* Header */}
        <div className=" pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Enquire About <span className="text-black">{product.name}</span>
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Submit your details and our team will get in touch with specifications and pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-sm flex items-center gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Name */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                Name <span className="text-[#FF9E15]">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-sm border-none bg-neutral-100 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-[#FF9E15]">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number"
                required
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-sm border-none bg-neutral-100 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] transition-all"
              />
            </div>
          </div>

          {/* Email Address (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-sm border-none bg-neutral-100 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] transition-all"
            />
          </div>

          {/* Notes / Message (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
              Notes / Message <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
              placeholder="Any specific questions, dimensions or custom requirements..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-sm border-none bg-neutral-100 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] transition-all resize-none"
            />
          </div>

          {/* Action Buttons: Submit Form & Direct WhatsApp */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            {(() => {
              const rawWhatsapp =
                companySettings?.whatsapp_number ||
                companySettings?.phone ||
                companySettings?.alternate_phone ||
                "";
              let cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, "");
              if (cleanWhatsapp && !cleanWhatsapp.startsWith("91") && cleanWhatsapp.length === 10) {
                cleanWhatsapp = "91" + cleanWhatsapp;
              }
              const whatsappMessage = encodeURIComponent(
                `Hello! I am interested in ${product.name}${
                  product.category_name ? ` (${product.category_name})` : ""
                } from Linda Home Decor. Could you please share more details and pricing?`
              );
              const whatsappHref = cleanWhatsapp
                ? `https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`
                : `https://wa.me/?text=${whatsappMessage}`;

              return (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] shadow-xs transition-all cursor-pointer"
                >
                  <WhatsappIcon className="w-4 h-4 fill-current" />
                  <span>WhatsApp Enquiry</span>
                </a>
              );
            })()}

            <button
              type="submit"
              disabled={submitting || success}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-xs sm:text-sm font-semibold text-white shadow-xs transition-all cursor-pointer ${
                success
                  ? "bg-emerald-600 hover:bg-emerald-600 cursor-default"
                  : "bg-[#FF9E15] hover:bg-[#e0890f] disabled:opacity-60"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Submitted Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Product Enquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductEnquiryForm(props: ProductEnquiryFormProps) {
  return (
    <Suspense fallback={<div className="mt-8 pt-6 border-t border-neutral-200" />}>
      <ProductEnquiryFormContent {...props} />
    </Suspense>
  );
}
