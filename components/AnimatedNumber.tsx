"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  className?: string;
  delay?: number;
  duration?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
};

export function AnimatedNumber({
  value,
  className = "",
  delay = 350,
  duration = 900,
  locale = "en-US",
  prefix = "",
  suffix = ""
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrame = 0;
    let delayTimer: ReturnType<typeof setTimeout>;

    setDisplayValue(0);
    setIsVisible(false);

    delayTimer = setTimeout(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      setIsVisible(true);

      if (prefersReducedMotion || duration <= 0) {
        setDisplayValue(value);
        return;
      }

      const start = performance.now();

      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setDisplayValue(Math.round(value * easedProgress));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        }
      }

      animationFrame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(delayTimer);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [delay, duration, value]);

  const formattedValue = useMemo(
    () => `${prefix}${displayValue.toLocaleString(locale)}${suffix}`,
    [displayValue, locale, prefix, suffix]
  );

  return (
    <span
      aria-label={`${prefix}${value.toLocaleString(locale)}${suffix}`}
      className={`inline-block transition duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      } ${className}`}
    >
      {formattedValue}
    </span>
  );
}
