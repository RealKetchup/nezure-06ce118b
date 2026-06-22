import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: number;
};

type Ripple = { x: number; y: number; t: number };

export function CursorFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let w = (canvas.width = window.innerWidth * devicePixelRatio);
    let h = (canvas.height = window.innerHeight * devicePixelRatio);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const onResize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    window.addEventListener("resize", onResize);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: mouse.x, y: mouse.y };
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    let lastSpawn = 0;
    let hueBase = 270; // primary-ish purple/blue
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;

      const now = performance.now();
      if (now - lastSpawn > 16) {
        lastSpawn = now;
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: mouse.x,
            y: mouse.y,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6 - 0.2,
            life: 0,
            max: 40 + Math.random() * 30,
            size: 2 + Math.random() * 2.5,
            hue: hueBase + (Math.random() - 0.5) * 40,
          });
        }
      }

      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest('a, button, [role="button"], input, textarea, select, label');
      if (interactive !== hovering) {
        hovering = interactive;
        ring.classList.toggle("cursor-ring--hover", hovering);
        dot.classList.toggle("cursor-dot--hover", hovering);
      }
    };

    const onDown = (e: MouseEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, t: 0 });
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 3;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 0,
          max: 50 + Math.random() * 30,
          size: 2 + Math.random() * 3,
          hue: hueBase + (Math.random() - 0.5) * 60,
        });
      }
      hueBase = (hueBase + 25) % 360;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);

    let raf = 0;
    const loop = () => {
      // Trailing ring (lerp)
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;

      ctx.clearRect(0, 0, w, h);

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.vx *= 0.985;
        p.vy *= 0.985;
        const t = 1 - p.life / p.max;
        if (t <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const r = p.size * t;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${0.7 * t})`);
        grad.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t++;
        const prog = r.t / 40;
        if (prog >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8 + prog * 70, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hueBase}, 90%, 70%, ${1 - prog})`;
        ctx.lineWidth = 2 * (1 - prog);
        ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.body.classList.add("cursor-fx-active");

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-fx-active");
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9998]"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border border-primary/70"
        style={{ transition: "width .2s, height .2s, background-color .2s" }}
        aria-hidden
      />
      <div
        ref={dotRef}
        className="cursor-dot pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-primary"
        style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.9)" }}
        aria-hidden
      />
      <style>{`
        @media (pointer: fine) {
          .cursor-fx-active, .cursor-fx-active * { cursor: none !important; }
        }
        .cursor-ring--hover { width: 48px !important; height: 48px !important; background: hsl(var(--primary) / 0.15); }
        .cursor-dot--hover { transform-origin: center; }
      `}</style>
    </>
  );
}
