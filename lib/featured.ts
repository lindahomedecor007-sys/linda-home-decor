import { supabase } from "@/lib/supabase/client";

export interface FeaturedBlock {
  title: string;
  image_url: string;
  link: string;
}

export interface FeaturedSectionData {
  id?: string;
  heading: string;
  items: [FeaturedBlock, FeaturedBlock, FeaturedBlock, FeaturedBlock];
  created_at?: string;
  updated_at?: string;
}

export const defaultFeaturedData: FeaturedSectionData = {
  heading: "",
  items: [
    { title: "", image_url: "", link: "/products" },
    { title: "", image_url: "", link: "/products" },
    { title: "", image_url: "", link: "/products" },
    { title: "", image_url: "", link: "/products" },
  ],
};

export async function getFeaturedSection(): Promise<FeaturedSectionData | null> {
  try {
    const { data, error } = await supabase
      .from("featured_section")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      heading: data.heading || "",
      items: [
        {
          title: data.item1_title || "",
          image_url: data.item1_image_url || "",
          link: data.item1_link || "/products",
        },
        {
          title: data.item2_title || "",
          image_url: data.item2_image_url || "",
          link: data.item2_link || "/products",
        },
        {
          title: data.item3_title || "",
          image_url: data.item3_image_url || "",
          link: data.item3_link || "/products",
        },
        {
          title: data.item4_title || "",
          image_url: data.item4_image_url || "",
          link: data.item4_link || "/products",
        },
      ],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching featured section:", err);
    return null;
  }
}

export async function saveFeaturedSection(
  featuredData: FeaturedSectionData
): Promise<{ data: FeaturedSectionData | null; error: Error | null }> {
  try {
    const payload = {
      heading: featuredData.heading || "",
      item1_title: featuredData.items[0]?.title || "",
      item1_image_url: featuredData.items[0]?.image_url || "",
      item1_link: featuredData.items[0]?.link || "/products",
      item2_title: featuredData.items[1]?.title || "",
      item2_image_url: featuredData.items[1]?.image_url || "",
      item2_link: featuredData.items[1]?.link || "/products",
      item3_title: featuredData.items[2]?.title || "",
      item3_image_url: featuredData.items[2]?.image_url || "",
      item3_link: featuredData.items[2]?.link || "/products",
      item4_title: featuredData.items[3]?.title || "",
      item4_image_url: featuredData.items[3]?.image_url || "",
      item4_link: featuredData.items[3]?.link || "/products",
      updated_at: new Date().toISOString(),
    };

    if (featuredData.id) {
      const { data, error } = await supabase
        .from("featured_section")
        .update(payload)
        .eq("id", featuredData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || error.details || "Failed to update featured section");
      return {
        data: {
          id: data.id,
          heading: data.heading || "",
          items: [
            { title: data.item1_title || "", image_url: data.item1_image_url || "", link: data.item1_link || "/products" },
            { title: data.item2_title || "", image_url: data.item2_image_url || "", link: data.item2_link || "/products" },
            { title: data.item3_title || "", image_url: data.item3_image_url || "", link: data.item3_link || "/products" },
            { title: data.item4_title || "", image_url: data.item4_image_url || "", link: data.item4_link || "/products" },
          ],
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    } else {
      // Check if row already exists
      const { data: existing } = await supabase
        .from("featured_section")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("featured_section")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || error.details || "Failed to update featured section");
        return {
          data: {
            id: data.id,
            heading: data.heading || "",
            items: [
              { title: data.item1_title || "", image_url: data.item1_image_url || "", link: data.item1_link || "/products" },
              { title: data.item2_title || "", image_url: data.item2_image_url || "", link: data.item2_link || "/products" },
              { title: data.item3_title || "", image_url: data.item3_image_url || "", link: data.item3_link || "/products" },
              { title: data.item4_title || "", image_url: data.item4_image_url || "", link: data.item4_link || "/products" },
            ],
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
        };
      } else {
        const { data, error } = await supabase
          .from("featured_section")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || error.details || "Failed to insert featured section");
        return {
          data: {
            id: data.id,
            heading: data.heading || "",
            items: [
              { title: data.item1_title || "", image_url: data.item1_image_url || "", link: data.item1_link || "/products" },
              { title: data.item2_title || "", image_url: data.item2_image_url || "", link: data.item2_link || "/products" },
              { title: data.item3_title || "", image_url: data.item3_image_url || "", link: data.item3_link || "/products" },
              { title: data.item4_title || "", image_url: data.item4_image_url || "", link: data.item4_link || "/products" },
            ],
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
        };
      }
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
        ? String((err as Record<string, unknown>).message)
        : "Failed to save featured section";
    console.error("Error saving featured section:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}
