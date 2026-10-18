import { useCallback, useEffect, useRef, useState } from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

const mod = (i, n) => ((i % n) + n) % n;

// Phones get slightly shorter cards so the drum stays compact.
const useRowHeight = () => {
  const query = "(min-width: 768px)";
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setWide(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return wide ? 68 : 60;
};

// A looping drum, like setting the hours on a clock: spin it with the mouse
// wheel, a drag or swipe, the arrow buttons or the arrow keys. Past the last
// entry it carries on with the first. The card in the middle is the focused
// one; the cards above and below curve away, shrink and fade.
//
// There is no scrolling list underneath (so no scrollbar): a fixed window shows
// five cards placed by a position that eases towards its target, wrapping with
// modulo, so the loop is exact and costs nothing however many entries exist.
// Based on the looping wheel used for the GH Procurement FAQ.
//
// items: [{key, label, sub}]. onFocusChange(index) fires once the drum stops.
const Wheel = ({ items, label, noun = "entry", onFocusChange }) => {
  const n = items.length;
  const height = useRowHeight();
  const spins = n > 1;
  const box = useRef(null);
  const [pos, setPos] = useState(0); // which entry is in the middle (a fraction while moving)
  const state = useRef({ pos: 0, target: 0, raf: 0, kick: null, drag: null, moved: false, idle: 0 });
  const settle = useRef(onFocusChange);
  useEffect(() => {
    settle.current = onFocusChange;
  }, [onFocusChange]);

  // The motion: ease towards the target, and report which entry is in the middle once it stops.
  useEffect(() => {
    const s = state.current;
    function tick() {
      s.pos += (s.target - s.pos) * 0.22;
      if (Math.abs(s.target - s.pos) < 0.002) s.pos = s.target;
      setPos(s.pos);
      if (s.pos === s.target) {
        s.raf = 0;
        settle.current?.(mod(Math.round(s.pos), n));
      } else s.raf = requestAnimationFrame(tick);
    }
    s.kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    };
    return () => cancelAnimationFrame(s.raf);
  }, [n]);

  const go = useCallback((target) => {
    const s = state.current;
    s.target = target;
    s.kick?.();
  }, []);
  const step = (by) => spins && go(Math.round(state.current.target) + by);

  // The mouse wheel spins it while the pointer is over it (it must not also scroll the page).
  useEffect(() => {
    const el = box.current;
    if (!el || !spins) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const s = state.current;
      s.target += (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) / (height * 1.4);
      clearTimeout(s.idle);
      s.idle = setTimeout(() => go(Math.round(s.target)), 110); // settle on the nearest one
      s.kick?.();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go, height, spins]);

  useEffect(() => () => clearTimeout(state.current.idle), []);

  const down = (e) => {
    if (!spins) return;
    e.preventDefault(); // no text selection while dragging
    box.current?.focus({ preventScroll: true });
    const s = state.current;
    s.drag = { y: e.clientY, start: s.target, id: e.pointerId, last: e.clientY, t: e.timeStamp, v: 0 };
    s.moved = false;
  };
  const move = (e) => {
    const s = state.current;
    const d = s.drag;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 6 && !s.moved) {
      s.moved = true;
      box.current?.setPointerCapture?.(d.id);
    }
    if (!s.moved) return;
    d.v = (e.clientY - d.last) / Math.max(1, e.timeStamp - d.t);
    d.last = e.clientY;
    d.t = e.timeStamp;
    s.pos = s.target = d.start - dy / height;
    setPos(s.pos);
  };
  const up = (e) => {
    const s = state.current;
    const d = s.drag;
    s.drag = null;
    const v = d && e.timeStamp - d.t < 90 ? d.v : 0; // holding still before letting go means no flick
    // a flick carries on a little (at most 2 rows)
    if (d && s.moved) go(Math.round(s.target - Math.max(-2, Math.min(2, (v * 120) / height))));
  };
  // a drag must not count as a click on a card
  const stopClick = (e) => {
    if (state.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      state.current.moved = false;
    }
  };

  const onKey = (e) => {
    const keys = { ArrowDown: 1, ArrowUp: -1, PageDown: 3, PageUp: -3 };
    if (e.key in keys) {
      e.preventDefault();
      step(keys[e.key]);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      // the first / last entry, whichever copy of the loop is nearest
      const from = Math.round(state.current.target);
      if (spins) go(from - mod(from, n) + (e.key === "Home" ? 0 : n - 1));
    }
  };

  const base = Math.round(pos);
  const centre = mod(base, n);
  const rows = (spins ? [-2, -1, 0, 1, 2] : [0]).map((k) => ({
    k,
    d: base + k - pos, // how far this card is from the middle, in rows
    item: items[mod(base + k, n)],
    index: mod(base + k, n),
  }));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-fg/70" aria-live="polite">
          {noun[0].toUpperCase() + noun.slice(1)} {n ? centre + 1 : 0} of {n}
          {spins && <span className="hidden font-medium text-fg/50 sm:inline"> · scroll or drag</span>}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label={`Previous ${noun}`}
            disabled={!spins}
            onClick={() => step(-1)}
            className="flex size-12 md:size-9 items-center justify-center rounded-full border border-frame_border bg-frame_bg text-lg text-text_color hover:border-text_color/50 disabled:opacity-30"
          >
            <HiChevronUp />
          </button>
          <button
            type="button"
            aria-label={`Next ${noun}`}
            disabled={!spins}
            onClick={() => step(1)}
            className="flex size-12 md:size-9 items-center justify-center rounded-full border border-frame_border bg-frame_bg text-lg text-text_color hover:border-text_color/50 disabled:opacity-30"
          >
            <HiChevronDown />
          </button>
        </div>
      </div>

      <div
        ref={box}
        role="group"
        aria-label={`${label}. Use the up and down arrow keys to spin.`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={stopClick}
        className="relative select-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-text_color/50"
        style={{
          height: height * 3,
          touchAction: spins ? "none" : "auto",
          perspective: 700,
          cursor: spins ? "grab" : "default",
        }}
      >
        {/* the band that marks the middle row */}
        <div
          className="pointer-events-none absolute inset-x-1 rounded-2xl border-2 border-text_color/25 bg-text_color/5"
          style={{ top: height, height }}
          aria-hidden="true"
        />
        {rows.map(({ k, d, item, index }) => {
          const a = Math.abs(d);
          const middle = a < 0.5;
          return (
            <div
              key={k}
              className="absolute inset-x-2"
              aria-hidden={!middle}
              style={{
                top: height + d * height,
                height: height - 8,
                marginTop: 4,
                opacity: Math.max(0, 1 - a * 0.55),
                // tilt each card away from the middle, like it sits on a drum
                transform: `scale(${1 - Math.min(a, 2) * 0.08}) rotateX(${-d * 24}deg)`,
                zIndex: 10 - Math.round(a * 2),
                pointerEvents: a > 1.6 ? "none" : "auto",
              }}
            >
              <div
                role={middle ? undefined : "button"}
                tabIndex={-1}
                onClick={middle ? undefined : () => go(Math.round(pos) + k)}
                aria-label={middle ? undefined : `Show ${noun} ${index + 1}`}
                className={`flex h-full flex-col justify-center rounded-2xl border bg-frame_bg px-4 text-center ${
                  middle
                    ? "border-text_color/40 shadow-[0_10px_26px_rgba(0,0,0,.14)]"
                    : "cursor-pointer border-frame_border shadow-[0_6px_16px_rgba(0,0,0,.08)]"
                }`}
              >
                <span
                  className={`truncate text-sm ${middle ? "font-extrabold text-text_color" : "font-bold text-fg/70"}`}
                >
                  {item.label}
                </span>
                {item.sub && <span className="truncate text-xs text-fg/60">{item.sub}</span>}
              </div>
            </div>
          );
        })}
        {/* the top and bottom fade, where the drum turns away */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-body_bg to-transparent"
          style={{ zIndex: 20 }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-body_bg to-transparent"
          style={{ zIndex: 20 }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default Wheel;
