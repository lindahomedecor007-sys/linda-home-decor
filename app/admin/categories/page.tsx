"use client";

import { useState, useRef } from "react";
import { useStore, CategoryItem, CatalogItem } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  Upload,
  Save,
  Trash2,
  Plus,
  Edit2,
  X,
  ImageIcon,
  Tag,
  FileText,
  Download,
  ExternalLink,
  FileCheck,
  Layers,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  image_url: string;
  catalogs: CatalogItem[];
  display_order: number;
}

const emptyCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  image_url: "",
  catalogs: [],
  display_order: 0,
};

export default function AdminCategoriesPage() {
  const {
    categories,
    categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(emptyCategoryForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCatalogIndex, setUploadingCatalogIndex] = useState<number | null>(null);
  const [uploadingNewCatalog, setUploadingNewCatalog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newCatalogFileInputRef = useRef<HTMLInputElement>(null);
  const editCatalogFileInputRef = useRef<HTMLInputElement>(null);
  const currentCatalogIndexToReplace = useRef<number | null>(null);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      ...emptyCategoryForm,
      catalogs: [],
      display_order: categories.length,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: CategoryItem) => {
    setIsEditing(true);

    let initialCatalogs: CatalogItem[] = [];
    if (cat.catalogs && cat.catalogs.length > 0) {
      initialCatalogs = [...cat.catalogs];
    } else if (cat.catalog_url && cat.catalog_url.trim()) {
      initialCatalogs = [
        {
          name: `${cat.name} Catalogue`,
          url: cat.catalog_url.trim(),
        },
      ];
    }

    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || "",
      catalogs: initialCatalogs,
      display_order: cat.display_order ?? 0,
    });
    setIsModalOpen(true);
  };

  // Helper to delete from Cloudinary and Supabase Storage
  const deleteFromCloudinary = async (url?: string, resource_type: "image" | "raw" = "image") => {
    if (!url) return;
    try {
      if (url.includes("supabase.co") && url.includes("/catalogs/")) {
        const match = url.match(/\/catalogs\/(.+)$/);
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1].split("?")[0]);
          await supabase.storage.from("catalogs").remove([filePath]);
        }
      }

      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, resource_type }),
      });
    } catch (err) {
      console.error("Failed to delete file from storage:", err);
    }
  };

  // Helper to upload PDF directly to Supabase Storage
  // Bypasses Vercel's 4.5MB Serverless Function payload limit (HTTP 413 Payload Too Large error)
  const uploadPdfFile = async (file: File): Promise<{ url: string; fileSizeStr: string }> => {
    const isPdf =
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type.toLowerCase().includes("pdf") ||
      file.type === "application/octet-stream";

    if (!isPdf) {
      throw new Error("Please select a valid PDF file (.pdf)");
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 50) {
      throw new Error(
        `The selected PDF is ${sizeInMB.toFixed(1)}MB. Maximum recommended size is 50MB. Please compress your PDF and try again.`
      );
    }

    const fileSizeStr = `${sizeInMB.toFixed(1)} MB`;
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const storagePath = `${cleanName}_${Date.now()}.pdf`;

    // 1. Direct upload from browser to Supabase Storage ('catalogs' bucket)
    let uploadRes = await supabase.storage
      .from("catalogs")
      .upload(storagePath, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    // If bucket does not exist, try creating it and retry
    if (uploadRes.error && uploadRes.error.message.toLowerCase().includes("bucket not found")) {
      try {
        await supabase.storage.createBucket("catalogs", { public: true });
        uploadRes = await supabase.storage
          .from("catalogs")
          .upload(storagePath, file, {
            contentType: "application/pdf",
            upsert: true,
          });
      } catch (e) {
        console.warn("Could not auto-create bucket:", e);
      }
    }

    if (uploadRes.error) {
      // Fallback to server route only if file is small enough (< 4MB) to pass through Vercel
      if (file.size < 4 * 1024 * 1024) {
        try {
          const data = new FormData();
          data.append("file", file);
          data.append("folder", "linda-home-decor/catalogs");
          const res = await fetch("/api/upload", {
            method: "POST",
            body: data,
          });
          const json = await res.json();
          if (res.ok && json.url) {
            return { url: json.url, fileSizeStr };
          }
        } catch {
          // fallback failed, throw original error
        }
      }
      throw new Error(
        `Supabase Storage error: ${uploadRes.error.message}. Please ensure the 'catalogs' public bucket is created in your Supabase project.`
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("catalogs")
      .getPublicUrl(uploadRes.data?.path || storagePath);

    return {
      url: publicUrlData.publicUrl,
      fileSizeStr,
    };
  };

  // Handle Name Input & auto-slug
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : slug,
    }));
  };

  // Upload Banner Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "linda-home-decor/categories");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setFormData((prev) => ({ ...prev, image_url: json.url }));
      setStatusMessage({ type: "success", text: "Category image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove Banner Image
  const handleRemoveImage = async () => {
    if (!formData.image_url) return;
    const url = formData.image_url;
    setFormData((prev) => ({ ...prev, image_url: "" }));
    await deleteFromCloudinary(url, "image");
    setStatusMessage({ type: "success", text: "Category image removed successfully!" });
  };

  // Upload New Catalog PDF and append to list
  const handleNewCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewCatalog(true);
    setStatusMessage(null);

    try {
      const { url, fileSizeStr } = await uploadPdfFile(file);

      const defaultName =
        file.name.replace(/\.[^/.]+$/, "") ||
        (formData.name
          ? `${formData.name} Volume ${formData.catalogs.length + 1}`
          : `Catalogue ${formData.catalogs.length + 1}`);

      const newCatalogItem: CatalogItem = {
        name: defaultName,
        url,
        file_size: fileSizeStr,
        pages: "",
      };

      setFormData((prev) => ({
        ...prev,
        catalogs: [...prev.catalogs, newCatalogItem],
      }));

      setStatusMessage({ type: "success", text: "Catalogue PDF uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload catalogue PDF";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingNewCatalog(false);
      if (newCatalogFileInputRef.current) newCatalogFileInputRef.current.value = "";
    }
  };

  // Replace an existing catalog PDF by index
  const handleReplaceCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = currentCatalogIndexToReplace.current;
    if (!file || index === null || index === undefined) return;

    setUploadingCatalogIndex(index);
    setStatusMessage(null);

    try {
      const { url, fileSizeStr } = await uploadPdfFile(file);

      const oldUrl = formData.catalogs[index]?.url;
      if (oldUrl) {
        await deleteFromCloudinary(oldUrl, "raw");
      }

      setFormData((prev) => {
        const updated = [...prev.catalogs];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            url,
            file_size: fileSizeStr,
          };
        }
        return { ...prev, catalogs: updated };
      });

      setStatusMessage({ type: "success", text: "Catalogue PDF replaced successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to replace catalogue PDF";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingCatalogIndex(null);
      currentCatalogIndexToReplace.current = null;
      if (editCatalogFileInputRef.current) editCatalogFileInputRef.current.value = "";
    }
  };

  // Add empty catalog row for direct URL or manual entry
  const handleAddCatalogRow = () => {
    const defaultName = formData.name
      ? `${formData.name} Collection ${formData.catalogs.length + 1}`
      : `Catalogue ${formData.catalogs.length + 1}`;

    setFormData((prev) => ({
      ...prev,
      catalogs: [
        ...prev.catalogs,
        {
          name: defaultName,
          url: "",
          pages: "",
          file_size: "",
        },
      ],
    }));
  };

  // Update specific field on catalog by index
  const handleCatalogFieldChange = (index: number, field: keyof CatalogItem, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.catalogs];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return { ...prev, catalogs: updated };
    });
  };

  // Remove catalog by index
  const handleRemoveCatalogItem = async (index: number) => {
    const item = formData.catalogs[index];
    if (item?.url) {
      await deleteFromCloudinary(item.url, "raw");
    }
    setFormData((prev) => ({
      ...prev,
      catalogs: prev.catalogs.filter((_, i) => i !== index),
    }));
    setStatusMessage({ type: "success", text: "Catalogue removed from list" });
  };

  // Submit Category Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage({ type: "error", text: "Category name is required." });
      return;
    }

    // Clean up empty catalog rows where URL is missing
    const cleanedCatalogs = formData.catalogs
      .filter((cat) => cat.url && cat.url.trim())
      .map((cat, idx) => ({
        name: cat.name.trim() || `${formData.name.trim()} Catalogue ${idx + 1}`,
        url: cat.url.trim(),
        pages: cat.pages?.trim() || undefined,
        file_size: cat.file_size?.trim() || undefined,
      }));

    setSaving(true);
    setStatusMessage(null);

    try {
      if (isEditing && formData.id) {
        await updateCategory(formData.id, {
          name: formData.name,
          slug: formData.slug,
          image_url: formData.image_url,
          catalogs: cleanedCatalogs,
          display_order: formData.display_order,
        });
        setStatusMessage({ type: "success", text: "Category updated successfully!" });
      } else {
        await createCategory({
          name: formData.name,
          slug: formData.slug,
          image_url: formData.image_url,
          catalogs: cleanedCatalogs,
          display_order: formData.display_order,
        });
        setStatusMessage({ type: "success", text: "Category created successfully!" });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = (cat: CategoryItem) => {
    setCategoryToDelete(cat);
  };

  // Confirm Delete Category
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const cat = categoryToDelete;

    setDeletingId(cat.id);
    setStatusMessage(null);

    try {
      if (cat.image_url) {
        await deleteFromCloudinary(cat.image_url, "image");
      }
      if (cat.catalogs && cat.catalogs.length > 0) {
        for (const item of cat.catalogs) {
          if (item.url) await deleteFromCloudinary(item.url, "raw");
        }
      } else if (cat.catalog_url) {
        await deleteFromCloudinary(cat.catalog_url, "raw");
      }

      await deleteCategory(cat.id);
      setStatusMessage({ type: "success", text: `Category "${cat.name}" deleted successfully!` });
      setCategoryToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Reusable Top Header */}
      <AdminHeader title="Categories Management" />

      {/* Reusable Top Center Toast */}
      <AdminToast
        message={statusMessage}
        onClose={() => setStatusMessage(null)}
        duration={3500}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="max-w-6xl w-full mx-auto space-y-6">
          {/* Header / Summary Card */}
          <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-black flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF9E15]" />
                Product Categories ({categories.length})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                Manage categories, banner images, and multiple downloadable PDF catalogues
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Categories Grid / Cards List */}
          {categoriesLoading && categories.length === 0 ? (
            <div className="bg-white rounded-sm border border-neutral-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15] mx-auto" />
              <p className="text-sm font-medium text-neutral-500">Loading Categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-sm border border-dashed border-neutral-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-[#FF9E15] flex items-center justify-center mx-auto">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-black">No Categories Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
                Create your first product category with a name, image, and multiple PDF catalogues.
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((cat) => {
                const catalogCount = cat.catalogs?.length || (cat.catalog_url ? 1 : 0);

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-xs flex flex-col group hover:border-neutral-300 transition-all"
                  >
                    {/* Category Image */}
                    <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                      {cat.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1">
                          <ImageIcon className="w-6 h-6 text-neutral-300" />
                          <span className="text-[10px] font-medium">No Image</span>
                        </div>
                      )}

                      {/* Catalog PDF Badge Overlay */}
                      {catalogCount > 0 && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-xs bg-neutral-900/90 text-white text-[10px] font-semibold backdrop-blur-xs shadow-sm"
                            title={`${catalogCount} Catalogue(s) uploaded`}
                          >
                            <FileText className="w-3 h-3 text-[#FF9E15]" />
                            <span>{catalogCount} {catalogCount === 1 ? "Catalogue" : "Catalogues"}</span>
                          </span>
                        </div>
                      )}

                      {/* Top Action Overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 bg-white/90 hover:bg-white text-black rounded-sm shadow-xs transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-sm shadow-xs transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-sm font-bold text-black truncate" title={cat.name}>
                          {cat.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                          <span className="truncate">Slug: {cat.slug}</span>
                          {catalogCount > 0 ? (
                            <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                              <FileCheck className="w-3 h-3" />
                              {catalogCount} PDF{catalogCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-neutral-400">No PDF</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-end text-[11px] text-neutral-500 font-medium">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="text-[#FF9E15] font-semibold hover:underline cursor-pointer"
                        >
                          Edit Details & Catalogues
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

      {/* Hidden File Inputs */}
      <input
        ref={newCatalogFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleNewCatalogUpload}
        className="hidden"
      />
      <input
        ref={editCatalogFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleReplaceCatalogUpload}
        className="hidden"
      />

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF9E15]" />
                {isEditing ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter Category (e.g. Wallpaper, Wooden Flooring)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                />
              </div>

              {/* Image Upload Option */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Category Banner Image
                </label>

                {/* Direct Image URL input */}
                <div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://... (or upload file below)"
                    className="w-full px-3.5 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                </div>

                {/* File Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || Boolean(formData.image_url)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#FF9E15]" />
                        Upload Category Image
                      </>
                    )}
                  </button>
                </div>

                {/* Image Preview with Remove Button */}
                {formData.image_url ? (
                  <div className="relative h-36 rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image_url}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white px-2 py-1 rounded-sm shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      title="Delete image"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="h-16 rounded-sm border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 gap-0.5">
                    <ImageIcon className="w-4 h-4 text-neutral-300" />
                    <span className="text-[10px] font-medium">No image uploaded</span>
                  </div>
                )}
              </div>

              {/* Multiple Catalogues Section */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider">
                      Catalogues (PDFs)
                    </label>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Add one or multiple downloadable catalogues for this category with custom titles.
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs">
                    {formData.catalogs.length} {formData.catalogs.length === 1 ? "Catalogue" : "Catalogues"}
                  </span>
                </div>

                {/* List of Catalog Items */}
                <div className="space-y-3">
                  {formData.catalogs.map((catItem, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-sm border border-neutral-200 bg-neutral-50/80 space-y-2.5 relative group"
                    >
                      {/* Top Row: Index Badge, Catalogue Title & Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="w-5 h-5 rounded-xs bg-[#FF9E15]/20 text-[#b45309] flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={catItem.name}
                            onChange={(e) => handleCatalogFieldChange(idx, "name", e.target.value)}
                            placeholder="Catalogue Name (e.g. Premium Wallpaper Collection)"
                            className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 bg-white text-black font-semibold placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#FF9E15]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCatalogItem(idx)}
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                          title="Remove catalogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* PDF URL & Metadata Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* URL input */}
                        <div className="sm:col-span-6">
                          <input
                            type="url"
                            required
                            value={catItem.url}
                            onChange={(e) => handleCatalogFieldChange(idx, "url", e.target.value)}
                            placeholder="https://... PDF URL"
                            className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 bg-white text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#FF9E15]"
                          />
                        </div>

                        {/* Pages input */}
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={catItem.pages || ""}
                            onChange={(e) => handleCatalogFieldChange(idx, "pages", e.target.value)}
                            placeholder="Pages (e.g. 56 Pages)"
                            className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 bg-white text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#FF9E15]"
                          />
                        </div>

                        {/* File Size input */}
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={catItem.file_size || ""}
                            onChange={(e) => handleCatalogFieldChange(idx, "file_size", e.target.value)}
                            placeholder="Size (e.g. 12.4 MB)"
                            className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 bg-white text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#FF9E15]"
                          />
                        </div>
                      </div>

                      {/* Actions: Replace PDF File & Preview */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            currentCatalogIndexToReplace.current = idx;
                            editCatalogFileInputRef.current?.click();
                          }}
                          disabled={uploadingCatalogIndex === idx}
                          className="inline-flex items-center gap-1 font-semibold text-neutral-600 hover:text-black cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-[#FF9E15]" />
                          <span>{uploadingCatalogIndex === idx ? "Uploading PDF..." : "Upload / Replace PDF File"}</span>
                        </button>

                        {catItem.url && (
                          <a
                            href={catItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#FF9E15] hover:underline font-semibold"
                          >
                            <span>Preview PDF</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons to Add Catalogues */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => newCatalogFileInputRef.current?.click()}
                    disabled={uploadingNewCatalog}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-sm border-2 border-dashed border-[#FF9E15]/70 hover:border-[#FF9E15] bg-amber-50/40 hover:bg-amber-50 text-xs font-bold text-[#b45309] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadingNewCatalog ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF9E15]" />
                        <span>Uploading PDF Catalogue...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#FF9E15]" />
                        <span>Upload Catalogue PDF (.pdf)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-sm border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || uploadingNewCatalog || uploadingCatalogIndex !== null}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      {isEditing ? "Update Category" : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header with warning badge */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-black">Delete Category</h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Are you sure you want to delete this category? This action cannot be undone and will permanently remove it along with all associated catalogues.
                </p>
              </div>
            </div>

            {/* Category Preview Card */}
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-sm border border-neutral-200">
              <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-neutral-200 shrink-0">
                {categoryToDelete.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={categoryToDelete.image_url}
                    alt={categoryToDelete.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Tag className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-black truncate">{categoryToDelete.name}</h4>
                <p className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                  Slug: {categoryToDelete.slug} • {categoryToDelete.catalogs?.length || (categoryToDelete.catalog_url ? 1 : 0)} Catalogue(s)
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-sm border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
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
                    Delete Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
