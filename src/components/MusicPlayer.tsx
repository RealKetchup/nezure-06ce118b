import { useEffect, useRef, useState } from "react";
import trackAsset from "@/assets/nouveau-opps.mp3.asset.json";

const TRACK_TITLE = "NOUVEAU OPPS";
const TRACK_ARTIST = "now playing";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setTime({ cur: a.currentTime, dur: a.duration || 0 });
      setProgress(a.duration ? a.currentTime / a.duration : 0);
    };
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onTime);
    a.addEventListener("ended", onEnd);

    // Try autoplay; if browser blocks it, start on first user interaction.
    const tryPlay = async () => {
      try {
        await a.play();
        setPlaying(true);
      } catch {
        const start = async () => {
          try {
            await a.play();
            setPlaying(true);
          } catch {
            /* ignore */
          }
          window.removeEventListener("pointerdown", start);
          window.removeEventListener("keydown", start);
          window.removeEventListener("touchstart", start);
        };
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
        window.addEventListener("touchstart", start, { once: true });
      }
    };
    tryPlay();

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch {
        /* ignore */
      }
    }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-30 w-[280px] overflow-hidden rounded-xl border border-border glass shadow-card">
      <audio ref={audioRef} src={trackAsset.url} preload="auto" autoPlay loop />
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">music.py</span>
        <span className="ml-auto flex items-end gap-[2px] h-4">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-sm bg-primary"
              style={{
                height: playing ? "100%" : "20%",
                animation: playing
                  ? `eqbar 0.${6 + i}s ease-in-out ${i * 0.1}s infinite alternate`
                  : "none",
                opacity: playing ? 1 : 0.4,
              }}
            />
          ))}
        </span>
      </div>

      <div className="flex items-center gap-3 p-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-transform hover:scale-105"
          style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.5))" }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M7 5v14l12-7z" /></svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{TRACK_TITLE}</div>
          <div className="truncate text-[11px] text-py-comment">{TRACK_ARTIST}</div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-py-comment tabular-nums">
            <span>{fmt(time.cur)}</span>
            <span>{fmt(time.dur)}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes eqbar {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
