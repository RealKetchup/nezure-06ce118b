import { useEffect } from "react";

/**
 * Site-wide visual FX:
 *  - Custom green→black gradient cursor (via SVG cursor URL)
 *  - Click ripple + green glow burst at the click point
 *  - Ambient floating particles in the background
 *  - guns.lol style tab-title typewriter (delete + retype loop)
 */
export function CursorFX() {
  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    // ---------- Custom gradient cursor ----------
    if (!isCoarse) {
      const cursorSvg = `
        <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0%' stop-color='#22ff88'/>
              <stop offset='100%' stop-color='#001a08'/>
            </linearGradient>
            <filter id='glow'>
              <feGaussianBlur stdDeviation='0.8' result='b'/>
              <feMerge><feMergeNode in='b'/><feMergeNode in='SourceGraphic'/></feMerge>
            </filter>
          </defs>
          <path d='M3 2 L3 22 L9 17 L12 25 L15 24 L12 16 L20 16 Z'
                fill='url(#g)' stroke='#00ff88' stroke-width='1' stroke-linejoin='round'
                filter='url(#glow)'/>
        </svg>`.trim();
      const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(cursorSvg)}") 2 2, auto`;
      document.documentElement.style.cursor = url;
      const style = document.createElement("style");
      style.id = "cursorfx-style";
      style.textContent = `* { cursor: ${url}; }
        a, button, [role="button"], input, textarea, select, label { cursor: ${url}; }`;
      document.head.appendChild(style);
    }

    // ---------- Click ripple / glow burst ----------
    const onDown = (e: MouseEvent) => {
      const burst = document.createElement("div");
      burst.className = "fx-burst";
      burst.style.left = e.clientX + "px";
      burst.style.top = e.clientY + "px";
      document.body.appendChild(burst);

      // particles
      for (let i = 0; i < 10; i++) {
        const p = document.createElement("span");
        p.className = "fx-spark";
        const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
        const d = 30 + Math.random() * 40;
        p.style.left = e.clientX + "px";
        p.style.top = e.clientY + "px";
        p.style.setProperty("--dx", `${Math.cos(a) * d}px`);
        p.style.setProperty("--dy", `${Math.sin(a) * d}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 700);
      }
      setTimeout(() => burst.remove(), 800);
    };
    window.addEventListener("mousedown", onDown);

    // ---------- Ambient floating particles ----------
    const ambient = document.createElement("div");
    ambient.className = "fx-ambient";
    ambient.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("span");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = -Math.random() * 18 + "s";
      p.style.animationDuration = 14 + Math.random() * 14 + "s";
      p.style.opacity = String(0.25 + Math.random() * 0.5);
      p.style.transform = `scale(${0.5 + Math.random() * 1.2})`;
      ambient.appendChild(p);
    }
    document.body.appendChild(ambient);

    // ---------- Tab title typewriter (guns.lol style) ----------
    const phrases = ["nezure", "~/about.py", "hamburbur", "made by ketchup"];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const word = phrases[phraseIdx];
      charIdx += deleting ? -1 : 1;
      document.title = word.slice(0, charIdx) + (Math.random() > 0.5 ? "▍" : " ");
      let delay = deleting ? 70 : 130;
      if (!deleting && charIdx === word.length) {
        delay = 1400;
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        delay = 400;
      }
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 600);

    // ---------- Inject FX stylesheet ----------
    const fxStyle = document.createElement("style");
    fxStyle.id = "cursorfx-fx";
    fxStyle.textContent = `
      .fx-burst {
        position: fixed; pointer-events: none; z-index: 9998;
        width: 10px; height: 10px; border-radius: 9999px;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(0,255,140,0.9) 0%, rgba(0,255,140,0.4) 40%, rgba(0,255,140,0) 70%);
        animation: fx-burst 800ms ease-out forwards;
        mix-blend-mode: screen;
      }
      @keyframes fx-burst {
        0%   { width:10px; height:10px; opacity:1; box-shadow: 0 0 30px 4px rgba(0,255,140,0.9); }
        100% { width:180px; height:180px; opacity:0; box-shadow: 0 0 0 0 rgba(0,255,140,0); }
      }
      .fx-spark {
        position: fixed; pointer-events: none; z-index: 9998;
        width: 5px; height: 5px; border-radius: 9999px;
        background: #00ff88;
        box-shadow: 0 0 10px 2px #00ff88;
        transform: translate(-50%, -50%);
        animation: fx-spark 700ms ease-out forwards;
      }
      @keyframes fx-spark {
        0%   { opacity: 1; transform: translate(-50%, -50%) translate(0,0) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.2); }
      }
      .fx-ambient {
        position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
      }
      .fx-ambient span {
        position: absolute; bottom: -20px;
        width: 6px; height: 6px; border-radius: 9999px;
        background: radial-gradient(circle, #00ff88 0%, rgba(0,255,140,0) 70%);
        box-shadow: 0 0 12px rgba(0,255,140,0.6);
        animation: fx-float linear infinite;
      }
      @keyframes fx-float {
        0%   { transform: translateY(0) translateX(0); }
        50%  { transform: translateY(-55vh) translateX(20px); }
        100% { transform: translateY(-110vh) translateX(-10px); opacity: 0; }
      }
    `;
    document.head.appendChild(fxStyle);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.clearTimeout(timer);
      document.documentElement.style.cursor = "";
      document.getElementById("cursorfx-style")?.remove();
      document.getElementById("cursorfx-fx")?.remove();
      ambient.remove();
    };
  }, []);

  return null;
}
