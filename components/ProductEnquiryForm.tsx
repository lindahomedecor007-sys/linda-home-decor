"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore, ProductItem } from "@/context/StoreContext";
import { Loader2, Send, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductEnquiryFormProps {
  product: ProductItem;
}

function ProductEnquiryFormContent({ product }: ProductEnquiryFormProps) {
  const { addEnquiry } = useStore();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(true);
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
        setIsOpen(false);
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit enquiry. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={formRef} id="enquiry" className="mt-8 pt-6 border-t border-neutral-200 space-y-4 scroll-mt-24">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full sm:w-auto justify-center px-8 py-3 font-medium text-sm rounded-xs shadow-xs transition-all cursor-pointer flex items-center gap-2 text-center ${
            isOpen
              ? "bg-neutral-900 text-white hover:bg-neutral-800"
              : "bg-[#FF9E15] hover:bg-[#e0890f] text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isOpen ? "Close Enquiry Form" : "Enquire About This Product"}</span>
        </button>
      </div>

      {/* Expandable Form Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="py-5 p-1 rounded-sm space-y-4">
              <div className="border-b border-neutral-200/80 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Product Enquiry for <span className="text-[#FF9E15]">{product.name}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                    Submit your details and our team will get in touch with product specifications and pricing.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-sm flex items-center gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {success ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Enquiry Submitted Successfully!</p>
                    <p className="text-xs text-emerald-700 font-medium">
                      Thank you for your interest in <strong>{product.name}</strong>. Our team will contact you shortly.
                    </p>
                  </div>
                </div>
              ) : (
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
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
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
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
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
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
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
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 flex items-center justify-center sm:justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm text-xs sm:text-sm font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
