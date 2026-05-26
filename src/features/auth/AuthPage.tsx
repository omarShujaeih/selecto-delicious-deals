import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { SelectoLogo } from "@/shared/layout/SelectoLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/auth.context";
import { cities, getPreferredCity, setPreferredCity } from "@/features/customer/city-preference";

const showDemoLogin = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === "true";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "تسجيل الدخول | Selecto" }] }),
  component: AuthPage,
});

type AuthMode = "signin" | "signup" | "whatsapp_phone" | "whatsapp_otp";

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading, isAdmin, isRestaurant } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("whatsapp_phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedCity, setSelectedCity] = useState(getPreferredCity);

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
      } else if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else if (mode === "whatsapp_phone") {
        // Format phone: must include country code. Ensure it starts with +
        const formattedPhone = phone.startsWith("+") ? phone : `+970${phone.replace(/^0+/, "")}`;
        const { error: err } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: { channel: 'whatsapp' }
        });
        if (err) throw err;
        setPhone(formattedPhone);
        setMode("whatsapp_otp");
      } else if (mode === "whatsapp_otp") {
        const { error: err } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'whatsapp'
        });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) setError(oauthError.message);
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
          <h1 className="mt-4 font-display text-3xl font-black">
            {mode === "signin" ? "أهلاً بعودتك" : mode === "signup" ? "أنشئ حسابك" : mode === "whatsapp_phone" ? "تسجيل الدخول" : "تأكيد الرقم"}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">
            {mode === "whatsapp_otp" ? `أدخل الكود المرسل لـ ${phone}` : "سجل دخولك لحفظ المفضلة وإتمام الطلبات."}
          </p>
        </div>
        
        <label className="mt-5 block rounded-2xl border border-border bg-card px-4 py-3 text-right shadow-sm" dir="rtl">
          <span className="mb-2 block text-[11px] font-black text-muted-foreground">اختر مدينتك الافتراضية</span>
          <select
            value={selectedCity}
            onChange={(event) => {
              setSelectedCity(event.currentTarget.value);
              setPreferredCity(event.currentTarget.value);
            }}
            className="w-full bg-transparent text-sm font-black text-foreground outline-none"
          >
            {cities.map((city) => (
              <option key={city.value} value={city.value}>{city.label}</option>
            ))}
          </select>
        </label>
        
        <form onSubmit={submit} className="mt-6 space-y-3" dir="rtl">
          {mode === "signup" && <Field label="الاسم" value={name} onChange={(e) => setName(e.currentTarget.value)} />}
          
          {(mode === "signin" || mode === "signup") && (
            <>
              <Field label="البريد الإلكتروني" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
              <Field label="كلمة المرور" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
            </>
          )}

          {mode === "whatsapp_phone" && (
            <Field label="رقم الواتساب (مثال: 599123456)" type="tel" required dir="ltr" placeholder="599xxxxxx" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
          )}

          {mode === "whatsapp_otp" && (
            <Field label="كود التحقق (6 أرقام)" type="text" required dir="ltr" maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.currentTarget.value)} />
          )}

          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">{error}</p>}
          <button disabled={busy} className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-card disabled:opacity-60">
            {busy ? "يرجى الانتظار..." : mode === "whatsapp_phone" ? "إرسال كود الواتساب" : mode === "whatsapp_otp" ? "تأكيد الكود" : mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        </form>
        
        {showDemoLogin && mode !== "whatsapp_otp" && <button type="button" onClick={() => { setMode("signin"); setEmail("customer@example.com"); setPassword("OmarSelecto2026"); }} className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-right text-xs font-black shadow-sm" dir="rtl">تعبئة حساب الزبون التجريبي<span className="mt-1 block font-bold text-muted-foreground" dir="ltr">customer@example.com</span></button>}
        
        {mode !== "whatsapp_otp" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs font-bold text-muted-foreground"><span className="h-px flex-1 bg-border" />أو المتابعة عبر<span className="h-px flex-1 bg-border" /></div>
            <div className="grid gap-3">
              {(mode === "signin" || mode === "signup") && (
                <button type="button" onClick={() => setMode("whatsapp_phone")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-[#25D366]/10 text-[#25D366] py-4 text-sm font-black shadow-sm">
                  <MessageCircle className="size-5" /> واتساب
                </button>
              )}
              {mode === "whatsapp_phone" && (
                <button type="button" onClick={() => setMode("signin")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-black shadow-sm">
                  البريد الإلكتروني
                </button>
              )}
            </div>
          </>
        )}

        {mode !== "whatsapp_otp" && (
           <Link
             to="/portal"
             className="mt-6 block text-center text-[11px] font-black text-primary underline decoration-primary/30 underline-offset-4"
           >
             مطعم أو شريك؟ الدخول إلى بوابة المطاعم
           </Link>
        )}
      </main>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block"><span className="mb-1 block text-[11px] font-black text-muted-foreground">{label}</span><input {...props} className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring" /></label>;
}
