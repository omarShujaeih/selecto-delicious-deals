import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { SelectoLogo } from "@/components/layout/SelectoLogo";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "تسجيل الدخول | Selecto" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading, isAdmin, isRestaurant } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: isAdmin || isRestaurant ? "/dashboard" : redirect || "/offers" });
  }, [user, loading, isAdmin, isRestaurant, redirect, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: name || email.split("@")[0] } } });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) setError(res.error.message);
    if (!res.redirected) navigate({ to: redirect || "/offers" });
  }

  return (
    <div className="phone-frame min-h-screen bg-background px-6 py-8 text-foreground">
      <header className="flex items-center justify-between">
        <Link to="/offers" className="text-xs font-black text-muted-foreground">متابعة كزائر</Link>
        <div className="flex items-center gap-3" dir="ltr"><SelectoLogo size={46} className="rounded-2xl shadow-card" /><span className="font-display text-2xl font-black text-primary">Selecto</span></div>
      </header>
      <main className="mx-auto mt-12 max-w-sm">
        <div className="text-right" dir="rtl">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-black text-primary"><ShieldCheck className="size-4" />حساب آمن للحجز</span>
          <h1 className="mt-4 font-display text-3xl font-black">{mode === "signin" ? "أهلاً بعودتك" : "أنشئ حسابك"}</h1>
          <p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">سجل دخولك لحفظ المفضلة وإتمام الطلبات.</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3" dir="rtl">
          {mode === "signup" && <Field label="الاسم" value={name} onChange={(e) => setName(e.currentTarget.value)} />}
          <Field label="البريد الإلكتروني" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
          <Field label="كلمة المرور" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">{error}</p>}
          <button disabled={busy} className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-card disabled:opacity-60">{busy ? "يرجى الانتظار..." : mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}</button>
        </form>
        {mode === "signin" && <button type="button" onClick={() => { setEmail("customer@example.com"); setPassword("OmarSelecto2026"); }} className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-right text-xs font-black shadow-sm" dir="rtl">تعبئة حساب الزبون التجريبي<span className="mt-1 block font-bold text-muted-foreground" dir="ltr">customer@example.com</span></button>}
        <div className="my-5 flex items-center gap-3 text-xs font-bold text-muted-foreground"><span className="h-px flex-1 bg-border" />أو<span className="h-px flex-1 bg-border" /></div>
        <button type="button" onClick={google} className="w-full rounded-2xl border border-border bg-card py-4 text-sm font-black shadow-sm">المتابعة عبر Google</button>
        <p className="mt-6 text-center text-xs font-bold text-muted-foreground">{mode === "signin" ? "ليس لديك حساب؟" : "لديك حساب؟"} <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-black text-primary">{mode === "signin" ? "إنشاء حساب" : "تسجيل الدخول"}</button></p>
      </main>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block"><span className="mb-1 block text-[11px] font-black text-muted-foreground">{label}</span><input {...props} className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring" /></label>;
}
