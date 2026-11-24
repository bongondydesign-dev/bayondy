"use client";

import React, { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export function Reveal({ children, className = "", delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealNow = () => {
      el.setAttribute("data-revealed", "true");
    };

    if (prefersReduced) {
      revealNow();
      return;
    }

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 900;

    if (rect.top <= vh * 0.92) {
      revealNow();
      return;
    }

    el.setAttribute("data-revealed", "pending");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= (window.innerHeight || 900)) {
            revealNow();
            observer.disconnect();
            window.removeEventListener("scroll", onScroll);
            break;
          }
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -24px 0px" }
    );

    const onScroll = () => {
      if (!ref.current) return;
      const top = ref.current.getBoundingClientRect().top;
      if (top <= (window.innerHeight || 900) * 0.96) {
        revealNow();
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`reveal-block ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default Reveal;
