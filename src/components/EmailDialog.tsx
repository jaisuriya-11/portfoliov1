import { useState, type FormEvent } from "react";
import { profile } from "../data/profile";
import { Dialog, DialogContent } from "./arc/dialog/dialog";
import { Button } from "./arc/button/button";
import ArcLink from "./ArcLink";

type State = "idle" | "sending" | "sent" | "error";

/**
 * "Send an email": a small form that posts to /api/contact (a Vercel function
 * that sends through Resend). If sending fails — or the API isn't set up, as in
 * local dev — it offers the same message in the visitor's mail app instead.
 */
export default function EmailDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${form.name || "your site"}`)}&body=${encodeURIComponent(form.message)}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Could not send right now");
      setState("sent");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Could not send right now");
      setState("error");
    }
  };

  const change = (o: boolean) => {
    onOpenChange(o);
    if (!o && state !== "sending") window.setTimeout(() => setState("idle"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="mail" title={state === "sent" ? "Message sent" : "Send an email"} description={state === "sent" ? "Thanks — I'll reply within a couple of days." : `Goes straight to ${profile.email}`}>
        {state === "sent" ? (
          <div className="mail__done">
            <Button variant="secondary" size="sm" onClick={() => change(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form className="mail__form" onSubmit={submit}>
            <div className="mail__row">
              <label className="mail__field">
                <span>Name</span>
                <input required maxLength={100} autoComplete="name" value={form.name} onChange={set("name")} />
              </label>
              <label className="mail__field">
                <span>Email</span>
                <input required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} />
              </label>
            </div>
            <label className="mail__field">
              <span>Message</span>
              <textarea required minLength={2} maxLength={5000} rows={5} value={form.message} onChange={set("message")} />
            </label>
            {/* Honeypot for bots; hidden from people and screen readers. */}
            <input className="mail__hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set("website")} />
            {state === "error" && (
              <p className="mail__error" role="alert">
                {error}. You can{" "}
                <a href={mailto}>send it from your mail app</a> instead.
              </p>
            )}
            <div className="mail__foot">
              <ArcLink variant="ghost" size="sm" href={mailto}>
                Use mail app
              </ArcLink>
              <Button type="submit" size="sm" loading={state === "sending"}>
                {state === "sending" ? "Sending" : "Send"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
