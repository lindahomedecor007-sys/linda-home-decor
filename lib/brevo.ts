import { BrevoClient, Brevo } from "@getbrevo/brevo";

export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || "",
});

export interface SendEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  sender?: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
  params?: Record<string, unknown>;
  templateId?: number;
}

/**
 * Send a transactional email using Brevo
 */
export async function sendEmail(options: SendEmailOptions) {
  const sender = options.sender || {
    email: process.env.BREVO_SENDER_EMAIL || "",
    name: process.env.BREVO_SENDER_NAME || "Linda Home Decor",
  };

  const payload: Brevo.SendTransacEmailRequest = {
    to: options.to,
    subject: options.subject,
    sender,
  };

  if (options.htmlContent) {
    payload.htmlContent = options.htmlContent;
  }

  if (options.textContent) {
    payload.textContent = options.textContent;
  }

  if (options.replyTo) {
    payload.replyTo = options.replyTo;
  }

  if (options.params) {
    payload.params = options.params;
  }

  if (options.templateId) {
    payload.templateId = options.templateId;
  }

  return brevo.transactionalEmails.sendTransacEmail(payload);
}

export default brevo;
