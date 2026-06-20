import type { ReactNode } from "react";

interface CodeBlockProps {
  filename: string;
  language?: string;
  children: ReactNode;
  startLine?: number;
}

export function CodeBlock({ filename, language = "python", children, startLine = 1 }: CodeBlockProps) {
  // Count lines from children (split by newline if string, else estimate)
  const lines = Array.isArray(children) ? children.length : 1;
  const lineNumbers = Array.from({ length: Math.max(lines, 20) }, (_, i) => startLine + i);

  return (
    <div className="overflow-hidden rounded-xl border border-border glass shadow-card">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/80" />
          <span className="h-3 w-3 rounded-full bg-secondary/80" />
          <span className="h-3 w-3 rounded-full bg-primary/80" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="h-3.5 w-3.5 text-py-builtin" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 5.8 2.9 5.8 2.9V6h6.3v.9H3.3S0 6.5 0 12s2.9 5.2 2.9 5.2h2.2v-3.2s-.1-2.9 2.8-2.9h6.3s2.7.04 2.7-2.6V2.9S17.4 0 12 0zM8.5 2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .5-1 1-1z" opacity=".7"/>
            <path d="M12 24c6.6 0 6.2-2.9 6.2-2.9V18h-6.3v-.9h8.8s3.3.4 3.3-5.1-2.9-5.2-2.9-5.2h-2.2v3.2s.1 2.9-2.8 2.9H9.8s-2.7-.04-2.7 2.6v4.8S6.6 24 12 24zm3.5-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.5 1-1 1z" opacity=".5"/>
          </svg>
          <span className="font-medium">{filename}</span>
        </div>
        <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
      </div>

      {/* Code body */}
      <div className="flex text-sm leading-6 scrollbar-code">
        <div className="select-none border-r border-border bg-muted/20 px-3 py-4 text-right text-muted-foreground/60">
          {lineNumbers.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
        <pre className="flex-1 overflow-x-auto px-4 py-4 font-mono">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
