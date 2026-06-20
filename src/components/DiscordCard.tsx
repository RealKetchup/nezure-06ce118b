import { useEffect, useState } from "react";

// Lanyard API: https://github.com/Phineas/lanyard
// User must join discord.gg/lanyard, then replace DISCORD_USER_ID below.
const DISCORD_USER_ID = "00000000000000000000"; // ← replace with your Discord user ID

interface LanyardActivity {
  id: string;
  name: string;
  type: number; // 0=playing,1=streaming,2=listening,3=watching,4=custom,5=competing
  state?: string;
  details?: string;
  application_id?: string;
  timestamps?: { start?: number; end?: number };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  emoji?: { name: string; id?: string; animated?: boolean };
  sync_id?: string; // spotify track id
}

interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    global_name?: string;
    discriminator: string;
    avatar: string | null;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: {
    track_id: string;
    timestamps: { start: number; end: number };
    album: string;
    album_art_url: string;
    artist: string;
    song: string;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  online: "oklch(0.78 0.16 145)",
  idle: "oklch(0.78 0.13 90)",
  dnd: "oklch(0.7 0.2 25)",
  offline: "oklch(0.5 0.02 240)",
};

const STATUS_LABELS: Record<string, string> = {
  online: "online",
  idle: "idle",
  dnd: "do not disturb",
  offline: "offline",
};

const ACTIVITY_VERB: Record<number, string> = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};

function discordCdn(appId: string, imageHash: string): string {
  if (imageHash.startsWith("mp:external/")) {
    return `https://media.discordapp.net/${imageHash.replace("mp:", "")}`;
  }
  if (imageHash.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${imageHash.replace("spotify:", "")}`;
  }
  return `https://cdn.discordapp.com/app-assets/${appId}/${imageHash}.png`;
}

export function DiscordCard() {
  const [data, setData] = useState<LanyardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const notConfigured = DISCORD_USER_ID === "00000000000000000000";

  useEffect(() => {
    if (notConfigured) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setData(json.data);
          setError(null);
        } else {
          setError(json.error?.message ?? "Not monitored. Join discord.gg/lanyard");
        }
      } catch {
        if (!cancelled) setError("Could not reach Lanyard");
      }
    };
    load();
    const iv = setInterval(load, 15000);
    const tickIv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
      clearInterval(tickIv);
    };
  }, [notConfigured]);

  const status = data?.discord_status ?? "offline";
  const avatarUrl = data?.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.${data.discord_user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  const customStatus = data?.activities.find((a) => a.type === 4);
  const mainActivity = data?.activities.find((a) => a.type !== 4);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/80" />
          <span className="h-3 w-3 rounded-full bg-secondary/80" />
          <span className="h-3 w-3 rounded-full bg-primary/80" />
        </div>
        <span className="text-xs text-muted-foreground">discord_presence.live</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full pulse-dot"
            style={{ backgroundColor: STATUS_COLORS[status], color: STATUS_COLORS[status] }}
          />
          {notConfigured ? "setup needed" : data ? STATUS_LABELS[status] : "connecting..."}
        </span>
      </div>

      <div className="p-5">
        {notConfigured ? (
          <SetupNotice />
        ) : error ? (
          <ErrorNotice message={error} />
        ) : !data ? (
          <p className="text-sm text-py-comment"># fetching presence...</p>
        ) : (
          <>
            {/* Profile row */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={data.discord_user.username}
                  className="h-16 w-16 rounded-lg ring-2 ring-border"
                />
                <span
                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-card"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-foreground">
                  {data.discord_user.global_name ?? data.discord_user.username}
                </div>
                <div className="text-xs text-py-comment">@{data.discord_user.username}</div>
                {customStatus && (
                  <div className="mt-1 truncate text-xs text-py-string">
                    {customStatus.emoji?.name} {customStatus.state}
                  </div>
                )}
              </div>
            </div>

            {/* Spotify */}
            {data.listening_to_spotify && data.spotify && (
              <ActivityBlock
                verb="Listening on"
                accent="Spotify"
                title={data.spotify.song}
                subtitle={`by ${data.spotify.artist}`}
                detail={`on ${data.spotify.album}`}
                image={data.spotify.album_art_url}
                progress={{
                  start: data.spotify.timestamps.start,
                  end: data.spotify.timestamps.end,
                  now: Date.now() + tick * 0, // tick triggers rerender
                }}
              />
            )}

            {/* Main activity (game / app) */}
            {mainActivity && !data.listening_to_spotify && (
              <ActivityBlock
                verb={ACTIVITY_VERB[mainActivity.type] ?? "Doing"}
                accent={mainActivity.name}
                title={mainActivity.details ?? mainActivity.name}
                subtitle={mainActivity.state}
                detail={mainActivity.assets?.large_text}
                image={
                  mainActivity.assets?.large_image && mainActivity.application_id
                    ? discordCdn(mainActivity.application_id, mainActivity.assets.large_image)
                    : undefined
                }
                progress={
                  mainActivity.timestamps?.start
                    ? { start: mainActivity.timestamps.start, end: 0, now: Date.now() + tick * 0 }
                    : undefined
                }
              />
            )}

            {!mainActivity && !data.listening_to_spotify && (
              <p className="mt-4 text-sm text-py-comment"># no current activity</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ActivityBlock({
  verb,
  accent,
  title,
  subtitle,
  detail,
  image,
  progress,
}: {
  verb: string;
  accent: string;
  title: string;
  subtitle?: string;
  detail?: string;
  image?: string;
  progress?: { start: number; end: number; now: number };
}) {
  const elapsed = progress ? Date.now() - progress.start : 0;
  const total = progress && progress.end ? progress.end - progress.start : 0;
  const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
      <div className="mb-2 text-[10px] uppercase tracking-wider text-py-comment">
        {verb} <span className="text-py-function">{accent}</span>
      </div>
      <div className="flex gap-3">
        {image && (
          <img src={image} alt={accent} className="h-14 w-14 rounded-md object-cover ring-1 ring-border" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="truncate text-xs text-py-string">{subtitle}</div>}
          {detail && <div className="truncate text-xs text-py-comment">{detail}</div>}
        </div>
      </div>
      {progress && total > 0 && (
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-py-comment">
            <span>{fmt(elapsed)}</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      )}
      {progress && total === 0 && (
        <div className="mt-2 text-[10px] text-py-comment">elapsed {fmt(elapsed)}</div>
      )}
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-py-comment"># Discord activity not yet connected</p>
      <ol className="ml-4 list-decimal space-y-1 text-py-comment">
        <li>
          Join{" "}
          <a
            className="text-py-builtin underline underline-offset-2"
            href="https://discord.gg/lanyard"
            target="_blank"
            rel="noreferrer"
          >
            discord.gg/lanyard
          </a>
        </li>
        <li>Copy your Discord user ID (Settings → Advanced → Developer Mode → right-click profile → Copy ID)</li>
        <li>
          Open <span className="text-py-string">src/components/DiscordCard.tsx</span> and paste it
          into <span className="text-py-function">DISCORD_USER_ID</span>
        </li>
      </ol>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="text-sm">
      <p className="text-destructive">
        <span className="text-py-keyword">raise</span>{" "}
        <span className="text-py-class">LanyardError</span>(
        <span className="text-py-string">"{message}"</span>)
      </p>
      <p className="mt-2 text-xs text-py-comment">
        # Tip: make sure you've joined discord.gg/lanyard so your presence is tracked.
      </p>
    </div>
  );
}
