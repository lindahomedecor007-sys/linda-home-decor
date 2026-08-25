"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  type: "success" | "error" | "info";
  text: string;
}

interface AdminToastProps {
  message: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export default function AdminToast({
  message,
  onClose,
  duration = 3500,
}: AdminToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-sm bg-[#FF9E15] text-white shadow-2xl max-w-lg w-auto animate-fade-in border border-amber-300/30 transition-all select-none">
        {message.type === "error" ? (
          <AlertCircle className="w-5 h-5 text-white shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
        )}
        <span className="text-sm font-semibold tracking-wide text-white">
          {message.text}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
