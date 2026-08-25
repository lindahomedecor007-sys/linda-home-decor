import { supabase } from "@/lib/supabase/client";

export interface BrandItem {
  id: string;
  name?: string;
  image_url: string;
  link?: string;
}

export interface BrandsSectionData {
  id?: string;
  sub_title?: string;
  heading?: string;
  brands: BrandItem[];
  created_at?: string;
  updated_at?: string;
}

export const defaultBrandsData: BrandsSectionData = {
  sub_title: "",
  heading: "",
  brands: [],
};

export async function getBrandsSection(): Promise<BrandsSectionData | null> {
  try {
    const { data, error } = await supabase
      .from("brands_section")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    let parsedBrands: BrandItem[] = [];
    if (Array.isArray(data.brands)) {
      parsedBrands = data.brands;
    } else if (typeof data.brands === "string") {
      try {
        parsedBrands = JSON.parse(data.brands);
      } catch {
        parsedBrands = [];
      }
    }

    return {
      id: data.id,
      sub_title: data.sub_title || "",
      heading: data.heading || "",
      brands: parsedBrands,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching brands section:", err);
    return null;
  }
}

export async function saveBrandsSection(
  brandsData: BrandsSectionData
): Promise<{ data: BrandsSectionData | null; error: Error | null }> {
  try {
    const payload = {
      sub_title: brandsData.sub_title || "",
      heading: brandsData.heading || "",
      brands: brandsData.brands || [],
      updated_at: new Date().toISOString(),
    };

    if (brandsData.id) {
      const { data, error } = await supabase
        .from("brands_section")
        .update(payload)
        .eq("id", brandsData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update brands section");

      let parsedBrands: BrandItem[] = [];
      if (Array.isArray(data.brands)) parsedBrands = data.brands;
      else if (typeof data.brands === "string") parsedBrands = JSON.parse(data.brands);

      return {
        data: {
          id: data.id,
          sub_title: data.sub_title || "",
          heading: data.heading || "",
          brands: parsedBrands,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    } else {
      // Check if row already exists
      const { data: existing } = await supabase
        .from("brands_section")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("brands_section")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to update brands section");

        let parsedBrands: BrandItem[] = [];
        if (Array.isArray(data.brands)) parsedBrands = data.brands;
        else if (typeof data.brands === "string") parsedBrands = JSON.parse(data.brands);

        return {
          data: {
            id: data.id,
            sub_title: data.sub_title || "",
            heading: data.heading || "",
            brands: parsedBrands,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
        };
      } else {
        const { data, error } = await supabase
          .from("brands_section")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to insert brands section");

        let parsedBrands: BrandItem[] = [];
        if (Array.isArray(data.brands)) parsedBrands = data.brands;
        else if (typeof data.brands === "string") parsedBrands = JSON.parse(data.brands);

        return {
          data: {
            id: data.id,
            sub_title: data.sub_title || "",
            heading: data.heading || "",
            brands: parsedBrands,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
        };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save brands section";
    console.error("Error saving brands section:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}
