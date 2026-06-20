import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  created_at: string;
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    const { error } = await supabase
      .from("reviews")
      .insert({ name: name.trim().slice(0, 60), rating, message: message.trim().slice(0, 1000) });
    setSubmitting(false);
    if (error) {
      setFeedback({ ok: false, text: error.message });
      return;
    }
    setFeedback({ ok: true, text: "Review committed ✓" });
    setName("");
    setMessage("");
    setRating(5);
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form */}
      <form
        onSubmit={submit}
        className="lg:col-span-2 overflow-hidden rounded-xl border border-border glass shadow-card"
      >
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-destructive/80" />
            <span className="h-3 w-3 rounded-full bg-secondary/80" />
            <span className="h-3 w-3 rounded-full bg-primary/80" />
          </div>
          <span className="text-xs text-muted-foreground">leave_review.py</span>
        </div>
        <div className="space-y-4 p-5 text-sm">
          <p className="text-py-comment">
            <span className="text-py-decorator">@public</span>
            <br />
            <span className="text-py-keyword">def</span>{" "}
            <span className="text-py-function">leave_review</span>(visitor):
          </p>

          <Field label="visitor.name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              placeholder="ada_lovelace"
              className="w-full rounded-md border border-border bg-input px-3 py-2 font-mono text-sm text-py-string outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </Field>

          <Field label="visitor.rating">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="text-2xl leading-none transition-transform hover:scale-110"
                  aria-label={`${n} stars`}
                >
                  <span className={n <= rating ? "text-py-string" : "text-muted-foreground/40"}>★</span>
                </button>
              ))}
              <span className="ml-2 self-center text-xs text-py-number">{rating}</span>
            </div>
          </Field>

          <Field label="visitor.message">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              required
              rows={4}
              placeholder='"Nezure is awesome..."'
              className="w-full resize-none rounded-md border border-border bg-input px-3 py-2 font-mono text-sm text-py-string outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-primary px-4 py-2.5 font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "committing..." : "→ db.commit()"}
          </button>

          {feedback && (
            <p className={`text-xs ${feedback.ok ? "text-py-function" : "text-destructive"}`}>
              {feedback.ok ? "# " : "# ERROR: "}
              {feedback.text}
            </p>
          )}
        </div>
      </form>

      {/* List */}
      <div className="lg:col-span-3 overflow-hidden rounded-xl border border-border glass shadow-card">
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-destructive/80" />
            <span className="h-3 w-3 rounded-full bg-secondary/80" />
            <span className="h-3 w-3 rounded-full bg-primary/80" />
          </div>
          <span className="text-xs text-muted-foreground">reviews.json</span>
          <span className="ml-auto text-[10px] text-py-comment">{reviews.length} entries</span>
        </div>
        <div className="max-h-[600px] space-y-3 overflow-y-auto p-5 scrollbar-code">
          {loading ? (
            <p className="text-sm text-py-comment"># loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-py-comment">
              # No reviews yet. Be the first to <span className="text-py-function">leave_review()</span>
            </p>
          ) : (
            reviews.map((r) => <ReviewItem key={r.id} review={r} />)
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-py-builtin">{label}</span>
      {children}
    </label>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const date = new Date(review.created_at);
  const dateStr = date.toISOString().slice(0, 10);
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-mono">
          <span className="text-py-keyword">class</span>{" "}
          <span className="text-py-class">{review.name.replace(/[^a-zA-Z0-9_]/g, "_") || "Anonymous"}</span>
          <span className="text-py-operator">:</span>
        </div>
        <span className="text-[10px] text-py-comment">{dateStr}</span>
      </div>
      <div className="ml-4 mt-1">
        <span className="text-py-string">{"★".repeat(review.rating)}</span>
        <span className="text-muted-foreground/40">{"★".repeat(5 - review.rating)}</span>
        <span className="ml-2 text-py-number">{review.rating}</span>
      </div>
      <p className="ml-4 mt-2 whitespace-pre-wrap text-foreground/90">
        <span className="text-py-comment">"""</span>
        <br />
        {review.message}
        <br />
        <span className="text-py-comment">"""</span>
      </p>
    </div>
  );
}
