import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";
import { DiscordCard } from "@/components/DiscordCard";
import { Reviews } from "@/components/Reviews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nezure // ~/about.py" },
      {
        name: "description",
        content:
          "Personal site of Nezure — built like a Python module. Live Discord activity and visitor reviews.",
      },
      { property: "og:title", content: "Nezure // ~/about.py" },
      {
        property: "og:description",
        content: "Personal site built like a Python module — live Discord activity + reviews.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top status bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-xs">
          <div className="flex items-center gap-2 text-py-comment">
            <span className="h-2 w-2 rounded-full bg-primary pulse-dot" style={{ color: "var(--color-primary)" }} />
            <span className="text-foreground">nezure</span>
            <span>/</span>
            <span className="text-py-string">main</span>
          </div>
          <nav className="flex gap-5 text-py-comment">
            <a href="#about" className="hover:text-py-function">about.py</a>
            <a href="#discord" className="hover:text-py-function">discord.live</a>
            <a href="#reviews" className="hover:text-py-function">reviews.db</a>
          </nav>
          <span className="hidden text-py-comment sm:inline">Python 3.12 · UTF-8</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-6 py-16">
        {/* Hero */}
        <section className="space-y-6">
          <p className="text-sm text-py-comment">
            $ python3 -m nezure <span className="caret" />
          </p>
          <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-py-keyword">class</span>{" "}
            <span className="text-py-class">Nezure</span>
            <span className="text-py-operator">(</span>
            <span className="text-py-builtin">Human</span>
            <span className="text-py-operator">):</span>
          </h1>
          <p className="max-w-2xl pl-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <span className="text-py-comment">
              """A small corner of the internet — written in the language I love. Scroll for who I am,
              what I'm playing on Discord right now, and what other visitors have said."""
            </span>
          </p>
        </section>

        {/* About */}
        <section id="about" className="space-y-4 scroll-mt-20">
          <SectionTitle index={1} name="about.py" />
          <CodeBlock filename="about.py">
            <PyAbout />
          </CodeBlock>
        </section>

        {/* Discord */}
        <section id="discord" className="space-y-4 scroll-mt-20">
          <SectionTitle index={2} name="discord_presence.live" />
          <p className="text-sm text-py-comment">
            # streaming live from Discord via Lanyard — updates every 15s
          </p>
          <DiscordCard />
        </section>

        {/* Reviews */}
        <section id="reviews" className="space-y-4 scroll-mt-20">
          <SectionTitle index={3} name="reviews.db" />
          <p className="text-sm text-py-comment">
            # leave a note in the guestbook — no signup, just your name and a rating
          </p>
          <Reviews />
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-py-comment">
        # built with care · <span className="text-py-function">return None</span>
      </footer>
    </div>
  );
}

function SectionTitle({ index, name }: { index: number; name: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-py-comment">[{String(index).padStart(2, "0")}]</span>
      <h2 className="font-mono text-2xl font-semibold">
        <span className="text-py-keyword">import</span>{" "}
        <span className="text-py-function">{name}</span>
      </h2>
    </div>
  );
}

function PyAbout() {
  return (
    <>
      <div><span className="text-py-comment"># ~/about.py — who I am, in a few lines</span></div>
      <div>&nbsp;</div>
      <div>
        <span className="text-py-keyword">from</span>{" "}
        <span className="text-py-builtin">typing</span>{" "}
        <span className="text-py-keyword">import</span> Final
      </div>
      <div>&nbsp;</div>
      <div>
        <span className="text-py-decorator">@dataclass</span>
      </div>
      <div>
        <span className="text-py-keyword">class</span>{" "}
        <span className="text-py-class">Nezure</span>:
      </div>
      <div className="pl-6">
        name<span className="text-py-operator">:</span>{" "}
        <span className="text-py-builtin">str</span>{" "}
        <span className="text-py-operator">=</span>{" "}
        <span className="text-py-string">"Nezure"</span>
      </div>
      <div className="pl-6">
        role<span className="text-py-operator">:</span>{" "}
        <span className="text-py-builtin">str</span>{" "}
        <span className="text-py-operator">=</span>{" "}
        <span className="text-py-string">"builder / tinkerer"</span>
      </div>
      <div className="pl-6">
        loves<span className="text-py-operator">:</span>{" "}
        <span className="text-py-builtin">list</span>[<span className="text-py-builtin">str</span>]{" "}
        <span className="text-py-operator">=</span> [
        <span className="text-py-string">"python"</span>,{" "}
        <span className="text-py-string">"discord"</span>,{" "}
        <span className="text-py-string">"late-night coding"</span>,{" "}
        <span className="text-py-string">"good music"</span>
        ]
      </div>
      <div className="pl-6">
        status<span className="text-py-operator">:</span> Final[<span className="text-py-builtin">str</span>]{" "}
        <span className="text-py-operator">=</span>{" "}
        <span className="text-py-string">"always shipping"</span>
      </div>
      <div>&nbsp;</div>
      <div className="pl-6">
        <span className="text-py-keyword">def</span>{" "}
        <span className="text-py-function">say_hi</span>(<span className="text-py-builtin">self</span>){" "}
        <span className="text-py-operator">-&gt;</span>{" "}
        <span className="text-py-builtin">str</span>:
      </div>
      <div className="pl-12">
        <span className="text-py-keyword">return</span> f<span className="text-py-string">"hey, i'm &#123;self.name&#125; — thanks for stopping by"</span>
      </div>
      <div>&nbsp;</div>
      <div>
        <span className="text-py-keyword">if</span>{" "}
        <span className="text-py-builtin">__name__</span>{" "}
        <span className="text-py-operator">==</span>{" "}
        <span className="text-py-string">"__main__"</span>:
      </div>
      <div className="pl-6">
        <span className="text-py-function">print</span>(<span className="text-py-class">Nezure</span>().<span className="text-py-function">say_hi</span>())
      </div>
    </>
  );
}
