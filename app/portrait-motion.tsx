"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Portrait } from "./portrait";

export const motions = {
  idle: { row: 0, frames: 6, speed: 260 },
  runningRight: { row: 1, frames: 8, speed: 120 },
  runningLeft: { row: 2, frames: 8, speed: 120 },
  walkingUp: {
    cells: [
      { row: 9, column: 0 },
      { row: 9, column: 1 },
      { row: 9, column: 0 },
      { row: 10, column: 7 },
    ],
    speed: 145,
  },
  walkingDown: {
    cells: [
      { row: 10, column: 0 },
      { row: 9, column: 7 },
      { row: 10, column: 0 },
      { row: 10, column: 1 },
    ],
    speed: 145,
  },
  wave: { row: 3, frames: 4, speed: 125 },
  read: { row: 8, frames: 6, speed: 185 },
} as const;

export type Motion = keyof typeof motions;

export function useLivingPortrait(portrait: Portrait) {
  const [responseIndex, setResponseIndex] = useState(-1);
  const [motion, setMotion] = useState<Motion>("idle");
  const [hasSpoken, setHasSpoken] = useState(false);
  const timers = useRef<number[]>([]);
  const responseCount = portrait.responses.length;

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(window.clearTimeout);
  }, []);

  const speak = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    setResponseIndex((current) => {
      if (responseCount <= 1) return 0;
      if (current < 0) return Math.floor(Math.random() * responseCount);

      const candidate = Math.floor(Math.random() * (responseCount - 1));
      return candidate >= current ? candidate + 1 : candidate;
    });
    setHasSpoken(true);
    setMotion("wave");

    timers.current.push(
      window.setTimeout(() => setMotion("read"), 620),
      window.setTimeout(() => setMotion("idle"), 2200),
    );
  }, [responseCount]);

  return {
    response: portrait.responses[responseIndex] ?? portrait.responses[0],
    hasSpoken,
    motion,
    speak,
  };
}

export function AnimatedPortrait({ portrait, motion }: { portrait: Portrait; motion: Motion }) {
  const [frame, setFrame] = useState(0);
  const motionConfig = motions[motion];
  const frameCount = "cells" in motionConfig ? motionConfig.cells.length : motionConfig.frames;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % frameCount);
    }, motionConfig.speed);

    return () => window.clearInterval(timer);
  }, [frameCount, motionConfig.speed]);

  const cell = "cells" in motionConfig
    ? motionConfig.cells[frame % frameCount]
    : { row: motionConfig.row, column: frame % frameCount };

  const style = {
    "--sprite-x": `${cell.column * -192}px`,
    "--sprite-y": `${cell.row * -208}px`,
    backgroundImage: `url(${portrait.sprite})`,
  } as CSSProperties;

  return <span className="pet-sprite" data-motion={motion} style={style} aria-hidden="true" />;
}
