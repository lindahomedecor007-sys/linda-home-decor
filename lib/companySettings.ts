import { supabase } from "@/lib/supabase/client";

export interface CompanySettingsData {
  id?: string;
  company_name: string;
  tagline?: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  whatsapp_number?: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  google_maps_link?: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  opening_hours?: string;
  website_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const defaultCompanySettings: CompanySettingsData = {
  company_name: "",
  tagline: "",
  email: "",
  phone: "",
  alternate_phone: "",
  whatsapp_number: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  google_maps_link: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  opening_hours: "",
  website_url: "",
};

function mapToCompanySettings(data: Record<string, unknown>): CompanySettingsData {
  return {
    id: typeof data.id === "string" ? data.id : undefined,
    company_name: String(data.company_name || ""),
    tagline: String(data.tagline || ""),
    email: String(data.email || ""),
    phone: String(data.phone || data.mobile_number || ""),
    alternate_phone: String(data.alternate_phone || ""),
    whatsapp_number: String(data.whatsapp_number || ""),
    address: String(data.address || ""),
    city: String(data.city || ""),
    state: String(data.state || ""),
    postal_code: String(data.postal_code || ""),
    country: String(data.country || ""),
    google_maps_link: String(data.google_maps_link || ""),
    instagram_url: String(data.instagram_url || ""),
    facebook_url: String(data.facebook_url || ""),
    youtube_url: String(data.youtube_url || ""),
    opening_hours: String(data.opening_hours || ""),
    website_url: String(data.website_url || ""),
    created_at: typeof data.created_at === "string" ? data.created_at : undefined,
    updated_at: typeof data.updated_at === "string" ? data.updated_at : undefined,
  };
}

export async function getCompanySettings(): Promise<CompanySettingsData | null> {
  try {
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return defaultCompanySettings;
    }

    return mapToCompanySettings(data as Record<string, unknown>);
  } catch (err) {
    console.error("Error fetching company settings:", err);
    return defaultCompanySettings;
  }
}

export async function saveCompanySettings(
  settingsData: CompanySettingsData
): Promise<{ data: CompanySettingsData | null; error: Error | null }> {
  try {
    const payload: Record<string, unknown> = {
      company_name: settingsData.company_name || "",
      tagline: settingsData.tagline || "",
      email: settingsData.email || "",
      phone: settingsData.phone || "",
      alternate_phone: settingsData.alternate_phone || "",
      whatsapp_number: settingsData.whatsapp_number || "",
      address: settingsData.address || "",
      city: settingsData.city || "",
      state: settingsData.state || "",
      postal_code: settingsData.postal_code || "",
      country: settingsData.country || "",
      google_maps_link: settingsData.google_maps_link || "",
      instagram_url: settingsData.instagram_url || "",
      facebook_url: settingsData.facebook_url || "",
      youtube_url: settingsData.youtube_url || "",
      opening_hours: settingsData.opening_hours || "",
      website_url: settingsData.website_url || "",
      updated_at: new Date().toISOString(),
    };

    if (settingsData.id) {
      const { data, error } = await supabase
        .from("company_settings")
        .update(payload)
        .eq("id", settingsData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update company settings");
      return { data: mapToCompanySettings(data as Record<string, unknown>), error: null };
    } else {
      const { data: existing } = await supabase
        .from("company_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("company_settings")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to update company settings");
        return { data: mapToCompanySettings(data as Record<string, unknown>), error: null };
      } else {
        const { data, error } = await supabase
          .from("company_settings")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to insert company settings");
        return { data: mapToCompanySettings(data as Record<string, unknown>), error: null };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save company settings";
    console.error("Error saving company settings:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}
