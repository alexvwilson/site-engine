import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { TestimonialsContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getSmallStyles,
  getCardStyles,
} from "../utilities/theme-styles";
import { Quote } from "lucide-react";

interface TestimonialsBlockProps {
  content: TestimonialsContent;
  theme: ThemeData;
}

export function TestimonialsBlock({
  content,
  theme,
}: TestimonialsBlockProps) {
  if (!content.testimonials || content.testimonials.length === 0) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: "var(--color-muted-foreground)" }}>
            No testimonials added
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {content.testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col"
              style={{
                ...getCardStyles(theme),
                flex: "1 1 280px",
                maxWidth: "400px",
              }}
            >
              <Quote
                className="mb-4 opacity-20"
                size={32}
                style={{ color: "var(--color-primary)" }}
              />
              <blockquote
                className="flex-1 mb-6"
                style={{
                  ...getBodyStyles(theme),
                  fontStyle: "italic",
                }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {testimonial.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    style={{
                      ...getHeadingStyles(theme, "h4"),
                      fontSize: theme.typography.scale.body,
                    }}
                  >
                    {testimonial.author}
                  </p>
                  {testimonial.role && (
                    <p style={getSmallStyles(theme)}>{testimonial.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
