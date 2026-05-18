import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SelectoLogo } from "@/components/SelectoLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Selecto" },
      { name: "description", content: "Sign in or create your Selecto account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "restaurant">("customer");
  const [restaurantName, setRestaurantName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        const uid = data.user?.id;
        if (uid && role === "restaurant") {
          // Wait briefly for trigger then upgrade role + create restaurant.
          await supabase.from("user_roles").insert({ user_id: uid, role: "restaurant" });
          await supabase.from("restaurants").insert({
            owner_id: uid,
            name: restaurantName || `${name || "My"} Restaurant`,
            cuisine: "Other",
            city: "—",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/offers" });
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) setErr(res.error.message);
    if (res.redirected) return;
    navigate({ to: "/offers" });
  }

  return (
    <div className="phone-frame flex flex-col px-6 py-8">
      <div className="flex items-center gap-3">
        <SelectoLogo size={48} />
        <div>
          <p className="font-display text-xl font-extrabold text-primary">Selecto</p>
          <p className="text-xs text-muted-foreground">Great meals. Lower prices.</p>
        </div>
      </div>

      <div className="mt-8">
        <h1 className="font-display text-2xl font-extrabold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to save favorites and place orders."
            : "Join as a customer or list your restaurant."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <>
            <Field label="Your name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                I am a
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["customer", "restaurant"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      role === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {r === "customer" ? "Customer" : "Restaurant"}
                  </button>
                ))}
              </div>
            </div>
            {role === "restaurant" && (
              <Field
                label="Restaurant name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.currentTarget.value)}
                required
              />
            )}
          </>
        )}
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />

        {err && <p className="text-xs font-semibold text-discount">{err}</p>}

        <button
          disabled={busy}
          type="submit"
          className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={google}
        className="w-full rounded-full border border-border bg-card py-3 text-sm font-semibold shadow-card"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="font-semibold text-primary"
        >
          {mode === "signin" ? "Create account" : "Sign in"}
        </button>
      </p>

      <Link to="/offers" className="mt-4 text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
        Continue as guest
      </Link>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <input
        {...rest}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
