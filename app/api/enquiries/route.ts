import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { sendEmail } from "@/lib/brevo";

interface EnquiryRequestBody {
  name: string;
  mobile_number: string;
  email?: string;
  note?: string;
  source?: "form" | "whatsapp";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const body: EnquiryRequestBody = await req.json();

    const name = body.name?.trim() || "";
    const mobile_number = body.mobile_number?.trim() || "";
    const email = body.email?.trim() || null;
    const note = body.note?.trim() || null;
    const source = body.source === "whatsapp" ? "whatsapp" : "form";

    if (!name || !mobile_number) {
      return NextResponse.json(
        { error: "Name and Mobile number are required." },
        { status: 400 }
      );
    }

    // 1. Insert enquiry into Supabase database
    const payload = {
      name,
      mobile_number,
      email,
      note,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: savedData, error: dbError } = await supabase
      .from("enquiries")
      .insert([payload])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error in /api/enquiries:", dbError);
      return NextResponse.json(
        { error: dbError.message || "Failed to save enquiry to database." },
        { status: 500 }
      );
    }

    // 2. If source is form submission (not WhatsApp direct), send email to Admin via Brevo
    if (source !== "whatsapp") {
      try {
        // Resolve Admin recipient email
        let adminEmail = process.env.ADMIN_EMAIL?.trim();

        if (!adminEmail) {
          // Fetch email from company_settings table if env is not set
          const { data: settings } = await supabase
            .from("company_settings")
            .select("email")
            .limit(1)
            .maybeSingle();

          if (settings?.email?.trim()) {
            adminEmail = settings.email.trim();
          }
        }

        if (!adminEmail) {
          adminEmail = process.env.BREVO_SENDER_EMAIL?.trim();
        }

        if (adminEmail && process.env.BREVO_API_KEY) {
          // Extract product reference if present
          const productMatch = note?.match(/\[(?:WhatsApp Direct Enquiry -\s*)?Product:\s*([^\]]+)\]/i);
          let productName: string | null = null;
          let productCategory: string | null = null;
          let productSlug: string | null = null;
          let productDisplay: string | null = null;

          if (productMatch) {
            const rawMeta = productMatch[1].trim();
            const parts = rawMeta.split("|").map((p) => p.trim());
            productName = parts[0] || null;

            for (let i = 1; i < parts.length; i++) {
              const part = parts[i];
              if (part.toLowerCase().startsWith("category:")) {
                productCategory = part.replace(/^category:\s*/i, "").trim();
              } else if (part.toLowerCase().startsWith("slug:")) {
                productSlug = part.replace(/^slug:\s*/i, "").trim();
              }
            }

            if (productName && productCategory) {
              productDisplay = `${productName} | Category: ${productCategory}`;
            } else if (productName) {
              productDisplay = productName;
            }
          }

          const cleanNote = note
            ? note
                .replace(/\[(?:WhatsApp Direct Enquiry -\s*)?Product:\s*[^\]]+\]\n?/i, "")
                .replace(/^Customer initiated WhatsApp enquiry.*$/i, "")
                .trim()
            : "";

          const subject = productDisplay
            ? `New Product Enquiry: ${productDisplay} - from ${name}`
            : `New Customer Enquiry from ${name}`;

          const forwardedProto = req.headers.get("x-forwarded-proto") || "http";
          const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
          const fallbackOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(req.url).origin;
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
            process.env.NEXT_PUBLIC_APP_URL?.trim() ||
            fallbackOrigin;
          const adminEnquiriesUrl = `${siteUrl.replace(/\/+$/, "")}/admin/enquiries`;

          const currentDateStr = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "short",
          });

          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0f172a; padding: 24px 30px; text-align: left; border-bottom: 3px solid #FF9E15; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; }
    .content { padding: 30px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    .badge-product { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-general { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table td { padding: 12px 14px; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .label { color: #64748b; font-weight: 600; width: 35%; }
    .value { color: #0f172a; font-weight: 500; }
    .value a { color: #d97706; text-decoration: none; font-weight: 600; }
    .message-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #FF9E15; border-radius: 4px; padding: 16px; margin: 20px 0; }
    .message-title { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; }
    .message-text { font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap; margin: 0; }
    .btn-admin { display: inline-block; background-color: #FF9E15; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 26px; border-radius: 4px; letter-spacing: 0.3px; }
    .footer { background-color: #f8fafc; padding: 16px 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Linda Home Decor</h1>
      <p>New customer inquiry received via website form</p>
    </div>
    <div class="content">
      ${
        productDisplay
          ? `<div class="badge badge-product">Product Enquiry: ${escapeHtml(productDisplay)}</div>`
          : `<div class="badge badge-general">General Contact Enquiry</div>`
      }

      <table class="table">
        <tr>
          <td class="label">Customer Name</td>
          <td class="value"><strong>${escapeHtml(name)}</strong></td>
        </tr>
        <tr>
          <td class="label">Phone / Mobile</td>
          <td class="value"><a href="tel:${escapeHtml(mobile_number)}">${escapeHtml(mobile_number)}</a></td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value">
            ${
              email
                ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`
                : '<span style="color: #94a3b8; font-style: italic;">Not provided</span>'
            }
          </td>
        </tr>
        ${
          productDisplay
            ? `<tr>
          <td class="label">Enquired Product</td>
          <td class="value" style="color: #b45309; font-weight: 600;">${escapeHtml(productDisplay)}</td>
        </tr>`
            : ""
        }
        <tr>
          <td class="label">Submitted On</td>
          <td class="value">${escapeHtml(currentDateStr)}</td>
        </tr>
      </table>

      ${
        cleanNote
          ? `
      <div class="message-box">
        <div class="message-title">Customer Message / Requirements</div>
        <p class="message-text">${escapeHtml(cleanNote)}</p>
      </div>`
          : ""
      }

      <!-- Admin Direct Link Inside Box -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="${adminEnquiriesUrl}" target="_blank" class="btn-admin">
          View in Admin Enquiries &rarr;
        </a>
        <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
          Admin Link: <a href="${adminEnquiriesUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">${escapeHtml(adminEnquiriesUrl)}</a>
        </p>
      </div>
    </div>
    <div class="footer">
      This notification was automatically sent by Linda Home Decor website enquiry system.
    </div>
  </div>
</body>
</html>
          `;

          const textContent = `
New Customer Enquiry - Linda Home Decor
----------------------------------------
Customer Name: ${name}
Mobile Number: ${mobile_number}
Email: ${email || "Not provided"}
${productDisplay ? `Product Enquired: ${productDisplay}\n` : ""}Date: ${currentDateStr}

${cleanNote ? `Message / Requirement:\n${cleanNote}\n` : ""}
----------------------------------------
View Enquiry in Admin Dashboard:
${adminEnquiriesUrl}
----------------------------------------
          `.trim();

          await sendEmail({
            to: [{ email: adminEmail, name: "Admin" }],
            subject,
            htmlContent,
            textContent,
            replyTo: email ? { email, name } : undefined,
          });

          // 3. Send confirmation / product link email to customer if email is provided
          if (email && email.trim() && process.env.BREVO_API_KEY) {
            try {
              // Resolve product slug if not present in note
              let finalProductSlug = productSlug;
              if (!finalProductSlug && productName) {
                const { data: prod } = await supabase
                  .from("products")
                  .select("slug")
                  .ilike("name", productName.trim())
                  .limit(1)
                  .maybeSingle();
                if (prod?.slug) {
                  finalProductSlug = prod.slug;
                }
              }

              const customerProductUrl = finalProductSlug
                ? `${siteUrl.replace(/\/+$/, "")}/products/${finalProductSlug}`
                : null;
              const customerStoreUrl = siteUrl.replace(/\/+$/, "");

              const customerSubject = productName
                ? `Thank you for your enquiry: ${productName} - Linda Home Decor`
                : `Thank you for contacting Linda Home Decor`;

              const customerHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0f172a; padding: 24px 30px; text-align: left; border-bottom: 3px solid #FF9E15; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; }
    .content { padding: 30px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table td { padding: 12px 14px; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .label { color: #64748b; font-weight: 600; width: 35%; }
    .value { color: #0f172a; font-weight: 500; }
    .btn-action { display: inline-block; background-color: #FF9E15; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 26px; border-radius: 4px; letter-spacing: 0.3px; }
    .footer { background-color: #f8fafc; padding: 20px 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Linda Home Decor</h1>
      <p>Thank you for reaching out to us</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${escapeHtml(name)},</div>
      <p class="intro">
        Thank you for your interest in Linda Home Decor. We have received your enquiry and our team will get in touch with you shortly on <strong>${escapeHtml(mobile_number)}</strong> with detailed specifications and pricing.
      </p>

      <table class="table">
        ${
          productDisplay
            ? `<tr>
          <td class="label">Enquired Product</td>
          <td class="value" style="color: #b45309; font-weight: 700;">${escapeHtml(productDisplay)}</td>
        </tr>`
            : ""
        }
        ${
          cleanNote
            ? `<tr>
          <td class="label">Your Message</td>
          <td class="value">${escapeHtml(cleanNote)}</td>
        </tr>`
            : ""
        }
        <tr>
          <td class="label">Received On</td>
          <td class="value">${escapeHtml(currentDateStr)}</td>
        </tr>
      </table>

      ${
        customerProductUrl
          ? `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="${customerProductUrl}" target="_blank" class="btn-action">
          View Enquired Product on Website &rarr;
        </a>
        <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
          Product Link: <a href="${customerProductUrl}" target="_blank" style="color: #FF9E15; text-decoration: underline;">${escapeHtml(customerProductUrl)}</a>
        </p>
      </div>`
          : `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="${customerStoreUrl}" target="_blank" class="btn-action">
          Explore Our Collection &rarr;
        </a>
      </div>`
      }
    </div>
    <div class="footer">
      <strong>Linda Home Decor</strong><br>
      Premium Wallpapers • Wooden Flooring • Window Blinds • Interior Solutions<br>
      This is an automated acknowledgment of your website enquiry.
    </div>
  </div>
</body>
</html>
              `;

              const customerTextContent = `
Hello ${name},

Thank you for your interest in Linda Home Decor! We have received your enquiry and our team will get in touch with you shortly on ${mobile_number}.

${productDisplay ? `Enquired Product: ${productDisplay}\n` : ""}${cleanNote ? `Your Message: ${cleanNote}\n` : ""}Received On: ${currentDateStr}

${customerProductUrl ? `View Product on Website:\n${customerProductUrl}` : `Explore Our Collection:\n${customerStoreUrl}`}

----------------------------------------
Linda Home Decor
Premium Wallpapers • Wooden Flooring • Window Blinds • Interior Solutions
              `.trim();

              await sendEmail({
                to: [{ email: email.trim(), name: name || "Customer" }],
                subject: customerSubject,
                htmlContent: customerHtmlContent,
                textContent: customerTextContent,
              });
            } catch (custErr) {
              console.error("Error sending customer confirmation email:", custErr);
            }
          }
        }
      } catch (emailErr) {
        console.error("Error sending Brevo notification email:", emailErr);
        // We do not fail the request if email sending fails, because database record was created successfully
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(savedData.id),
        name: String(savedData.name || ""),
        mobile_number: String(savedData.mobile_number || ""),
        email: savedData.email ? String(savedData.email) : undefined,
        note: savedData.note ? String(savedData.note) : undefined,
        status: (savedData.status === "completed" ? "completed" : "pending") as "pending" | "completed",
        created_at: String(savedData.created_at || new Date().toISOString()),
        updated_at: savedData.updated_at ? String(savedData.updated_at) : undefined,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Error in /api/enquiries POST:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
