"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { AnimatedPortrait, useLivingPortrait, type Motion } from "./portrait-motion";
import type { Portrait } from "./portrait";

type Point = { x: number; y: number };

type DragState = {
  pointerId: number;
  startPointer: Point;
  startOffset: Point;
  startRect: DOMRect;
  lastPointer: Point;
  currentOffset: Point;
  moved: boolean;
};

const storageKey = "living-portraits:floating-position";

export function FloatingPortrait({
  portrait,
  chineseOutput,
}: {
  portrait: Portrait;
  chineseOutput: boolean;
}) {
  const { response, hasSpoken, motion, speak } = useLivingPortrait(portrait);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragMotion, setDragMotion] = useState<Motion | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const saved = JSON.parse(stored) as Point;
      if (Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        window.requestAnimationFrame(() => setOffset(saved));
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const sayLine = () => {
    speak();
    setBubbleOpen(true);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startOffset: offset,
      startRect: rect,
      lastPointer: { x: event.clientX, y: event.clientY },
      currentOffset: offset,
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;

    const rawX = event.clientX - active.startPointer.x;
    const rawY = event.clientY - active.startPointer.y;
    const stepX = event.clientX - active.lastPointer.x;
    active.lastPointer = { x: event.clientX, y: event.clientY };

    if (Math.hypot(rawX, rawY) > 6) {
      active.moved = true;
      if (stepX > 1) setDragMotion("runningRight");
      if (stepX < -1) setDragMotion("runningLeft");
    }

    const dx = Math.min(
      window.innerWidth - 8 - active.startRect.right,
      Math.max(8 - active.startRect.left, rawX),
    );
    const dy = Math.min(
      window.innerHeight - 8 - active.startRect.bottom,
      Math.max(8 - active.startRect.top, rawY),
    );

    const nextOffset = { x: active.startOffset.x + dx, y: active.startOffset.y + dy };
    active.currentOffset = nextOffset;
    setOffset(nextOffset);
  };

  const finishPointer = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    setDragging(false);
    setDragMotion(null);
    window.localStorage.setItem(storageKey, JSON.stringify(active.currentOffset));

    if (!active.moved && !cancelled) sayLine();
  };

  const widgetStyle = {
    "--drag-x": `${offset.x}px`,
    "--drag-y": `${offset.y}px`,
  } as CSSProperties;

  return (
    <div
      ref={wrapperRef}
      className={`floating-portrait ${dragging ? "is-dragging" : ""}`}
      style={widgetStyle}
    >
      {bubbleOpen && hasSpoken ? (
        <div className="floating-bubble" aria-live="polite">
          <button
            type="button"
            className="bubble-close"
            onClick={() => setBubbleOpen(false)}
            aria-label="关闭诗句"
          >
            ×
          </button>
          <blockquote>{response.line}</blockquote>
          {chineseOutput ? <p className="meaning">{response.meaning}</p> : null}
          <a href={response.source} target="_blank" rel="noreferrer">
            {response.title} ↗
          </a>
        </div>
      ) : null}

      <button
        className="floating-pet-button"
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => finishPointer(event)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onClick={(event) => {
          if (event.detail === 0) sayLine();
        }}
        aria-label={`拖拽 ${portrait.name}，或点击听一句诗`}
      >
        <AnimatedPortrait portrait={portrait} motion={dragMotion ?? motion} />
      </button>
    </div>
  );
}
