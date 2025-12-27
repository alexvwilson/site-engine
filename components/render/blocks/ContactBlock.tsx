import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ContactContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getInputStyles,
  getButtonStyles,
  getCardStyles,
} from "../utilities/theme-styles";

interface ContactBlockProps {
  content: ContactContent;
  theme: ThemeData;
}

export function ContactBlock({
  content,
  theme,
}: ContactBlockProps) {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: theme.colors.muted }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 style={getHeadingStyles(theme, "h2")}>{content.heading}</h2>
          {content.description && (
            <p
              className="mt-4"
              style={{
                ...getBodyStyles(theme),
                color: theme.colors.mutedForeground,
              }}
            >
              {content.description}
            </p>
          )}
        </div>

        <div style={getCardStyles(theme)}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {content.fields.map((field, index) => (
              <div key={index}>
                <label
                  className="block mb-2"
                  style={{
                    ...getBodyStyles(theme),
                    fontWeight: 500,
                  }}
                >
                  {field.label}
                  {field.required && (
                    <span style={{ color: theme.colors.primary }}> *</span>
                  )}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    rows={4}
                    required={field.required}
                    disabled
                    style={getInputStyles(theme)}
                    className="resize-none opacity-60 cursor-not-allowed"
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                    disabled
                    style={getInputStyles(theme)}
                    className="opacity-60 cursor-not-allowed"
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled
              className="w-full mt-4 opacity-60 cursor-not-allowed"
              style={getButtonStyles(theme)}
            >
              Submit
            </button>
            <p
              className="text-center mt-2"
              style={{
                fontSize: theme.typography.scale.small,
                color: theme.colors.mutedForeground,
              }}
            >
              Form is display-only in preview mode
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
