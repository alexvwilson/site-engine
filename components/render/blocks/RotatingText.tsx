"use client";

import { useState, useEffect, useRef } from "react";
import type {
  HeroAnimationEffect,
  HeroAnimationMode,
} from "@/lib/section-types";

interface RotatingTextProps {
  words: string[];
  effect: HeroAnimationEffect;
  displayTime: number;
  animationMode: HeroAnimationMode;
}

type ClipPhase = "revealing" | "visible" | "hiding" | "hidden";
type TypingPhase = "typing" | "visible" | "deleting" | "hidden";

export function RotatingText({
  words,
  effect,
  displayTime,
  animationMode,
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clipPhase, setClipPhase] = useState<ClipPhase>("revealing");
  const [typingPhase, setTypingPhase] = useState<TypingPhase>("typing");
  const [displayedText, setDisplayedText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [wordWidth, setWordWidth] = useState<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const currentWord = words[currentIndex] || "";

  // Scale all animation speeds based on displayTime
  // Base reference: 2000ms displayTime = default speeds
  const timeScale = displayTime / 2000;

  // Clip effect: reveal/hide animation duration (clamped 300-1500ms)
  const animationDuration = Math.max(300, Math.min(1500, 600 * timeScale));

  // Typing effect: ms per character (clamped for readability)
  const typingSpeed = Math.max(25, Math.min(120, 50 * timeScale));
  const deletingSpeed = Math.max(15, Math.min(80, 30 * timeScale));

  // Measure the current word width
  useEffect(() => {
    if (measureRef.current) {
      setWordWidth(measureRef.current.offsetWidth);
    }
  }, [currentWord]);

  // Check for reduced motion preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) =>
        setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Clip effect phase management
  useEffect(() => {
    if (effect !== "clip" || prefersReducedMotion || isPaused) return;
    if (words.length <= 1) return;
    if (animationMode === "once" && currentIndex === words.length - 1 && clipPhase === "visible") return;

    let timeout: NodeJS.Timeout;

    if (clipPhase === "revealing") {
      timeout = setTimeout(() => {
        setClipPhase("visible");
      }, animationDuration);
    } else if (clipPhase === "visible") {
      timeout = setTimeout(() => {
        setClipPhase("hiding");
      }, displayTime);
    } else if (clipPhase === "hiding") {
      timeout = setTimeout(() => {
        setClipPhase("hidden");
      }, animationDuration);
    } else if (clipPhase === "hidden") {
      timeout = setTimeout(() => {
        setCurrentIndex((prev) =>
          animationMode === "loop"
            ? (prev + 1) % words.length
            : Math.min(prev + 1, words.length - 1)
        );
        setClipPhase("revealing");
      }, 50);
    }

    return () => clearTimeout(timeout);
  }, [
    clipPhase,
    currentIndex,
    words.length,
    displayTime,
    animationMode,
    isPaused,
    prefersReducedMotion,
    effect,
    animationDuration,
  ]);

  // Typing effect - character by character typing
  useEffect(() => {
    if (effect !== "typing" || prefersReducedMotion || isPaused) {
      if (effect === "typing" && prefersReducedMotion) {
        setDisplayedText(currentWord);
      }
      return;
    }

    if (typingPhase === "typing") {
      // Type characters one by one
      if (displayedText.length < currentWord.length) {
        typingTimeoutRef.current = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Done typing, move to visible phase
        setTypingPhase("visible");
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [effect, typingPhase, displayedText, currentWord, prefersReducedMotion, isPaused, typingSpeed]);

  // Typing effect - visible phase (pause)
  useEffect(() => {
    if (effect !== "typing" || prefersReducedMotion || isPaused) return;
    if (typingPhase !== "visible") return;
    if (words.length <= 1) return;
    if (animationMode === "once" && currentIndex === words.length - 1) return;

    const timeout = setTimeout(() => {
      setTypingPhase("deleting");
    }, displayTime);

    return () => clearTimeout(timeout);
  }, [effect, typingPhase, displayTime, words.length, currentIndex, animationMode, prefersReducedMotion, isPaused]);

  // Typing effect - deleting characters
  useEffect(() => {
    if (effect !== "typing" || prefersReducedMotion || isPaused) return;
    if (typingPhase !== "deleting") return;

    if (displayedText.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setDisplayedText(displayedText.slice(0, -1));
      }, deletingSpeed);
    } else {
      // Done deleting, move to hidden phase
      setTypingPhase("hidden");
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [effect, typingPhase, displayedText, prefersReducedMotion, isPaused, deletingSpeed]);

  // Typing effect - hidden phase (change word)
  useEffect(() => {
    if (effect !== "typing" || prefersReducedMotion || isPaused) return;
    if (typingPhase !== "hidden") return;

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) =>
        animationMode === "loop"
          ? (prev + 1) % words.length
          : Math.min(prev + 1, words.length - 1)
      );
      setDisplayedText("");
      setTypingPhase("typing");
    }, 50);

    return () => clearTimeout(timeout);
  }, [effect, typingPhase, words.length, animationMode, prefersReducedMotion, isPaused]);

  // Reset typing state when word changes
  useEffect(() => {
    if (effect === "typing" && !prefersReducedMotion) {
      setDisplayedText("");
      setTypingPhase("typing");
    }
  }, [currentIndex, effect, prefersReducedMotion]);

  // Reduced motion: just show static text
  if (prefersReducedMotion) {
    return <span>{currentWord}</span>;
  }

  // No words: return nothing
  if (words.length === 0) {
    return null;
  }

  // Get width for clip animation
  const getAnimatedWidth = (): number | string => {
    if (clipPhase === "hidden") return 0;
    if (clipPhase === "revealing") return wordWidth || "auto";
    if (clipPhase === "visible") return wordWidth || "auto";
    if (clipPhase === "hiding") return 0;
    return "auto";
  };

  return (
    <>
      {/* Hidden span to measure word width */}
      <span
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        {currentWord}
      </span>

      <span
        style={{ display: "inline", verticalAlign: "baseline" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {effect === "clip" ? (
          <span
            style={{
              display: "inline-block",
              overflow: "hidden",
              whiteSpace: "nowrap",
              verticalAlign: "bottom",
              width: getAnimatedWidth(),
              transition: clipPhase === "hidden" ? "none" : `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            <span style={{ display: "inline-block" }}>{currentWord}</span>
          </span>
        ) : (
          <span style={{ display: "inline" }}>
            {displayedText}
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "0.8em",
                backgroundColor: "currentColor",
                verticalAlign: "middle",
                marginLeft: "2px",
                animation: "rotating-text-cursor-blink 0.5s step-end infinite",
              }}
            />
          </span>
        )}
      </span>

      <style jsx>{`
        @keyframes rotating-text-cursor-blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
