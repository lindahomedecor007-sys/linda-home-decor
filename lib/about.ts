import { supabase } from "@/lib/supabase/client";

export interface AboutSectionData {
  id?: string;
  about_image_url: string;
  about_subtitle: string;
  about_heading: string;
  about_paragraph: string;
  vision_heading?: string;
  vision_paragraph?: string;
  vision_image_url?: string;
  mission_heading?: string;
  mission_paragraph?: string;
  mission_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const defaultAboutData: AboutSectionData = {
  about_image_url: "",
  about_subtitle: "",
  about_heading: "",
  about_paragraph: "",
  vision_heading: "",
  vision_paragraph: "",
  vision_image_url: "",
  mission_heading: "",
  mission_paragraph: "",
  mission_image_url: "",
};

function mapToAboutData(data: Record<string, unknown>): AboutSectionData {
  return {
    id: typeof data.id === "string" ? data.id : undefined,
    about_image_url: String(data.about_image_url || data.image_url || ""),
    about_subtitle: String(data.about_subtitle || data.subtitle || ""),
    about_heading: String(data.about_heading || data.heading || ""),
    about_paragraph: String(data.about_paragraph || data.paragraph || data.description || ""),
    vision_heading: typeof data.vision_heading === "string" ? data.vision_heading : "",
    vision_paragraph: typeof data.vision_paragraph === "string" ? data.vision_paragraph : "",
    vision_image_url: typeof data.vision_image_url === "string" ? data.vision_image_url : "",
    mission_heading: typeof data.mission_heading === "string" ? data.mission_heading : "",
    mission_paragraph: typeof data.mission_paragraph === "string" ? data.mission_paragraph : "",
    mission_image_url: typeof data.mission_image_url === "string" ? data.mission_image_url : "",
    created_at: typeof data.created_at === "string" ? data.created_at : undefined,
    updated_at: typeof data.updated_at === "string" ? data.updated_at : undefined,
  };
}

export async function getAboutSection(): Promise<AboutSectionData | null> {
  try {
    const { data, error } = await supabase
      .from("about_section")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return defaultAboutData;
    }

    return mapToAboutData(data as Record<string, unknown>);
  } catch (err) {
    console.error("Error fetching about section:", err);
    return defaultAboutData;
  }
}

export async function saveAboutSection(
  aboutData: AboutSectionData
): Promise<{ data: AboutSectionData | null; error: Error | null }> {
  try {
    const payload: Record<string, unknown> = {
      about_image_url: aboutData.about_image_url || "",
      about_subtitle: aboutData.about_subtitle || "",
      about_heading: aboutData.about_heading || "",
      about_paragraph: aboutData.about_paragraph || "",
      vision_heading: aboutData.vision_heading || "",
      vision_paragraph: aboutData.vision_paragraph || "",
      vision_image_url: aboutData.vision_image_url || "",
      mission_heading: aboutData.mission_heading || "",
      mission_paragraph: aboutData.mission_paragraph || "",
      mission_image_url: aboutData.mission_image_url || "",
      updated_at: new Date().toISOString(),
    };

    if (aboutData.id) {
      const { data, error } = await supabase
        .from("about_section")
        .update(payload)
        .eq("id", aboutData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update about section");
      return { data: mapToAboutData(data as Record<string, unknown>), error: null };
    } else {
      const { data: existing } = await supabase
        .from("about_section")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("about_section")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to update about section");
        return { data: mapToAboutData(data as Record<string, unknown>), error: null };
      } else {
        const { data, error } = await supabase
          .from("about_section")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to insert about section");
        return { data: mapToAboutData(data as Record<string, unknown>), error: null };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save about section";
    console.error("Error saving about section:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}
