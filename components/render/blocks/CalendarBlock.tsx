"use client";

import { useState, useEffect, useRef } from "react";
import type {
  CalendarContent,
  CalendarEvent,
  CountdownUnit,
} from "@/lib/section-types";
import { buildSectionStyles } from "@/lib/styling-utils";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format a date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time for display (12-hour format)
 */
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format timezone for display
 */
function formatTimezone(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Calculate time remaining until target date/time
 */
function calculateTimeLeft(
  targetDate: string,
  targetTime: string
): { days: number; hours: number; minutes: number; seconds: number; isComplete: boolean } {
  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  try {
    const targetDateTime = new Date(`${targetDate}T${targetTime || "00:00"}:00`);
    const now = new Date();
    const diff = targetDateTime.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    return { days, hours, minutes, seconds, isComplete: false };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }
}

/**
 * Generate Google Calendar URL
 */
function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startDateTime = event.startTime
    ? `${event.startDate.replace(/-/g, "")}T${event.startTime.replace(":", "")}00`
    : event.startDate.replace(/-/g, "");

  const endDateTime = event.endDate && event.endTime
    ? `${event.endDate.replace(/-/g, "")}T${event.endTime.replace(":", "")}00`
    : event.endTime
      ? `${event.startDate.replace(/-/g, "")}T${event.endTime.replace(":", "")}00`
      : startDateTime;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Web URL
 */
function generateOutlookUrl(event: CalendarEvent): string {
  const startDateTime = event.startTime
    ? `${event.startDate}T${event.startTime}:00`
    : event.startDate;

  const endDateTime = event.endDate && event.endTime
    ? `${event.endDate}T${event.endTime}:00`
    : event.endTime
      ? `${event.startDate}T${event.endTime}:00`
      : startDateTime;

  const params = new URLSearchParams({
    subject: event.title,
    startdt: startDateTime,
    enddt: endDateTime,
    body: event.description || "",
    location: event.location || "",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate and download ICS file
 */
function downloadIcsFile(event: CalendarEvent): void {
  const formatIcsDate = (date: string, time?: string): string => {
    const d = time ? `${date}T${time}:00` : date;
    return new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const startDateTime = formatIcsDate(event.startDate, event.startTime);
  const endDateTime = event.endDate
    ? formatIcsDate(event.endDate, event.endTime)
    : event.endTime
      ? formatIcsDate(event.startDate, event.endTime)
      : startDateTime;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Headstring Web//Calendar//EN",
    "BEGIN:VEVENT",
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Add to Calendar dropdown
 */
function AddToCalendarDropdown({ event }: { event: CalendarEvent }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Add to Calendar
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={generateGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadIcsFile(event)}>
          <Calendar className="h-4 w-4 mr-2" />
          Download .ics (Apple/Outlook)
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={generateOutlookUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Outlook Web
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Event card component
 * Uses CSS variable classes for proper light/dark mode support
 */
function EventCard({
  event,
  style,
  showAddToCalendar,
  showTimezone,
}: {
  event: CalendarEvent;
  style: "simple" | "detailed";
  showAddToCalendar: boolean;
  showTimezone: boolean;
}) {
  const isSimple = style === "simple";

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          {/* Title */}
          <h3 className="text-lg font-semibold">
            {event.title}
          </h3>

          {/* Date and Time */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(event.startDate)}
            </span>
            {event.startTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
                {showTimezone && (
                  <span className="text-xs">({formatTimezone(event.timezone)})</span>
                )}
              </span>
            )}
          </div>

          {/* Event type and location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                event.eventType === "virtual"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
            >
              {event.eventType === "virtual" ? (
                <Video className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              {event.eventType === "virtual" ? "Virtual" : "In-Person"}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            )}
            {event.recurrence && (
              <span className="text-xs italic">{event.recurrence}</span>
            )}
          </div>

          {/* Description (detailed style only) */}
          {!isSimple && event.description && (
            <p className="text-sm mt-2 text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        {/* Add to Calendar button */}
        {showAddToCalendar && (
          <div className="shrink-0 mt-2 sm:mt-0">
            <AddToCalendarDropdown event={event} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Countdown unit display with animation
 */
function CountdownUnit({
  value,
  label,
  animate,
}: {
  value: number;
  label: string;
  animate: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    // Animate from 0 to value
    const duration = 1500;
    const steps = 30;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="text-4xl sm:text-5xl md:text-6xl font-bold tabular-nums"
        style={{ color: "var(--color-primary)" }}
      >
        {displayValue.toString().padStart(2, "0")}
      </div>
      <div
        className="text-sm sm:text-base uppercase tracking-wide mt-1"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </div>
    </div>
  );
}

// ============================================================================
// MODE COMPONENTS
// ============================================================================

/**
 * List mode - displays upcoming events
 */
function CalendarListMode({ content }: { content: CalendarContent }) {
  const { events, showAddToCalendar, showTimezone, eventCardStyle } = content;

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          style={eventCardStyle}
          showAddToCalendar={showAddToCalendar}
          showTimezone={showTimezone}
        />
      ))}
    </div>
  );
}

/**
 * Countdown mode - real-time countdown timer
 */
function CalendarCountdownMode({ content }: { content: CalendarContent }) {
  const {
    countdownTitle,
    countdownSubtitle,
    targetDate,
    targetTime,
    showUnits,
    unitLabels,
    completionMessage,
    showButton,
    buttonText,
    buttonUrl,
    animateOnScroll,
  } = content;

  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(!animateOnScroll);
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(targetDate, targetTime)
  );

  // Intersection Observer for initial animation
  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll]);

  // Real-time countdown (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate, targetTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  const unitMap: Record<CountdownUnit, number> = {
    days: timeLeft.days,
    hours: timeLeft.hours,
    minutes: timeLeft.minutes,
    seconds: timeLeft.seconds,
  };

  return (
    <div ref={ref} className="text-center space-y-6">
      {/* Title */}
      {countdownTitle && (
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
          {countdownTitle}
        </h3>
      )}

      {/* Description */}
      {countdownSubtitle && (
        <p className="text-lg text-muted-foreground">
          {countdownSubtitle}
        </p>
      )}

      {/* Countdown or Completion Message */}
      {timeLeft.isComplete ? (
        <div className="text-2xl sm:text-3xl font-bold py-8 text-primary">
          {completionMessage}
        </div>
      ) : (
        <div className="flex justify-center gap-4 sm:gap-8 py-4">
          {showUnits.map((unit) => (
            <CountdownUnit
              key={unit}
              value={unitMap[unit]}
              label={unitLabels[unit]}
              animate={hasAnimated}
            />
          ))}
        </div>
      )}

      {/* CTA Button */}
      {showButton && buttonText && buttonUrl && (
        <div>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <a href={buttonUrl}>{buttonText}</a>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Embed mode - scheduling widget iframe
 */
function CalendarEmbedMode({ content }: { content: CalendarContent }) {
  const { embedPlatform, embedUrl, embedHeight } = content;

  if (!embedUrl) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Enter a scheduling URL to display the booking widget</p>
        {embedPlatform === "calendly" && (
          <p className="text-sm mt-2">
            Example: https://calendly.com/your-username
          </p>
        )}
        {embedPlatform === "cal.com" && (
          <p className="text-sm mt-2">
            Example: https://cal.com/your-username
          </p>
        )}
      </div>
    );
  }

  // Validate URL
  let isValidUrl = false;
  try {
    const url = new URL(embedUrl);
    isValidUrl = url.protocol === "https:";
  } catch {
    isValidUrl = false;
  }

  if (!isValidUrl) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Invalid URL. Please enter a valid HTTPS URL.</p>
      </div>
    );
  }

  const height = parseInt(embedHeight || "630", 10);

  return (
    <div
      className="w-full overflow-hidden rounded-lg"
      style={{ height: `${height}px` }}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        title={`${embedPlatform} scheduling`}
        allow="payment"
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CalendarBlock({ content }: { content: CalendarContent }) {
  const { mode, sectionTitle, sectionSubtitle, enableStyling } = content;

  // Get styling using buildSectionStyles
  const { sectionStyles, containerStyles, overlayStyles } =
    buildSectionStyles(content);

  return (
    <section
      className={cn("relative py-12 px-4", enableStyling && "relative")}
      style={sectionStyles}
    >
      {/* Overlay */}
      {overlayStyles && <div style={overlayStyles} />}

      <div
        className={cn(
          "relative max-w-4xl mx-auto",
          enableStyling && "p-6 sm:p-8"
        )}
        style={containerStyles}
      >
        {/* Section Header */}
        {(sectionTitle || sectionSubtitle) && (
          <div className="text-center mb-8">
            {sectionTitle && (
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                {sectionTitle}
              </h2>
            )}
            {sectionSubtitle && (
              <p className="text-lg text-muted-foreground">
                {sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Mode-specific rendering */}
        {mode === "list" && <CalendarListMode content={content} />}
        {mode === "countdown" && <CalendarCountdownMode content={content} />}
        {mode === "embed" && <CalendarEmbedMode content={content} />}
      </div>
    </section>
  );
}

export default CalendarBlock;
