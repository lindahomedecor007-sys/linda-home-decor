import { supabase } from "@/lib/supabase/client";

export interface WhoWeAreStatItem {
  id: string;
  icon_url?: string; // Uploaded icon/image URL
  icon?: string;
  count: string; // e.g. "2615", "17", "80"
  label: string; // e.g. "Projects", "Professionals", "Happy Clients"
  display_order?: number;
}

export interface WhoWeAreSectionData {
  id?: string;
  image_url?: string;
  subtitle?: string;
  heading?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  show_stats?: boolean;
  stats: WhoWeAreStatItem[];
  created_at?: string;
  updated_at?: string;
}

export const defaultWhoWeAreData: WhoWeAreSectionData = {
  image_url: "",
  subtitle: "",
  heading: "",
  description: "",
  button_text: "",
  button_link: "/contact",
  show_stats: true,
  stats: [],
};

// ─── Private helper: maps raw Supabase row → WhoWeAreSectionData ───────────
function mapToWhoWeAreData(data: Record<string, unknown>): WhoWeAreSectionData {
  let parsedStats: WhoWeAreStatItem[] = [];
  if (Array.isArray(data.stats)) {
    parsedStats = data.stats as WhoWeAreStatItem[];
  } else if (typeof data.stats === "string") {
    try { parsedStats = JSON.parse(data.stats); } catch { parsedStats = []; }
  }
  return {
    id: data.id as string,
    image_url: (data.image_url as string) || "",
    subtitle: (data.subtitle as string) || "",
    heading: (data.heading as string) || "",
    description: (data.description as string) || "",
    button_text: (data.button_text as string) || "",
    button_link: (data.button_link as string) || "",
    show_stats: Boolean(data.show_stats),
    stats: parsedStats,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

export async function getWhoWeAreSection(): Promise<WhoWeAreSectionData | null> {
  try {
    const { data, error } = await supabase
      .from("who_we_are_section")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    let parsedStats: WhoWeAreStatItem[] = [];
    if (Array.isArray(data.stats)) {
      parsedStats = data.stats;
    } else if (typeof data.stats === "string") {
      try {
        parsedStats = JSON.parse(data.stats);
      } catch {
        parsedStats = [];
      }
    }

    return {
      id: data.id,
      image_url: data.image_url || "",
      subtitle: data.subtitle || "",
      heading: data.heading || "",
      description: data.description || "",
      button_text: data.button_text || "",
      button_link: data.button_link || "/contact",
      show_stats: data.show_stats !== undefined ? Boolean(data.show_stats) : true,
      stats: parsedStats,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching who we are section:", err);
    return null;
  }
}

export async function saveWhoWeAreSection(
  sectionData: WhoWeAreSectionData
): Promise<{ data: WhoWeAreSectionData | null; error: Error | null }> {
  try {
    const payload = {
      image_url: sectionData.image_url || "",
      subtitle: sectionData.subtitle || "",
      heading: sectionData.heading || "",
      description: sectionData.description || "",
      button_text: sectionData.button_text || "",
      button_link: sectionData.button_link || "",
      show_stats: sectionData.show_stats !== undefined ? sectionData.show_stats : true,
      stats: sectionData.stats || [],
      updated_at: new Date().toISOString(),
    };

    if (sectionData.id) {
      const { data, error } = await supabase
        .from("who_we_are_section")
        .update(payload)
        .eq("id", sectionData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update who we are section");
      return { data: mapToWhoWeAreData(data as Record<string, unknown>), error: null };
    } else {
      const { data: existing } = await supabase
        .from("who_we_are_section")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("who_we_are_section")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to update who we are section");
        return { data: mapToWhoWeAreData(data as Record<string, unknown>), error: null };
      } else {
        const { data, error } = await supabase
          .from("who_we_are_section")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to insert who we are section");
        return { data: mapToWhoWeAreData(data as Record<string, unknown>), error: null };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save who we are section";
    console.error("Error saving who we are section:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}
