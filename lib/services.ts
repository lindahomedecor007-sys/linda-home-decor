import { supabase } from "@/lib/supabase/client";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon_url?: string;
  display_order?: number;
}

export interface ServicesSectionData {
  id?: string;
  heading?: string;
  banner_image_url?: string;
  services: ServiceItem[];
  created_at?: string;
  updated_at?: string;
}

export const defaultServicesData: ServicesSectionData = {
  heading: "",
  banner_image_url: "",
  services: [],
};

// Private helper to map raw Supabase row to ServicesSectionData
function mapToServicesData(data: Record<string, unknown>): ServicesSectionData {
  let parsedServices: ServiceItem[] = [];
  if (Array.isArray(data.services)) {
    parsedServices = data.services as ServiceItem[];
  } else if (typeof data.services === "string") {
    try {
      parsedServices = JSON.parse(data.services);
    } catch {
      parsedServices = [];
    }
  }

  return {
    id: (data.id as string) || undefined,
    heading: (data.heading as string) || "",
    banner_image_url: (data.banner_image_url as string) || "",
    services: parsedServices,
    created_at: (data.created_at as string) || undefined,
    updated_at: (data.updated_at as string) || undefined,
  };
}

export async function getServicesSection(): Promise<ServicesSectionData | null> {
  try {
    const { data, error } = await supabase
      .from("services_section")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapToServicesData(data as Record<string, unknown>);
  } catch (err) {
    console.error("Error fetching services section:", err);
    return null;
  }
}

export async function saveServicesSection(
  servicesData: ServicesSectionData
): Promise<{ data: ServicesSectionData | null; error: Error | null }> {
  try {
    const payload = {
      heading: servicesData.heading || "",
      banner_image_url: servicesData.banner_image_url || "",
      services: servicesData.services || [],
      updated_at: new Date().toISOString(),
    };

    if (servicesData.id) {
      const { data, error } = await supabase
        .from("services_section")
        .update(payload)
        .eq("id", servicesData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update services section");

      return {
        data: mapToServicesData(data as Record<string, unknown>),
        error: null,
      };
    } else {
      // Check if any row exists
      const { data: existing } = await supabase
        .from("services_section")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("services_section")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to update services section");

        return {
          data: mapToServicesData(data as Record<string, unknown>),
          error: null,
        };
      } else {
        const { data, error } = await supabase
          .from("services_section")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to insert services section");

        return {
          data: mapToServicesData(data as Record<string, unknown>),
          error: null,
        };
      }
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Failed to save services section");
    console.error("Error saving services section:", error);
    return { data: null, error };
  }
}
