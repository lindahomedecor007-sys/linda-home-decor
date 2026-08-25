"use client";

import { useState, useMemo } from "react";
import {
  Loader2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  Filter,
  RefreshCw,
  User,
  Tag,
  X,
} from "lucide-react";
import { EnquiryItem } from "@/lib/enquiries";
import { useStore } from "@/context/StoreContext";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

export default function AdminEnquiriesPage() {
  const {
    enquiries,
    enquiriesLoading,
    updateEnquiryStatus,
    deleteEnquiry,
    refreshEnquiries,
  } = useStore();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  // KPI Counts
  const totalCount = enquiries.length;
  const pendingCount = useMemo(
    () => enquiries.filter((e) => e.status === "pending").length,
    [enquiries]
  );
  const completedCount = useMemo(
    () => enquiries.filter((e) => e.status === "completed").length,
    [enquiries]
  );

  // Filtered List
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.mobile_number.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.note && item.note.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, statusFilter, searchQuery]);

  // Toggle Status
  const handleToggleStatus = async (item: EnquiryItem) => {
    const newStatus = item.status === "pending" ? "completed" : "pending";
    setUpdatingId(item.id);
    try {
      await updateEnquiryStatus(item.id, newStatus);
      setStatusMessage({
        type: "success",
        text: `Enquiry marked as ${newStatus}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Enquiry Trigger
  const handleDelete = (item: EnquiryItem) => {
    setEnquiryToDelete(item);
  };

  // Confirm Delete Enquiry
  const confirmDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;

    setDeletingId(enquiryToDelete.id);
    try {
      await deleteEnquiry(enquiryToDelete.id);
      setStatusMessage({ type: "success", text: "Enquiry deleted successfully" });
      setEnquiryToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete enquiry";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  if (enquiriesLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        {/* Reusable Top Header */}
        <AdminHeader title="Enquiries Dashboard" />

        {/* Reusable Top Center Toast */}
        <AdminToast
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
          duration={3500}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Enquiries */}
              <div className="bg-white p-5 rounded-sm border border-neutral-200 shadow-xs flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Total Enquiries
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-black">{totalCount}</p>
                </div>
                <div className="w-11 h-11 rounded-sm bg-neutral-100 text-neutral-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Pending */}
              <div className="bg-white p-5 rounded-sm border border-neutral-200 shadow-xs flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Pending
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">{pendingCount}</p>
                </div>
                <div className="w-11 h-11 rounded-sm bg-amber-50 text-[#FF9E15] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white p-5 rounded-sm border border-neutral-200 shadow-xs flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Completed
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{completedCount}</p>
                </div>
                <div className="w-11 h-11 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-sm border border-neutral-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-sm border border-neutral-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "pending"
                      ? "bg-[#FF9E15] text-white shadow-xs"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "completed"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>

              {/* Search & Refresh */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone, email..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => refreshEnquiries()}
                  title="Refresh List"
                  className="p-2 text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Enquiries List */}
            {filteredEnquiries.length === 0 ? (
              <div className="bg-white rounded-sm border border-neutral-200 p-12 text-center shadow-xs">
                <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-neutral-800">No Enquiries Found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "No enquiries match your search or filter criteria."
                    : "No customer enquiries have been submitted yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnquiries.map((item) => {
                  const isPending = item.status === "pending";
                  const isUpdating = updatingId === item.id;
                  const isDeleting = deletingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-sm border transition-all p-4 sm:p-5 shadow-xs ${
                        isPending
                          ? "border-amber-200 hover:border-amber-300 bg-amber-50/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Customer & Message Details */}
                        <div className="space-y-3 flex-1">
                          {/* Name & Badge Header */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-sm bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center font-bold text-xs">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <h4 className="text-sm font-bold text-black">{item.name}</h4>
                            </div>

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-semibold ${
                                isPending
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPending ? "bg-[#FF9E15]" : "bg-emerald-500"
                                }`}
                              />
                              {isPending ? "Pending" : "Completed"}
                            </span>

                            {/* Timestamp */}
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1 ml-auto lg:ml-0">
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              {new Date(item.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Contact Info Chips */}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <a
                              href={`tel:${item.mobile_number}`}
                              className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-[#FF9E15] font-semibold bg-neutral-50 hover:bg-amber-50 px-2.5 py-1 rounded-sm border border-neutral-200 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#FF9E15]" />
                              {item.mobile_number}
                            </a>

                            {item.email && (
                              <a
                                href={`mailto:${item.email}`}
                                className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-[#FF9E15] font-medium bg-neutral-50 hover:bg-amber-50 px-2.5 py-1 rounded-sm border border-neutral-200 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                                {item.email}
                              </a>
                            )}
                          </div>

                          {/* Note / Message with Product Tag Detection */}
                          {item.note && (() => {
                            const productMatch = item.note.match(/\[Product:\s*([^\]]+)\]/i);
                            const productName = productMatch ? productMatch[1].trim() : null;
                            const cleanNote = item.note.replace(/\[Product:\s*[^\]]+\]\n?/i, "").trim();

                            return (
                              <div className="bg-neutral-50 p-3 rounded-sm border border-neutral-200/80 text-xs text-neutral-800 space-y-2">
                                {productName && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 text-[#b45309] rounded-sm text-xs font-bold border border-amber-200">
                                    <Tag className="w-3.5 h-3.5 text-[#FF9E15]" />
                                    <span>Product Enquired: {productName}</span>
                                  </div>
                                )}
                                {cleanNote && (
                                  <div>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                                      Message / Requirement:
                                    </span>
                                    <p className="whitespace-pre-wrap leading-relaxed text-neutral-700">{cleanNote}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 shrink-0">
                          {/* Toggle Status Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                              isPending
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isPending ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark Completed
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                Reopen as Pending
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm border border-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Enquiry"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Enquiry Confirmation Modal */}
      {enquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-black">Delete Enquiry</h3>
              </div>
              <button
                type="button"
                onClick={() => setEnquiryToDelete(null)}
                disabled={Boolean(deletingId)}
                className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete this customer enquiry? This action cannot be undone.
            </p>

            {/* Enquiry Preview Card in Modal */}
            <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF9E15]" />
                  {enquiryToDelete.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                    enquiryToDelete.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {enquiryToDelete.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#FF9E15]" />
                  {enquiryToDelete.mobile_number}
                </span>
                {enquiryToDelete.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    {enquiryToDelete.email}
                  </span>
                )}
              </div>

              {enquiryToDelete.note && (
                <p className="text-[11px] text-neutral-500 line-clamp-2 pt-1 border-t border-neutral-200/60">
                  {enquiryToDelete.note}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEnquiryToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-sm border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEnquiry}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Enquiry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
