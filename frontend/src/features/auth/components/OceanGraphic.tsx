import { useEffect, useRef } from "react";
import { cn } from "cn";

const TAU = Math.PI * 2;
const STEP = 4; // px between wave samples

// Far to near: lighter and calmer at the horizon, darker and livelier up close.
const LAYERS = ["#86bfe0", "#5fa3d3", "#3d86c2", "#2768a8", "#184c8a", "#0d3167"];

interface Splash {
  x: number;
  layer: number;
  age: number;
}

interface Sea {
  /** Wave time; runs faster while the sea is stirred. */
  clock: number;
  /** Raised by fast pointer movement and clicks, decays back to calm. */
  energy: number;
  /** `energy`, eased, so a click doesn't make the waves jump. */
  swell: number;
  /** Pointer over the window, -1..1: target and eased. */
  tx: number;
  ty: number;
  px: number;
  py: number;
  /** Pointer in canvas px: target and eased. */
  tlx: number;
  tly: number;
  lx: number;
  ly: number;
  over: boolean;
  /** 0..1, eased: how much the pointer is over the panel. */
  hover: number;
  splashes: Splash[];
}

function createSea(): Sea {
  return {
    clock: 0,
    energy: 0,
    swell: 0,
    tx: 0,
    ty: 0,
    px: 0,
    py: 0,
    tlx: 0,
    tly: 0,
    lx: 0,
    ly: 0,
    over: false,
    hover: 0,
    splashes: [],
  };
}

const layerBase = (i: number, h: number) => h * (0.36 + i * (0.67 / LAYERS.length));

function waveY(sea: Sea, i: number, x: number, w: number, h: number) {
  const depth = (i + 1) / LAYERS.length;
  const base = layerBase(i, h) + sea.py * h * 0.025 * depth;
  const amp = h * (0.01 + depth * 0.028) * (1 + sea.swell * 0.9);
  const len = w * (0.3 + depth * 0.55);
  const X = ((x + sea.px * w * 0.07 * depth) / len) * TAU;
  const phase = sea.clock * (0.2 + depth * 0.3) + i * 1.7;
  let y = base + Math.sin(X + phase) * amp + Math.sin(X * 2.3 - phase * 1.3 + i) * amp * 0.35;

  // The water nearest the pointer rises toward it.
  if (sea.hover > 0.001) {
    const dx = x - sea.lx;
    const dy = base - sea.ly;
    y -=
      sea.hover *
      h *
      0.05 *
      Math.exp(-(dx * dx) / (2 * (w * 0.12) ** 2)) *
      Math.exp(-(dy * dy) / (2 * (h * 0.12) ** 2));
  }

  // Click ripples run outward along their wave, a little along its neighbours.
  for (const s of sea.splashes) {
    const strength = s.layer === i ? 1 : Math.abs(s.layer - i) === 1 ? 0.4 : 0;
    if (!strength) continue;
    const d = Math.abs(x - s.x) - s.age * w * 0.35;
    const envelope = Math.exp(-(d * d) / (2 * (w * 0.06) ** 2)) * Math.exp(-s.age * 0.9);
    y -= strength * h * 0.045 * envelope * Math.cos(d / (w * 0.035));
  }
  return y;
}

function step(sea: Sea, dt: number) {
  const ease = (rate: number) => 1 - Math.exp(-dt * rate);
  sea.px += (sea.tx - sea.px) * ease(4);
  sea.py += (sea.ty - sea.py) * ease(4);
  sea.lx += (sea.tlx - sea.lx) * ease(10);
  sea.ly += (sea.tly - sea.ly) * ease(10);
  sea.hover += ((sea.over ? 1 : 0) - sea.hover) * ease(4);
  sea.energy *= Math.exp(-dt / 1.5);
  sea.swell += (sea.energy - sea.swell) * ease(3);
  sea.clock += dt * (1 + sea.swell * 1.5);
  for (const s of sea.splashes) s.age += dt;
  sea.splashes = sea.splashes.filter((s) => s.age < 4);
}

function splash(sea: Sea, x: number, y: number, h: number) {
  let layer = 0;
  for (let i = 1; i < LAYERS.length; i++) {
    if (Math.abs(layerBase(i, h) - y) < Math.abs(layerBase(layer, h) - y)) layer = i;
  }
  sea.splashes = [...sea.splashes.slice(-5), { x, layer, age: 0 }];
  sea.energy = Math.min(1, sea.energy + 0.3);
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, sea: Sea) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#e4f0f8");
  sky.addColorStop(1, "#a8cfe8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // The light drifts with the pointer and leans toward it over the panel.
  const pull = sea.hover * 0.6;
  const gx = w * (0.68 - sea.px * 0.05) * (1 - pull) + sea.lx * pull;
  const gy = h * (0.2 - sea.py * 0.03) * (1 - pull) + Math.min(sea.ly, h * 0.3) * pull;
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
  glow.addColorStop(0, "rgba(255,255,255,0.85)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  LAYERS.forEach((color, i) => {
    const depth = (i + 1) / LAYERS.length;
    const ys: number[] = [];
    for (let x = 0; x <= w + STEP; x += STEP) ys.push(waveY(sea, i, x, w, h));

    ctx.beginPath();
    ctx.moveTo(0, h);
    ys.forEach((y, k) => ctx.lineTo(k * STEP, y));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Crests whiten as the sea gets rougher.
    ctx.beginPath();
    ys.forEach((y, k) => (k ? ctx.lineTo(k * STEP, y) : ctx.moveTo(0, y)));
    ctx.strokeStyle = `rgba(255,255,255,${0.28 - depth * 0.16 + sea.swell * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

/**
 * Decorative swell for the sign-in page. Follows the pointer across the window, rises toward it over
 * the panel, gets rougher when the pointer moves fast, and ripples where the panel is clicked.
 * Draws one still frame when the user prefers reduced motion.
 */
export function OceanGraphic({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sea = createSea();
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let w = 0;
    let h = 0;

    const observer = new ResizeObserver(() => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion && w > 0) draw(ctx, w, h, sea);
    });
    observer.observe(canvas);
    if (reduceMotion) return () => observer.disconnect();

    let last: { x: number; y: number } | null = null;
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      sea.tx = (event.clientX / window.innerWidth) * 2 - 1;
      sea.ty = (event.clientY / window.innerHeight) * 2 - 1;
      sea.tlx = event.clientX - rect.left;
      sea.tly = event.clientY - rect.top;
      sea.over = sea.tlx >= 0 && sea.tly >= 0 && sea.tlx <= rect.width && sea.tly <= rect.height;
      if (last) {
        const moved = Math.hypot(event.clientX - last.x, event.clientY - last.y);
        sea.energy = Math.min(1, sea.energy + moved / 4000);
      }
      last = { x: event.clientX, y: event.clientY };
    };
    const onLeave = () => {
      sea.over = false;
      last = null;
    };
    const onDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      splash(sea, event.clientX - rect.left, event.clientY - rect.top, rect.height);
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      step(sea, Math.min(0.05, (now - previous) / 1000));
      previous = now;
      if (w > 0) draw(ctx, w, h, sea);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={cn("block size-full", className)} />;
}
