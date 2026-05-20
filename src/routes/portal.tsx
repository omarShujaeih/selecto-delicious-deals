import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectoLogo } from "@/components/layout/SelectoLogo";
import { Shield, Store, LogIn, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Partner Portal — Selecto" },
      { name: "description", content: "Sign in to Selecto Restaurant and Admin Portal." },
    ],
  }),
  component: PartnerPortalPage,
});

function PartnerPortalPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (authData?.user) {
        // Use RPC function (security definer) to bypass RLS timing issues
        const { data: roleRows } = await supabase.rpc("get_my_roles");
        
        const roles = (roleRows ?? []).map((r: any) => r.role);
        
        if (roles.includes("admin") || roles.includes("restaurant")) {
          navigate({ to: "/dashboard" });
          return;
        } else {
          setErr("هذه البوابة مخصصة للشركاء والمدراء فقط / Partners & Admins only.");
          await supabase.auth.signOut();
        }
      }
    } catch (e: any) {
      setErr(e.message ?? "بيانات الدخول غير صحيحة / Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col justify-between px-6 py-10 bg-background min-h-screen relative overflow-hidden max-w-md mx-auto w-full">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-glow/5 rounded-full blur-3xl -z-10" />

      <div className="flex-1 flex flex-col justify-center my-auto">
        <div className="flex flex-col items-center text-center">
          <SelectoLogo size={64} className="mb-4" />
          <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
            بوابة الشركاء والمدراء
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs uppercase tracking-wider font-semibold">
            Partner & Admin Portal
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              البريد الإلكتروني / Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="partner@selecto.ps"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              كلمة المرور / Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          {err && (
            <div className="p-3.5 rounded-xl bg-discount/10 border border-discount/20 text-xs font-semibold text-discount text-center leading-relaxed">
              {err}
            </div>
          )}

          <button
            disabled={busy}
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-glow py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition-all duration-200 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? (
              "جاري الدخول..."
            ) : (
              <>
                <LogIn className="size-4" />
                <span>تسجيل الدخول للوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helpers for Testing */}
        <div className="mt-8 p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Shield className="size-3.5 text-primary" />
            <span>حسابات التجربة السريعة / Demo Accounts</span>
          </p>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
              <div>
                <span className="font-semibold text-foreground block">Omar (Admin)</span>
                <span className="text-[10px] text-muted-foreground">omar.selecto@gmail.com</span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Admin</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-foreground block">Zamn Cafe (Restaurant)</span>
                <span className="text-[10px] text-muted-foreground">zaman.selecto@gmail.com</span>
              </div>
              <span className="text-[10px] bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-bold">Partner</span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground text-center italic mt-1">
            * كلمة المرور الافتراضية لجميع الحسابات: <span className="font-mono font-bold select-all bg-card px-1 py-0.5 rounded border">OmarSelecto2026</span>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
        >
          <span>تسجيل دخول كزبون عادي / Customer App</span>
          <ArrowRight className="size-3" />
        </Link>
        <p className="text-[10px] text-muted-foreground">
          Selecto © 2026. Al-Masyoun, Ramallah.
        </p>
      </div>
    </div>
  );
}
