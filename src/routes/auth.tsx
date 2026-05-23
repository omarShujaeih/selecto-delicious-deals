import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SelectoLogo } from "@/components/layout/SelectoLogo";
import { Shield } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Selecto" },
      { name: "description", content: "Sign in or create your Selecto account." },
    ],
  }),
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading, isAdmin, isRestaurant, isCustomer } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Auto-redirect if already logged in and roles are loaded
  useEffect(() => {
    if (loading) return;
    if (user) {
      if (isAdmin || isRestaurant) {
        console.log("[Auth] Logged in as partner/admin. Redirecting to dashboard...");
        navigate({ to: "/dashboard" });
      } else if (isCustomer) {
        console.log("[Auth] Logged in as customer. Redirecting to target...");
        navigate({ to: redirect || "/offers" });
      } else {
        setErr("Unknown role. Please contact support. / لم يتم التعرف على الصلاحيات.");
      }
    }
  }, [user, loading, isAdmin, isRestaurant, isCustomer, redirect, navigate]);

  // Autofill helper
  function fillDemoCustomer() {
    setEmail("customer@example.com");
    setPassword("OmarSelecto2026");
    setErr(null);
    console.log("Autofilled customer credentials");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    console.log(`Auth form submit. Mode: ${mode}, Email: ${email}`);
    
    try {
      if (mode === "signup") {
        // Public signup creates a Customer account only.
        // Restaurant & Admin accounts are created by the Admin.
        console.log("Registering customer...");
        const signUpPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
          setTimeout(() => reject(new Error("انتهت مهلة التسجيل. يرجى التحقق من اتصال الإنترنت. Sign up timeout.")), 15000)
        );
        const { error } = await Promise.race([signUpPromise, timeoutPromise]);
        if (error) throw error;
        
        console.log("Sign up successful!");
      } else {
        console.log("Calling supabase.auth.signInWithPassword...");
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        
        console.log("signInWithPassword resolved. error:", error, "authData:", authData);
        if (error) throw error;
      }
      console.log("Sign-in successful. Waiting for AuthProvider to load roles and redirect...");
    } catch (e: any) {
      console.error("Auth Page catch:", e);
      setErr(e.message ?? "Something went wrong");
    } finally {
      console.log("Auth Page submit complete. Setting busy to false.");
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
    navigate({ to: redirect || "/offers" });
  }


  return (
    <div className="flex flex-col px-6 py-8 min-h-screen max-w-md mx-auto w-full">
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
            : "Customer accounts only. Restaurant accounts are created by the Selecto team."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <Field label="Your name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
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

      {/* Quick Customer Credentials Helper */}
      {mode === "signin" && (
        <div className="mt-4 p-3 rounded-xl border border-border bg-secondary/20">
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="w-full flex justify-between items-center text-left hover:bg-primary/5 p-1 rounded transition-colors group"
          >
            <div>
              <span className="font-semibold text-xs text-foreground block group-hover:text-primary transition-colors">Customer (Demo)</span>
              <span className="text-[10px] text-muted-foreground">customer@example.com</span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Customer</span>
          </button>
          <p className="text-[9px] text-muted-foreground text-center italic mt-1.5">
            * اضغط لتعبئة حساب الزبون التجريبي تلقائياً (الرمز: OmarSelecto2026)
          </p>
        </div>
      )}

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

      <div className="mt-6 border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">أنت شريك أو مدير؟ / Are you a partner or admin?</p>
        <Link
          to="/portal"
          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors w-full justify-center"
        >
          <Shield className="size-3.5" />
          <span>بوابة الشركاء والمدراء / Partner Portal</span>
        </Link>
      </div>
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
