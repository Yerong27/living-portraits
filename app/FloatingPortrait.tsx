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

const keyboardDirections: Record<string, Point> = {
  arrowleft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
  arrowup: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
};

function motionForDirection(direction: Point): Motion {
  if (direction.x < 0) return "runningLeft";
  if (direction.x > 0) return "runningRight";
  if (direction.y < 0) return "walkingUp";
  return "walkingDown";
}

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
  const [selected, setSelected] = useState(false);
  const [overrideMotion, setOverrideMotion] = useState<Motion | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<DragState | null>(null);
  const keyboardKeys = useRef(new Set<string>());
  const keyboardFrame = useRef<number | null>(null);
  const keyboardLastTime = useRef<number | null>(null);
  const keyboardFast = useRef(false);
  const keyboardPosition = useRef<Point>({ x: 0, y: 0 });
  const lastKeyboardMotion = useRef<Motion>("runningRight");
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
    const sprite = trigger.querySelector<HTMLElement>(".pet-sprite");
    const portraitRect = sprite?.getBoundingClientRect() ?? trigger.getBoundingClientRect();
    root.style.removeProperty("--floating-poem-max-width");
    let bubbleRect = bubble.getBoundingClientRect();
    const rightSpace = window.innerWidth - portraitRect.right;
    const leftSpace = portraitRect.left;
    let side = portraitRect.left + portraitRect.width / 2 >= window.innerWidth / 2 || rightSpace < 280
      ? "left"
      : "right";

    if (side === "left" && leftSpace < bubbleRect.width + gap && rightSpace > leftSpace) side = "right";
    if (side === "right" && rightSpace < bubbleRect.width + gap && leftSpace > rightSpace) side = "left";

    const availableSpace = side === "left" ? leftSpace : rightSpace;
    if (availableSpace < bubbleRect.width + gap + margin) {
      root.style.setProperty(
        "--floating-poem-max-width",
        `${Math.max(92, availableSpace - gap - margin)}px`,
      );
      bubbleRect = bubble.getBoundingClientRect();
    }

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

  const moveFromKeyboard = useCallback(function frame(timestamp: number) {
    const trigger = triggerRef.current;
    if (!trigger || keyboardKeys.current.size === 0) {
      keyboardFrame.current = null;
      keyboardLastTime.current = null;
      return;
    }

    const isPressed = (...keys: string[]) => keys.some((key) => keyboardKeys.current.has(key));
    const direction = {
      x: Number(isPressed("arrowright", "d")) - Number(isPressed("arrowleft", "a")),
      y: Number(isPressed("arrowdown", "s")) - Number(isPressed("arrowup", "w")),
    };
    if (direction.x || direction.y) {
      const nextMotion = motionForDirection(direction);
      if (lastKeyboardMotion.current !== nextMotion) {
        lastKeyboardMotion.current = nextMotion;
        setOverrideMotion(nextMotion);
      }
    }
    const elapsed = keyboardLastTime.current === null
      ? 0
      : Math.min((timestamp - keyboardLastTime.current) / 1000, 0.05);
    keyboardLastTime.current = timestamp;

    if (elapsed > 0 && (direction.x || direction.y)) {
      const rect = trigger.getBoundingClientRect();
      const speed = keyboardFast.current ? 620 : 360;
      const magnitude = Math.hypot(direction.x, direction.y) || 1;
      const requestedX = direction.x / magnitude * speed * elapsed;
      const requestedY = direction.y / magnitude * speed * elapsed;
      const margin = 8;
      const dx = Math.min(
        window.innerWidth - margin - rect.right,
        Math.max(margin - rect.left, requestedX),
      );
      const dy = Math.min(
        window.innerHeight - margin - rect.bottom,
        Math.max(margin - rect.top, requestedY),
      );

      setOffset((current) => {
        const next = { x: current.x + dx, y: current.y + dy };
        keyboardPosition.current = next;
        return next;
      });
    }

    keyboardFrame.current = window.requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    keyboardPosition.current = offset;
  }, [offset]);

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
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) setMenuOpen(false);
      if (!wrapperRef.current?.contains(target)) setSelected(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSelected(false);
        triggerRef.current?.blur();
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
      if (keyboardFrame.current !== null) window.cancelAnimationFrame(keyboardFrame.current);
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

  const finishKeyboardMovement = () => {
    keyboardKeys.current.clear();
    keyboardFast.current = false;
    keyboardLastTime.current = null;
    if (keyboardFrame.current !== null) {
      window.cancelAnimationFrame(keyboardFrame.current);
      keyboardFrame.current = null;
    }
    setDragging(false);
    setOverrideMotion(null);
    try {
      window.localStorage.setItem(positionStorageKey, JSON.stringify(keyboardPosition.current));
    } catch {
      // Keyboard movement remains available when browser storage is unavailable.
    }
  };

  const collapsePortrait = () => {
    setBubbleOpen(false);
    setMenuOpen(false);
    finishKeyboardMovement();
    setSelected(false);
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

    finishKeyboardMovement();
    setSelected(true);
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
    const key = event.key.toLowerCase();
    const direction = keyboardDirections[key];

    if (direction) {
      event.preventDefault();
      setSelected(true);
      setMenuOpen(false);
      keyboardKeys.current.add(key);
      keyboardFast.current = event.shiftKey;

      lastKeyboardMotion.current = motionForDirection(direction);
      setOverrideMotion(lastKeyboardMotion.current);
      setDragging(true);
      keyboardPosition.current = offset;
      if (keyboardFrame.current === null) {
        keyboardLastTime.current = null;
        keyboardFrame.current = window.requestAnimationFrame(moveFromKeyboard);
      }
      return;
    }

    if (key === "shift") keyboardFast.current = true;

    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      showContextMenu(rect.left + rect.width / 2, rect.top + 24);
    }
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key.toLowerCase();
    if (key === "shift") {
      keyboardFast.current = false;
      return;
    }
    if (!keyboardDirections[key]) return;
    event.preventDefault();
    keyboardKeys.current.delete(key);
    keyboardFast.current = event.shiftKey;
    if (keyboardKeys.current.size === 0) finishKeyboardMovement();
  };

  const onPortraitBlur = () => {
    finishKeyboardMovement();
    window.requestAnimationFrame(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) setSelected(false);
    });
  };

  const widgetStyle = {
    "--drag-x": `${offset.x}px`,
    "--drag-y": `${offset.y}px`,
  } as CSSProperties;

  return (
    <>
      {selected && !collapsed ? <div className="floating-demo-backdrop" aria-hidden="true" /> : null}
      <div
        ref={wrapperRef}
        className={`floating-portrait ${dragging ? "is-dragging" : ""} ${selected ? "is-selected" : ""} ${collapsed ? "is-collapsed" : ""}`}
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

          <div className="floating-figure">
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
              onKeyUp={onKeyUp}
              onFocus={() => setSelected(true)}
              onBlur={onPortraitBlur}
              onClick={(event) => {
                if (event.detail === 0) sayLine();
              }}
              aria-label={`拖拽或使用方向键与 WASD 移动 ${portrait.name}，点击听一句诗，右键或长按关闭`}
              aria-expanded={bubbleOpen}
            >
              <AnimatedPortrait portrait={portrait} motion={overrideMotion ?? motion} />
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
}
