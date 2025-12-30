"use client";

import { useState } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ContactContent } from "@/lib/section-types";
import { submitContactForm } from "@/app/actions/contact";
import {
  getHeadingStyles,
  getBodyStyles,
  getInputStyles,
  getButtonStyles,
  getCardStyles,
} from "../utilities/theme-styles";

interface ContactBlockPublishedProps {
  content: ContactContent;
  theme: ThemeData;
  siteId: string;
}

export function ContactBlockPublished({
  content,
  theme,
  siteId,
}: ContactBlockPublishedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle legacy data - default to "detailed" for backwards compatibility
  const variant = content.variant ?? "detailed";

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: (formData.get("company") as string) || "",
      phone: (formData.get("phone") as string) || "",
      message: formData.get("message") as string,
      website: formData.get("website") as string, // Honeypot
    };

    const result = await submitContactForm(siteId, data);

    if (result.success) {
      setStatus("success");
      e.currentTarget.reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (status === "success") {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-muted)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 style={getHeadingStyles(theme, "h2")}>Thank You!</h2>
          <p
            className="mt-4"
            style={{
              ...getBodyStyles(theme),
              color: "var(--color-muted-foreground)",
            }}
          >
            We&apos;ve received your message and will be in touch soon.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 underline"
            style={{ color: "var(--color-primary)" }}
          >
            Submit another response
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--color-muted)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 style={getHeadingStyles(theme, "h2")}>{content.heading}</h2>
          {content.description && (
            <p
              className="mt-4"
              style={{
                ...getBodyStyles(theme),
                color: "var(--color-muted-foreground)",
              }}
            >
              {content.description}
            </p>
          )}
        </div>

        <div style={getCardStyles(theme)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from users, bots will fill it */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                opacity: 0,
                pointerEvents: "none",
              }}
            />

            {/* Name */}
            <div>
              <label
                htmlFor="contact-name"
                className="block mb-2"
                style={{ ...getBodyStyles(theme), fontWeight: 500 }}
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Your name"
                style={getInputStyles(theme)}
              />
            </div>

            {/* Email - required */}
            <div>
              <label
                htmlFor="contact-email"
                className="block mb-2"
                style={{ ...getBodyStyles(theme), fontWeight: 500 }}
              >
                Email{" "}
                <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                style={getInputStyles(theme)}
              />
            </div>

            {/* Company & Phone - only for detailed variant */}
            {variant === "detailed" && (
              <>
                <div>
                  <label
                    htmlFor="contact-company"
                    className="block mb-2"
                    style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                  >
                    Company
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    name="company"
                    placeholder="Your company"
                    style={getInputStyles(theme)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block mb-2"
                    style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                  >
                    Phone
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    style={getInputStyles(theme)}
                  />
                </div>
              </>
            )}

            {/* Message - required */}
            <div>
              <label
                htmlFor="contact-message"
                className="block mb-2"
                style={{ ...getBodyStyles(theme), fontWeight: 500 }}
              >
                Message{" "}
                <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                placeholder="Your message..."
                style={{
                  ...getInputStyles(theme),
                  resize: "vertical",
                  minHeight: "100px",
                }}
              />
            </div>

            {status === "error" && (
              <p
                className="text-sm p-3 rounded-md"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#dc2626",
                }}
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              style={getButtonStyles(theme)}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
