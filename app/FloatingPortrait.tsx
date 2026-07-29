"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
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
  held: boolean;
  holdTimer: number;
};

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPoint, setMenuPoint] = useState<Point>({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [overrideMotion, setOverrideMotion] = useState<Motion | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<DragState | null>(null);
  const restoreTimer = useRef<number | null>(null);
  const positionStorageKey = `living-portraits:position:floating:${portrait.id}`;
  const collapsedStorageKey = `living-portraits:collapsed:floating:${portrait.id}`;

  const positionBubble = useCallback(() => {
    const root = wrapperRef.current;
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!root || !trigger || !bubble) return;

    const margin = 10;
    const gap = window.innerWidth <= 700 ? 6 : 9;
    const rootRect = root.getBoundingClientRect();
    const portraitRect = trigger.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const rightSpace = window.innerWidth - portraitRect.right;
    const leftSpace = portraitRect.left;
    let side = portraitRect.left + portraitRect.width / 2 >= window.innerWidth / 2 || rightSpace < 280
      ? "left"
      : "right";

    if (side === "left" && leftSpace < bubbleRect.width + gap && rightSpace > leftSpace) side = "right";
    if (side === "right" && rightSpace < bubbleRect.width + gap && leftSpace > rightSpace) side = "left";

    const preferredLeft = side === "left"
      ? portraitRect.left - bubbleRect.width - gap
      : portraitRect.right + gap;
    const maxLeft = Math.max(margin, window.innerWidth - bubbleRect.width - margin);
    const viewportLeft = Math.min(maxLeft, Math.max(margin, preferredLeft));
    const preferredTop = portraitRect.top + portraitRect.height * 0.1;
    const maxTop = Math.max(margin, window.innerHeight - bubbleRect.height - margin);
    const viewportTop = Math.min(maxTop, Math.max(margin, preferredTop));

    bubble.dataset.side = side;
    root.style.setProperty("--floating-poem-left", `${viewportLeft - rootRect.left}px`);
    root.style.setProperty("--floating-poem-top", `${viewportTop - rootRect.top}px`);
  }, []);

  const clampToViewport = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || collapsed) return;

    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    let dx = 0;
    let dy = 0;
    if (rect.left < margin) dx += margin - rect.left;
    if (rect.right > window.innerWidth - margin) dx -= rect.right - (window.innerWidth - margin);
    if (rect.top < margin) dy += margin - rect.top;
    if (rect.bottom > window.innerHeight - margin) dy -= rect.bottom - (window.innerHeight - margin);
    if (!dx && !dy) return;

    setOffset((current) => {
      const next = { x: current.x + dx, y: current.y + dy };
      try {
        window.localStorage.setItem(positionStorageKey, JSON.stringify(next));
      } catch {
        // The portrait remains draggable when browser storage is unavailable.
      }
      return next;
    });
  }, [collapsed, positionStorageKey]);

  useEffect(() => {
    let savedOffset: Point | null = null;
    let shouldCollapse = false;
    try {
      const stored = window.localStorage.getItem(positionStorageKey);
      if (stored) {
        const saved = JSON.parse(stored) as Point;
        if (Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
          savedOffset = saved;
        }
      }
      shouldCollapse = window.localStorage.getItem(collapsedStorageKey) === "true";
    } catch {
      // Storage is an enhancement, not a requirement.
    }

    const frame = window.requestAnimationFrame(() => {
      if (savedOffset) setOffset(savedOffset);
      if (shouldCollapse) setCollapsed(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [collapsedStorageKey, positionStorageKey]);

  useEffect(() => {
    if (!bubbleOpen || !hasSpoken || collapsed) return;
    const frame = window.requestAnimationFrame(positionBubble);
    return () => window.cancelAnimationFrame(frame);
  }, [bubbleOpen, chineseOutput, collapsed, hasSpoken, offset, positionBubble, response]);

  useEffect(() => {
    if (!menuOpen) return;
    const frame = window.requestAnimationFrame(() => {
      const root = wrapperRef.current;
      const menu = menuRef.current;
      if (!root || !menu) return;
      const rootRect = root.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const margin = 8;
      const viewportLeft = Math.min(
        window.innerWidth - menuRect.width - margin,
        Math.max(margin, menuPoint.x),
      );
      const viewportTop = Math.min(
        window.innerHeight - menuRect.height - margin,
        Math.max(margin, menuPoint.y),
      );
      root.style.setProperty("--floating-menu-left", `${viewportLeft - rootRect.left}px`);
      root.style.setProperty("--floating-menu-top", `${viewportTop - rootRect.top}px`);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [menuOpen, menuPoint]);

  useEffect(() => {
    const closeMenu = (event: globalThis.PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
    const onResize = () => {
      clampToViewport();
      positionBubble();
      setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      if (restoreTimer.current !== null) window.clearTimeout(restoreTimer.current);
    };
  }, [clampToViewport, positionBubble]);

  const showContextMenu = (clientX: number, clientY: number) => {
    setMenuPoint({ x: clientX, y: clientY });
    setMenuOpen(true);
  };

  const sayLine = () => {
    speak();
    setBubbleOpen(true);
    setMenuOpen(false);
  };

  const collapsePortrait = () => {
    setBubbleOpen(false);
    setMenuOpen(false);
    setDragging(false);
    setOverrideMotion(null);
    setCollapsed(true);
    try {
      window.localStorage.setItem(collapsedStorageKey, "true");
    } catch {
      // Closing remains available when browser storage is unavailable.
    }
    window.requestAnimationFrame(() => restoreRef.current?.focus({ preventScroll: true }));
  };

  const restorePortrait = () => {
    setCollapsed(false);
    try {
      window.localStorage.removeItem(collapsedStorageKey);
    } catch {
      // Restoring remains available when browser storage is unavailable.
    }
    setOverrideMotion("wave");
    if (restoreTimer.current !== null) window.clearTimeout(restoreTimer.current);
    restoreTimer.current = window.setTimeout(() => setOverrideMotion(null), 620);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true });
      clampToViewport();
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuOpen(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startOffset: offset,
      startRect: rect,
      lastPointer: { x: event.clientX, y: event.clientY },
      currentOffset: offset,
      moved: false,
      held: false,
      holdTimer: 0,
    };

    if (event.pointerType === "touch" || event.pointerType === "pen") {
      const pointerId = event.pointerId;
      const clientX = event.clientX;
      const clientY = event.clientY;
      drag.current.holdTimer = window.setTimeout(() => {
        const active = drag.current;
        if (!active || active.pointerId !== pointerId || active.moved) return;
        active.held = true;
        setDragging(false);
        setOverrideMotion(null);
        showContextMenu(clientX, clientY);
      }, 520);
    }
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId || active.held) return;

    const rawX = event.clientX - active.startPointer.x;
    const rawY = event.clientY - active.startPointer.y;
    const stepX = event.clientX - active.lastPointer.x;
    active.lastPointer = { x: event.clientX, y: event.clientY };

    if (Math.hypot(rawX, rawY) > 6) {
      active.moved = true;
      window.clearTimeout(active.holdTimer);
      if (stepX > 1) setOverrideMotion("runningRight");
      if (stepX < -1) setOverrideMotion("runningLeft");
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

    window.clearTimeout(active.holdTimer);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    setDragging(false);
    setOverrideMotion(null);
    try {
      window.localStorage.setItem(positionStorageKey, JSON.stringify(active.currentOffset));
    } catch {
      // Dragging remains available when browser storage is unavailable.
    }

    if (!active.moved && !active.held && !cancelled) sayLine();
  };

  const onContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const active = drag.current;
    if (active) {
      window.clearTimeout(active.holdTimer);
      active.held = true;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    showContextMenu(event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + 24);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    showContextMenu(rect.left + rect.width / 2, rect.top + 24);
  };

  const widgetStyle = {
    "--drag-x": `${offset.x}px`,
    "--drag-y": `${offset.y}px`,
  } as CSSProperties;

  return (
    <div
      ref={wrapperRef}
      className={`floating-portrait ${dragging ? "is-dragging" : ""} ${collapsed ? "is-collapsed" : ""}`}
      style={widgetStyle}
    >
      {collapsed ? (
        <button
          ref={restoreRef}
          type="button"
          className="floating-restore"
          onClick={restorePortrait}
          aria-label={`重新显示 ${portrait.name}`}
          title="Show portrait"
        >
          {portrait.name}
        </button>
      ) : (
        <>
          {bubbleOpen && hasSpoken ? (
            <div ref={bubbleRef} className="floating-bubble" aria-live="polite">
              <blockquote>{response.line}</blockquote>
              {chineseOutput ? <p className="meaning">{response.meaning}</p> : null}
              <a href={response.source} target="_blank" rel="noreferrer">
                {response.title} ↗
              </a>
            </div>
          ) : null}

          {menuOpen ? (
            <div ref={menuRef} className="floating-context-menu" role="menu">
              <button type="button" role="menuitem" onClick={collapsePortrait}>
                关闭人物
              </button>
            </div>
          ) : null}

          <button
            ref={triggerRef}
            className="floating-pet-button"
            type="button"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => finishPointer(event)}
            onPointerCancel={(event) => finishPointer(event, true)}
            onContextMenu={onContextMenu}
            onKeyDown={onKeyDown}
            onClick={(event) => {
              if (event.detail === 0) sayLine();
            }}
            aria-label={`拖拽 ${portrait.name}，点击听一句诗，右键或长按关闭`}
            aria-expanded={bubbleOpen}
          >
            <AnimatedPortrait portrait={portrait} motion={overrideMotion ?? motion} />
          </button>
        </>
      )}
    </div>
  );
}
