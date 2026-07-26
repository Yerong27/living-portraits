"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Portrait } from "./portrait";

export const motions = {
  idle: { row: 0, frames: 6, speed: 260 },
  wave: { row: 3, frames: 4, speed: 125 },
  read: { row: 8, frames: 6, speed: 185 },
} as const;

export type Motion = keyof typeof motions;

export function usePoetryPortrait(portrait: Portrait) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [motion, setMotion] = useState<Motion>("idle");
  const [hasSpoken, setHasSpoken] = useState(false);
  const timers = useRef<number[]>([]);
  const quoteCount = portrait.quotes.length;

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(window.clearTimeout);
  }, []);

  const speak = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    setQuoteIndex((current) => {
      const jump = quoteCount > 1 ? 1 + Math.floor(Math.random() * (quoteCount - 1)) : 0;
      return (current + jump) % quoteCount;
    });
    setHasSpoken(true);
    setMotion("wave");

    timers.current.push(
      window.setTimeout(() => setMotion("read"), 620),
      window.setTimeout(() => setMotion("idle"), 2200),
    );
  }, [quoteCount]);

  return {
    quote: portrait.quotes[quoteIndex],
    hasSpoken,
    motion,
    speak,
  };
}

export function AnimatedPortrait({ portrait, motion }: { portrait: Portrait; motion: Motion }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % motions[motion].frames);
    }, motions[motion].speed);

    return () => window.clearInterval(timer);
  }, [motion]);

  const style = {
    "--sprite-x": `${frame * -192}px`,
    "--sprite-y": `${motions[motion].row * -208}px`,
    backgroundImage: `url(${portrait.sprite})`,
  } as CSSProperties;

  return <span className="pet-sprite" style={style} aria-hidden="true" />;
}
