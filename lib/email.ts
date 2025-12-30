import { Resend } from "resend";
import { env } from "./env";

// Resend client is only initialized if API key is configured
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface ContactNotificationParams {
  to: string;
  siteName: string;
  contact: {
    name?: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
  };
}

export async function sendContactNotification({
  to,
  siteName,
  contact,
}: ContactNotificationParams): Promise<{ success: boolean; error?: string }> {
  // Skip if Resend is not configured
  if (!resend) {
    console.log("Email notifications disabled (RESEND_API_KEY not configured)");
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Site Engine <onboarding@resend.dev>",
      to,
      subject: `New Contact Submission - ${siteName}`,
      text: `
You have a new contact submission on ${siteName}:

Name: ${contact.name || "Not provided"}
Email: ${contact.email}
Company: ${contact.company || "Not provided"}
Phone: ${contact.phone || "Not provided"}

Message:
${contact.message}

---
This email was sent by Site Engine.
      `.trim(),
    });

    if (error) {
      console.error("Failed to send contact notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send contact notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
