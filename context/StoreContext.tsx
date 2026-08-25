"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getHeroSlides, saveHeroSection, deleteHeroSlide, HeroSlide } from "@/lib/hero";
import { getFeaturedSection, saveFeaturedSection, FeaturedSectionData } from "@/lib/featured";
import { getBrandsSection, saveBrandsSection, BrandsSectionData, BrandItem } from "@/lib/brands";
import { getStatisticsSection, saveStatisticsSection, StatisticsSectionData, StatisticItem } from "@/lib/statistics";
import { getWhoWeAreSection, saveWhoWeAreSection, WhoWeAreSectionData, WhoWeAreStatItem } from "@/lib/whoWeAre";
import {
  getCompanySettings,
  saveCompanySettings as saveCompanySettingsLib,
  CompanySettingsData,
  defaultCompanySettings,
} from "@/lib/companySettings";
import {
  EnquiryItem,
  CreateEnquiryInput,
  getEnquiries,
  createEnquiry as createEnquiryLib,
  updateEnquiryStatus as updateEnquiryStatusLib,
  deleteEnquiry as deleteEnquiryLib,
} from "@/lib/enquiries";
import {
  AboutSectionData,
  defaultAboutData,
  getAboutSection,
  saveAboutSection as saveAboutSectionLib,
} from "@/lib/about";
import { supabase } from "@/lib/supabase/client";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  category_name?: string;
  category?: string;
  description?: string;
  specifications?: string[];
  image_url?: string;
  sub_images?: string[];
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface StoreContextType {
  heroSlides: HeroSlide[];
  heroData: HeroSlide | null;
  heroLoading: boolean;
  featuredData: FeaturedSectionData | null;
  featuredLoading: boolean;
  brandsData: BrandsSectionData | null;
  brandsLoading: boolean;
  statisticsData: StatisticsSectionData | null;
  statisticsLoading: boolean;
  whoWeAreData: WhoWeAreSectionData | null;
  whoWeAreLoading: boolean;
  companySettings: CompanySettingsData | null;
  companySettingsLoading: boolean;
  aboutData: AboutSectionData | null;
  aboutLoading: boolean;
  enquiries: EnquiryItem[];
  enquiriesLoading: boolean;
  categories: CategoryItem[];
  categoriesLoading: boolean;
  products: ProductItem[];
  productsLoading: boolean;
  refreshHero: () => Promise<HeroSlide[]>;
  saveHero: (data: HeroSlide) => Promise<HeroSlide>;
  deleteHero: (id: string) => Promise<void>;
  refreshFeatured: () => Promise<FeaturedSectionData | null>;
  saveFeatured: (data: FeaturedSectionData) => Promise<FeaturedSectionData>;
  refreshBrands: () => Promise<BrandsSectionData | null>;
  saveBrands: (data: BrandsSectionData) => Promise<BrandsSectionData>;
  refreshStatistics: () => Promise<StatisticsSectionData | null>;
  saveStatistics: (data: StatisticsSectionData) => Promise<StatisticsSectionData>;
  refreshWhoWeAre: () => Promise<WhoWeAreSectionData | null>;
  saveWhoWeAre: (data: WhoWeAreSectionData) => Promise<WhoWeAreSectionData>;
  refreshCompanySettings: () => Promise<CompanySettingsData | null>;
  saveCompanySettings: (data: CompanySettingsData) => Promise<CompanySettingsData>;
  refreshAbout: () => Promise<AboutSectionData | null>;
  saveAbout: (data: AboutSectionData) => Promise<AboutSectionData>;
  refreshEnquiries: () => Promise<EnquiryItem[]>;
  addEnquiry: (input: CreateEnquiryInput) => Promise<EnquiryItem>;
  updateEnquiryStatus: (id: string, status: "pending" | "completed") => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  refreshCategories: () => Promise<CategoryItem[]>;
  createCategory: (data: { name: string; slug?: string; image_url?: string; display_order?: number }) => Promise<CategoryItem>;
  updateCategory: (id: string, data: { name?: string; slug?: string; image_url?: string; display_order?: number }) => Promise<CategoryItem>;
  deleteCategory: (id: string) => Promise<void>;
  refreshProducts: () => Promise<ProductItem[]>;
  createProduct: (data: {
    name: string;
    slug?: string;
    category_id?: string;
    category_name?: string;
    description?: string;
    specifications?: string[];
    image_url?: string;
    sub_images?: string[];
    display_order?: number;
  }) => Promise<ProductItem>;
  updateProduct: (
    id: string,
    data: {
      name?: string;
      slug?: string;
      category_id?: string;
      category_name?: string;
      description?: string;
      specifications?: string[];
      image_url?: string;
      sub_images?: string[];
      display_order?: number;
    }
  ) => Promise<ProductItem>;
  deleteProduct: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  const [featuredData, setFeaturedData] = useState<FeaturedSectionData | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [brandsData, setBrandsData] = useState<BrandsSectionData | null>(null);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const [statisticsData, setStatisticsData] = useState<StatisticsSectionData | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);

  const [whoWeAreData, setWhoWeAreData] = useState<WhoWeAreSectionData | null>(null);
  const [whoWeAreLoading, setWhoWeAreLoading] = useState(true);

  const [companySettings, setCompanySettings] = useState<CompanySettingsData | null>(null);
  const [companySettingsLoading, setCompanySettingsLoading] = useState(true);

  const [aboutData, setAboutData] = useState<AboutSectionData | null>(null);
  const [aboutLoading, setAboutLoading] = useState(true);

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch Hero Slides from database
  const refreshHero = useCallback(async () => {
    setHeroLoading(true);
    try {
      const slides = await getHeroSlides();
      setHeroSlides(slides);
      return slides;
    } catch (err) {
      console.error("Failed to fetch hero slides from database:", err);
      return [];
    } finally {
      setHeroLoading(false);
    }
  }, []);

  // Save/Update Hero Slide in database & update state
  const saveHero = useCallback(async (data: HeroSlide) => {
    try {
      const res = await saveHeroSection(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setHeroSlides((prev) => {
        const index = prev.findIndex((s) => s.id === saved.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        } else {
          return [...prev, saved];
        }
      });
      return saved;
    } catch (err) {
      console.error("Failed to save hero slide to database:", err);
      throw err;
    }
  }, []);

  // Delete Hero Slide from database & update state
  const deleteHero = useCallback(async (id: string) => {
    try {
      const res = await deleteHeroSlide(id);
      if (res.error) throw res.error;
      setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete hero slide:", err);
      throw err;
    }
  }, []);

  // Fetch Featured Section from database
  const refreshFeatured = useCallback(async () => {
    setFeaturedLoading(true);
    try {
      const data = await getFeaturedSection();
      setFeaturedData(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch featured section from database:", err);
      return null;
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  // Save Featured Section to database
  const saveFeatured = useCallback(async (data: FeaturedSectionData) => {
    try {
      const res = await saveFeaturedSection(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setFeaturedData(saved);
      return saved;
    } catch (err) {
      console.error("Failed to save featured section to database:", err);
      throw err;
    }
  }, []);

  // Fetch Brands Section from database
  const refreshBrands = useCallback(async () => {
    setBrandsLoading(true);
    try {
      const data = await getBrandsSection();
      setBrandsData(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch brands section from database:", err);
      return null;
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  // Save Brands Section to database
  const saveBrands = useCallback(async (data: BrandsSectionData) => {
    try {
      const res = await saveBrandsSection(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setBrandsData(saved);
      return saved;
    } catch (err) {
      console.error("Failed to save brands section to database:", err);
      throw err;
    }
  }, []);

  // Fetch Statistics Section from database
  const refreshStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    try {
      const data = await getStatisticsSection();
      setStatisticsData(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch statistics section from database:", err);
      return null;
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Save Statistics Section to database
  const saveStatistics = useCallback(async (data: StatisticsSectionData) => {
    try {
      const res = await saveStatisticsSection(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setStatisticsData(saved);
      return saved;
    } catch (err) {
      console.error("Failed to save statistics section to database:", err);
      throw err;
    }
  }, []);

  // Fetch Who We Are Section from database
  const refreshWhoWeAre = useCallback(async () => {
    setWhoWeAreLoading(true);
    try {
      const data = await getWhoWeAreSection();
      setWhoWeAreData(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch who we are section from database:", err);
      return null;
    } finally {
      setWhoWeAreLoading(false);
    }
  }, []);

  // Save Who We Are Section to database
  const saveWhoWeAre = useCallback(async (data: WhoWeAreSectionData) => {
    try {
      const res = await saveWhoWeAreSection(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setWhoWeAreData(saved);
      return saved;
    } catch (err) {
      console.error("Failed to save who we are section to database:", err);
      throw err;
    }
  }, []);

  // Fetch Company Settings from database
  const refreshCompanySettings = useCallback(async () => {
    setCompanySettingsLoading(true);
    try {
      const data = await getCompanySettings();
      setCompanySettings(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch company settings from database:", err);
      return null;
    } finally {
      setCompanySettingsLoading(false);
    }
  }, []);

  // Save Company Settings to database & update context state
  const saveCompanySettings = useCallback(async (data: CompanySettingsData) => {
    try {
      const res = await saveCompanySettingsLib(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setCompanySettings(saved);
      return saved;
    } catch (err) {
      console.error("Failed to save company settings to database:", err);
      throw err;
    }
  }, []);

  // Fetch About Section from database
  const refreshAbout = useCallback(async () => {
    setAboutLoading(true);
    try {
      const data = await getAboutSection();
      setAboutData(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch about section from database:", err);
      return null;
    } finally {
      setAboutLoading(false);
    }
  }, []);

  // Save About Section to database & update context state
  const saveAbout = useCallback(async (data: AboutSectionData) => {
    try {
      const res = await saveAboutSectionLib(data);
      if (res.error) throw res.error;
      const saved = res.data || data;
      setAboutData(saved);
      return saved;
    } catch (err) {
      console.error("Failed to save about section to database:", err);
      throw err;
    }
  }, []);

  // Fetch Enquiries from database
  const refreshEnquiries = useCallback(async () => {
    setEnquiriesLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch enquiries from database:", err);
      return [];
    } finally {
      setEnquiriesLoading(false);
    }
  }, []);

  // Add Enquiry
  const addEnquiry = useCallback(async (input: CreateEnquiryInput) => {
    const res = await createEnquiryLib(input);
    if (res.error) throw res.error;
    if (res.data) {
      setEnquiries((prev) => [res.data!, ...prev]);
      return res.data;
    }
    throw new Error("Failed to add enquiry");
  }, []);

  // Update Enquiry Status
  const updateEnquiryStatus = useCallback(
    async (id: string, status: "pending" | "completed") => {
      const res = await updateEnquiryStatusLib(id, status);
      if (res.error) throw res.error;
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status, updated_at: new Date().toISOString() } : e
        )
      );
    },
    []
  );

  // Delete Enquiry
  const deleteEnquiry = useCallback(async (id: string) => {
    const res = await deleteEnquiryLib(id);
    if (res.error) throw res.error;
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Fetch Categories from database (no mock data)
  const refreshCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        return [];
      }
      if (cats && cats.length > 0) {
        const formatted: CategoryItem[] = cats.map((c: Record<string, unknown>) => ({
          id: String(c.id || ""),
          name: String(c.name || c.title || c.category_name || `Category ${c.id}`),
          slug: String(c.slug || c.name || c.id).toLowerCase().replace(/\s+/g, "-"),
          image_url: c.image_url ? String(c.image_url) : undefined,
          display_order: typeof c.display_order === "number" ? c.display_order : 0,
          created_at: c.created_at ? String(c.created_at) : undefined,
          updated_at: c.updated_at ? String(c.updated_at) : undefined,
        }));
        setCategories(formatted);
        return formatted;
      }
      setCategories([]);
      return [];
    } catch (err) {
      console.error("Categories query error:", err);
      setCategories([]);
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Create Category
  const createCategory = useCallback(async (catData: { name: string; slug?: string; image_url?: string; display_order?: number }) => {
    const slug = (catData.slug || catData.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const payload = {
      name: catData.name.trim(),
      slug: slug || "category",
      image_url: catData.image_url || null,
      display_order: catData.display_order ?? 0,
    };

    const { data, error } = await supabase
      .from("categories")
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to create category");

    const created: CategoryItem = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      image_url: data.image_url || undefined,
      display_order: data.display_order,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

  // Update Category
  const updateCategory = useCallback(async (id: string, catData: { name?: string; slug?: string; image_url?: string; display_order?: number }) => {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (catData.name !== undefined) {
      payload.name = catData.name.trim();
      if (!catData.slug) {
        payload.slug = catData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      }
    }
    if (catData.slug !== undefined) payload.slug = catData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (catData.image_url !== undefined) payload.image_url = catData.image_url || null;
    if (catData.display_order !== undefined) payload.display_order = catData.display_order;

    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to update category");

    const updated: CategoryItem = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      image_url: data.image_url || undefined,
      display_order: data.display_order,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  // Delete Category
  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message || "Failed to delete category");
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Fetch Products from database (no mock data)
  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const { data: prods, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        return [];
      }
      if (prods && prods.length > 0) {
        const formatted: ProductItem[] = prods.map((p: Record<string, unknown>) => {
          let specs: string[] = [];
          if (Array.isArray(p.specifications)) {
            specs = p.specifications.map((s) => String(s));
          } else if (typeof p.specifications === "string") {
            try {
              specs = JSON.parse(p.specifications);
            } catch {
              specs = [];
            }
          }

          let subImgs: string[] = [];
          if (Array.isArray(p.sub_images)) {
            subImgs = p.sub_images.map((s) => String(s));
          } else if (typeof p.sub_images === "string") {
            try {
              subImgs = JSON.parse(p.sub_images);
            } catch {
              subImgs = [];
            }
          }

          return {
            id: String(p.id || ""),
            name: String(p.name || p.title || p.product_name || `Product ${p.id}`),
            slug: String(p.slug || p.id || p.name).toLowerCase().replace(/\s+/g, "-"),
            category_id: p.category_id ? String(p.category_id) : undefined,
            category_name: p.category_name ? String(p.category_name) : undefined,
            category: p.category_name ? String(p.category_name) : p.category ? String(p.category) : undefined,
            description: p.description ? String(p.description) : undefined,
            specifications: specs,
            image_url: p.image_url ? String(p.image_url) : undefined,
            sub_images: subImgs,
            display_order: typeof p.display_order === "number" ? p.display_order : 0,
            created_at: p.created_at ? String(p.created_at) : undefined,
            updated_at: p.updated_at ? String(p.updated_at) : undefined,
          };
        });
        setProducts(formatted);
        return formatted;
      }
      setProducts([]);
      return [];
    } catch (err) {
      console.error("Products query error:", err);
      setProducts([]);
      return [];
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Create Product
  const createProduct = useCallback(
    async (pData: {
      name: string;
      slug?: string;
      category_id?: string;
      category_name?: string;
      description?: string;
      specifications?: string[];
      image_url?: string;
      sub_images?: string[];
      display_order?: number;
    }) => {
      const slug = (pData.slug || pData.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const payload = {
        name: pData.name.trim(),
        slug: slug || "product",
        category_id: pData.category_id || null,
        category_name: pData.category_name || null,
        description: pData.description || null,
        specifications: pData.specifications || [],
        image_url: pData.image_url || null,
        sub_images: pData.sub_images || [],
        display_order: pData.display_order ?? 0,
      };

      const { data, error } = await supabase
        .from("products")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to create product");

      const created: ProductItem = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        category_id: data.category_id || undefined,
        category_name: data.category_name || undefined,
        category: data.category_name || undefined,
        description: data.description || undefined,
        specifications: Array.isArray(data.specifications) ? data.specifications : [],
        image_url: data.image_url || undefined,
        sub_images: Array.isArray(data.sub_images) ? data.sub_images : [],
        display_order: data.display_order,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProducts((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  // Update Product
  const updateProduct = useCallback(
    async (
      id: string,
      pData: {
        name?: string;
        slug?: string;
        category_id?: string;
        category_name?: string;
        description?: string;
        specifications?: string[];
        image_url?: string;
        sub_images?: string[];
        display_order?: number;
      }
    ) => {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (pData.name !== undefined) {
        payload.name = pData.name.trim();
        if (!pData.slug) {
          payload.slug = pData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        }
      }
      if (pData.slug !== undefined) payload.slug = pData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (pData.category_id !== undefined) payload.category_id = pData.category_id || null;
      if (pData.category_name !== undefined) payload.category_name = pData.category_name || null;
      if (pData.description !== undefined) payload.description = pData.description || null;
      if (pData.specifications !== undefined) payload.specifications = pData.specifications;
      if (pData.image_url !== undefined) payload.image_url = pData.image_url || null;
      if (pData.sub_images !== undefined) payload.sub_images = pData.sub_images;
      if (pData.display_order !== undefined) payload.display_order = pData.display_order;

      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update product");

      const updated: ProductItem = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        category_id: data.category_id || undefined,
        category_name: data.category_name || undefined,
        category: data.category_name || undefined,
        description: data.description || undefined,
        specifications: Array.isArray(data.specifications) ? data.specifications : [],
        image_url: data.image_url || undefined,
        sub_images: Array.isArray(data.sub_images) ? data.sub_images : [],
        display_order: data.display_order,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  // Delete Product
  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message || "Failed to delete product");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshHero(),
      refreshFeatured(),
      refreshBrands(),
      refreshStatistics(),
      refreshWhoWeAre(),
      refreshCompanySettings(),
      refreshAbout(),
      refreshEnquiries(),
      refreshCategories(),
      refreshProducts(),
    ]);
  }, [
    refreshHero,
    refreshFeatured,
    refreshBrands,
    refreshStatistics,
    refreshWhoWeAre,
    refreshCompanySettings,
    refreshAbout,
    refreshEnquiries,
    refreshCategories,
    refreshProducts,
  ]);

  const pathname = usePathname();
  const isAdmin = Boolean(pathname?.startsWith("/admin"));

  // Only auto-fetch all 10 tables on mount if user is in admin dashboard.
  // Public pages fetch their section data via Next.js Server Components.
  useEffect(() => {
    if (isAdmin) {
      refreshAll();
    } else {
      // Lightly load global settings for navbar/footer
      refreshCompanySettings();
      refreshCategories();
    }
  }, [isAdmin, refreshAll, refreshCompanySettings, refreshCategories]);

  return (
    <StoreContext.Provider
      value={{
        heroSlides,
        heroData: heroSlides.length > 0 ? heroSlides[0] : null,
        heroLoading,
        featuredData,
        featuredLoading,
        brandsData,
        brandsLoading,
        statisticsData,
        statisticsLoading,
        whoWeAreData,
        whoWeAreLoading,
        companySettings,
        companySettingsLoading,
        aboutData,
        aboutLoading,
        enquiries,
        enquiriesLoading,
        categories,
        categoriesLoading,
        products,
        productsLoading,
        refreshHero,
        saveHero,
        deleteHero,
        refreshFeatured,
        saveFeatured,
        refreshBrands,
        saveBrands,
        refreshStatistics,
        saveStatistics,
        refreshWhoWeAre,
        saveWhoWeAre,
        refreshCompanySettings,
        saveCompanySettings,
        refreshAbout,
        saveAbout,
        refreshEnquiries,
        addEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        refreshCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        refreshAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
