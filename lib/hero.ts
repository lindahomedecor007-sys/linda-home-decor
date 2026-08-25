import { supabase } from "@/lib/supabase/client";

export interface HeroSlide {
  id?: string;
  subheading: string;
  title: string;
  image_url: string;          // Desktop image
  mobile_image_url?: string;   // Mobile image
  button_text: string;
  button_link: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type HeroSectionData = HeroSlide;

export const defaultHeroData: HeroSlide = {
  subheading: "",
  title: "",
  image_url: "",
  mobile_image_url: "",
  button_text: "",
  button_link: "",
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const { data, error } = await supabase
      .from("hero_section")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching hero slides:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: Record<string, unknown>, index: number) => ({
      id: String(item.id || ""),
      subheading: String(item.subheading || item.badge_text || ""),
      title: String(item.title || ""),
      image_url: String(item.image_url || ""),
      mobile_image_url: String(item.mobile_image_url || ""),
      button_text: String(item.button_text || ""),
      button_link: String(item.button_link || ""),
      display_order: typeof item.display_order === "number" ? item.display_order : index,
      created_at: typeof item.created_at === "string" ? item.created_at : undefined,
      updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
    }));
  } catch (err) {
    console.error("Error in getHeroSlides:", err);
    return [];
  }
}

export async function getHeroSection(): Promise<HeroSlide | null> {
  const slides = await getHeroSlides();
  return slides.length > 0 ? slides[0] : null;
}

export async function saveHeroSection(heroData: HeroSlide): Promise<{ data: HeroSlide | null; error: Error | null }> {
  try {
    const fullPayload: Record<string, unknown> = {
      subheading: heroData.subheading || "",
      title: heroData.title || "",
      image_url: heroData.image_url || "",
      mobile_image_url: heroData.mobile_image_url || "",
      button_text: heroData.button_text || "",
      button_link: heroData.button_link || "",
      display_order: typeof heroData.display_order === "number" ? heroData.display_order : 0,
      updated_at: new Date().toISOString(),
    };

    if (heroData.id) {
      const { data, error } = await supabase
        .from("hero_section")
        .update(fullPayload)
        .eq("id", heroData.id)
        .select()
        .single();

      if (error) {
        // If column doesn't exist yet in Supabase table, retry with standard payload
        if (
          error.message?.toLowerCase().includes("column") ||
          error.code === "PGRST204" ||
          error.code === "42703"
        ) {
          const simplePayload = {
            subheading: heroData.subheading || "",
            title: heroData.title || "",
            image_url: heroData.image_url || "",
            button_text: heroData.button_text || "",
            button_link: heroData.button_link || "",
            updated_at: new Date().toISOString(),
          };
          const fallback = await supabase
            .from("hero_section")
            .update(simplePayload)
            .eq("id", heroData.id)
            .select()
            .single();

          if (fallback.error) {
            throw new Error(fallback.error.message || fallback.error.details || "Database update failed");
          }
          return { data: fallback.data as HeroSlide, error: null };
        }
        throw new Error(error.message || error.details || "Database update failed");
      }
      return { data: data as HeroSlide, error: null };
    } else {
      const { data, error } = await supabase
        .from("hero_section")
        .insert([fullPayload])
        .select()
        .single();

      if (error) {
        // If column doesn't exist yet in Supabase table, retry with standard payload
        if (
          error.message?.toLowerCase().includes("column") ||
          error.code === "PGRST204" ||
          error.code === "42703"
        ) {
          const simplePayload = {
            subheading: heroData.subheading || "",
            title: heroData.title || "",
            image_url: heroData.image_url || "",
            button_text: heroData.button_text || "",
            button_link: heroData.button_link || "",
            updated_at: new Date().toISOString(),
          };
          const fallback = await supabase
            .from("hero_section")
            .insert([simplePayload])
            .select()
            .single();

          if (fallback.error) {
            throw new Error(fallback.error.message || fallback.error.details || "Database insert failed");
          }
          return { data: fallback.data as HeroSlide, error: null };
        }
        throw new Error(error.message || error.details || "Database insert failed");
      }
      return { data: data as HeroSlide, error: null };
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
        ? String((err as Record<string, unknown>).message)
        : "Failed to save hero slide";
    console.error("Error saving hero slide:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}

export async function deleteHeroSlide(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("hero_section")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message || error.details || "Database delete failed");
    return { error: null };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
        ? String((err as Record<string, unknown>).message)
        : "Failed to delete hero slide";
    console.error("Error deleting hero slide:", err);
    return { error: new Error(errorMsg) };
  }
}
