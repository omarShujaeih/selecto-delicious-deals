import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { z } from "zod";

import { customerUsernamePasswordLogin, registerCustomerBypassingOtp, checkUsernameAvailable } from "@/features/auth/auth.functions";
import { useAuth } from "@/features/auth/auth.context";
import { cities, getPreferredCity, setPreferredCity } from "@/features/customer/city-preference";
import { getSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { SelectoLogo } from "@/shared/layout/SelectoLogo";

const LOGIN_ERROR_MESSAGE = "بيانات الدخول غير صحيحة.";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    redirect: z.string().optional(),
    returnTo: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "تسجيل الدخول | Selecto" }] }),
  component: AuthPage,
});

type AuthTab = "login" | "signup";

type CustomerProfile = {
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  city: string | null;
  area: string | null;
};

type LoginFieldErrors = {
  identifier?: string;
  password?: string;
};

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, returnTo } = Route.useSearch();
  const { user, loading, rolesLoaded, roleError, roles, isAdmin, isRestaurant, isCustomer, refreshRoles } = useAuth();

  const nextPath = useMemo(() => safeReturnPath(returnTo || redirect || "/offers"), [redirect, returnTo]);
  
  const [tab, setTab] = useState<AuthTab>("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [rawPhone, setRawPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [area, setArea] = useState("");
  const [selectedCity, setSelectedCity] = useState(getPreferredCity);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function routeAuthenticatedUser() {
      if (loading || !user || !rolesLoaded) return;

      if (roleError || roles.length === 0) {
        setError("لا يوجد نوع حساب مرتبط بهذا المستخدم. يرجى التواصل مع الدعم.");
        return;
      }

      if (isAdmin || isRestaurant) {
        navigate({ to: "/dashboard" });
        return;
      }

      if (!isCustomer) return;

      const profile = await fetchCustomerProfile();
      if (!active) return;

      if (!isProfileComplete(profile)) {
        setTab("signup");
        setUsername(profile?.username ?? "");
        setFullName(profile?.full_name ?? profile?.display_name ?? (user.user_metadata?.display_name as string) ?? "");
        setSelectedCity(profile?.city || getPreferredCity());
        setArea(profile?.area ?? "");
        return;
      }

      navigate({ to: nextPath as any });
    }

    routeAuthenticatedUser().catch((err) => {
      if (!active) return;
      console.error("[Auth] Failed to route authenticated user:", err);
      setError(toFriendlyAuthError(err, "تعذر فحص بيانات الحساب."));
    });

    return () => {
      active = false;
    };
  }, [user, loading, rolesLoaded, roleError, roles.length, isAdmin, isRestaurant, isCustomer, nextPath, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoginFieldErrors({});
    setBusy(true);

    try {
      if (tab === "login") {
        await loginCustomer();
      } else {
        await completeSignup();
      }
    } catch (err) {
      console.error("[Auth] Customer auth flow failed:", err);
      setError(toFriendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function loginCustomer() {
    ensureSupabaseClientConfig();
    const identifier = loginIdentifier.trim();
    const nextErrors: LoginFieldErrors = {};

    if (!identifier) {
      nextErrors.identifier = "اكتب اسم المستخدم أو رقم الهاتف.";
    }

    if (!loginPassword) {
      nextErrors.password = "اكتب كلمة المرور.";
    } else if (loginPassword.length < 6) {
      nextErrors.password = "كلمة المرور لازم تكون 6 أحرف على الأقل.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setLoginFieldErrors(nextErrors);
      return;
    }

    const phone = normalizePalestinePhone(identifier);
    if (phone) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        phone,
        password: loginPassword,
      });

      if (signInError) {
        console.error("[Auth] Phone password sign-in failed:", signInError);
        setLoginFieldErrors({
          identifier: "تأكد من رقم الهاتف.",
          password: "تأكد من كلمة المرور.",
        });
        throw new Error(LOGIN_ERROR_MESSAGE);
      }
      return;
    }

    if (!isValidUsername(identifier)) {
      setLoginFieldErrors({
        identifier: "اسم المستخدم 3-32 حرف، إنجليزي/أرقام/شرطة سفلية. أو أدخل رقم فلسطيني صحيح.",
      });
      return;
    }

    let sessionTokens: { access_token: string; refresh_token: string };
    try {
      sessionTokens = await customerUsernamePasswordLogin({
        data: {
          username: identifier,
          password: loginPassword,
        },
      });
    } catch (err) {
      console.error("[Auth] Username password sign-in failed:", err);
      setLoginFieldErrors({
        identifier: "تأكد من اسم المستخدم.",
        password: "تأكد من كلمة المرور.",
      });
      throw new Error(LOGIN_ERROR_MESSAGE);
    }

    const { error: setSessionError } = await supabase.auth.setSession(sessionTokens);
    if (setSessionError) {
      console.error("[Auth] setSession after username login failed:", setSessionError);
      setLoginFieldErrors({
        identifier: "تأكد من اسم المستخدم.",
        password: "تأكد من كلمة المرور.",
      });
      throw new Error(LOGIN_ERROR_MESSAGE);
    }
  }

  async function completeSignup() {
    const phone = normalizePalestinePhone(rawPhone);
    if (!phone) {
      setError("يرجى إدخال رقم هاتف صحيح يبدأ بـ 970 أو 972 أو بصيغة محلية صحيحة.");
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (!isValidUsername(normalizedUsername)) {
      setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل وبدون مسافات.");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!fullName.trim()) {
      setError("يرجى إدخال الاسم الكامل.");
      return;
    }

    const isAvailable = await checkUsernameAvailable({ data: normalizedUsername });
    if (!isAvailable) {
      setError("اسم المستخدم مستخدم بالفعل.");
      return;
    }

    try {
      await registerCustomerBypassingOtp({
        data: {
          phone: phone,
          password: password,
          fullName: fullName.trim()
        }
      });
    } catch (createErr: any) {
      if (createErr.message?.includes("already exists") || createErr.message?.includes("User already registered")) {
        setError("رقم الهاتف مسجل مسبقاً.");
      } else {
        setError("تعذر إنشاء الحساب. حاول مرة أخرى.");
      }
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      phone: phone,
      password: password,
    });

    if (signInError) {
      throw signInError;
    }

    await saveCustomerProfile({
      username: normalizedUsername,
      fullName,
      city: selectedCity,
      area,
      phoneNumber: phone,
    });

    setPreferredCity(selectedCity);
    await refreshRoles();
    navigate({ to: nextPath as any });
  }

  return (
    <div className="phone-frame min-h-screen bg-background px-6 py-8 text-foreground">
      <header className="flex items-center justify-between">
        <Link to="/offers" className="text-xs font-black text-muted-foreground">
          متابعة كزائر
        </Link>
        <div className="flex items-center gap-3" dir="ltr">
          <SelectoLogo size={46} className="rounded-2xl shadow-card" />
          <span className="font-display text-2xl font-black text-primary">Selecto</span>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-sm" dir="rtl">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`rounded-xl px-3 py-3 text-sm font-black transition ${tab === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-primary"}`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`rounded-xl px-3 py-3 text-sm font-black transition ${tab === "signup" ? "bg-primary text-primary-foreground shadow-sm" : "text-primary"}`}
          >
            إنشاء حساب
          </button>
        </div>

        <Intro tab={tab} />

        <form onSubmit={submit} className="mt-6 space-y-3">
          {tab === "login" ? (
            <LoginFields
              identifier={loginIdentifier}
              password={loginPassword}
              errors={loginFieldErrors}
              onIdentifierChange={(value) => {
                setLoginIdentifier(value);
                setLoginFieldErrors((current) => ({ ...current, identifier: undefined }));
                setError(null);
              }}
              onPasswordChange={(value) => {
                setLoginPassword(value);
                setLoginFieldErrors((current) => ({ ...current, password: undefined }));
                setError(null);
              }}
            />
          ) : (
            <SignupFields
              rawPhone={rawPhone}
              username={username}
              password={password}
              confirmPassword={confirmPassword}
              fullName={fullName}
              city={selectedCity}
              area={area}
              onRawPhoneChange={(value) => { setRawPhone(value); setError(null); }}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onFullNameChange={setFullName}
              onCityChange={(city) => {
                setSelectedCity(city);
                setPreferredCity(city);
              }}
              onAreaChange={setArea}
            />
          )}

          {success && (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
              {success}
            </p>
          )}

          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">{error}</p>}

          <button
            id="login-submit-btn"
            disabled={busy}
            className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-card disabled:opacity-60"
          >
            {busy ? "يرجى الانتظار..." : tab === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>
        </form>

        {tab === "login" && (
          <div className="mt-8 border-t border-border pt-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[10px] font-black text-primary">
                <ShieldCheck className="size-3" />
                للتجربة فقط
              </span>
              <h3 className="mt-3 text-xs font-black text-foreground">تجربة سريعة كمستخدم</h3>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("customer1");
                  setLoginPassword("Customer123");
                  setTimeout(() => document.getElementById("login-submit-btn")?.click(), 100);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-right text-xs font-bold transition hover:border-primary/30 hover:bg-secondary"
              >
                دخول كزبون تجريبي 1
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("customer2");
                  setLoginPassword("Customer123");
                  setTimeout(() => document.getElementById("login-submit-btn")?.click(), 100);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-right text-xs font-bold transition hover:border-primary/30 hover:bg-secondary"
              >
                دخول كزبون تجريبي 2
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("customer3");
                  setLoginPassword("Customer123");
                  setTimeout(() => document.getElementById("login-submit-btn")?.click(), 100);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-right text-xs font-bold transition hover:border-primary/30 hover:bg-secondary"
              >
                دخول كزبون تجريبي 3
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => switchTab(tab === "login" ? "signup" : "login")}
          className="mt-5 w-full text-center text-xs font-black text-primary underline decoration-primary/30 underline-offset-4"
        >
          {tab === "login" ? "ليس لديك حساب؟ إنشاء حساب" : "لديك حساب؟ تسجيل الدخول"}
        </button>

        <p className="mt-6 text-center text-[11px] font-bold leading-6 text-muted-foreground">
          حسابات المطاعم والإدارة تدخل من{" "}
          <Link to="/portal" className="font-black text-primary underline decoration-primary/30 underline-offset-4">
            بوابة الشركاء
          </Link>
        </p>
      </main>
    </div>
  );

  function switchTab(nextTab: AuthTab) {
    setTab(nextTab);
    setError(null);
    setSuccess(null);
    setLoginFieldErrors({});
  }
}

function Intro({ tab }: { tab: AuthTab }) {
  const isSignup = tab === "signup";
  const title = !isSignup ? "مرحباً بعودتك" : "إنشاء حساب جديد";
  const subtitle = !isSignup
    ? "سجّل دخولك لمتابعة طلباتك وحجوزاتك."
    : "أنشئ حسابك لتطلب وتتابع حالة طلباتك بسهولة.";

  return (
    <div className="mt-8 text-right">
      {isSignup && (
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-black text-primary">
          <UserRound className="size-4" />
          حساب زبون آمن
        </span>
      )}
      <h1 className="mt-4 font-display text-3xl font-black">{title}</h1>
      <p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function LoginFields({
  identifier,
  password,
  errors,
  onIdentifierChange,
  onPasswordChange,
}: {
  identifier: string;
  password: string;
  errors: LoginFieldErrors;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <>
      <Field
        label="اسم المستخدم أو رقم الهاتف"
        required
        autoComplete="username"
        placeholder="selecto_user أو 059xxxxxxx"
        value={identifier}
        onChange={(event) => onIdentifierChange(event.currentTarget.value)}
        error={errors.identifier}
      />
      <Field
        label="كلمة المرور"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(event) => onPasswordChange(event.currentTarget.value)}
        error={errors.password}
      />
    </>
  );
}

function SignupFields({
  rawPhone,
  username,
  password,
  confirmPassword,
  fullName,
  city,
  area,
  onRawPhoneChange,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onFullNameChange,
  onCityChange,
  onAreaChange,
}: {
  rawPhone: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  city: string;
  area: string;
  onRawPhoneChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAreaChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="الاسم الكامل" required value={fullName} onChange={(event) => onFullNameChange(event.currentTarget.value)} />
      
      <div className="space-y-1">
        <Field
          label="رقم الهاتف"
          type="tel"
          required
          dir="ltr"
          inputMode="tel"
          placeholder="059xxxxxxx"
          value={rawPhone}
          onChange={(event) => onRawPhoneChange(event.currentTarget.value)}
        />
        <p className="pr-1 text-[11px] font-bold text-muted-foreground">سيتم استخدام رقم الهاتف لاحقاً لإرسال إشعارات الطلبات والتحديثات.</p>
      </div>

      <label className="block">
        <span className="mb-1 block text-[11px] font-black text-muted-foreground">المدينة</span>
        <span className="relative block">
          <MapPin className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <select
            required
            value={city}
            onChange={(event) => onCityChange(event.currentTarget.value)}
            className="w-full rounded-2xl border border-input bg-card py-3 pl-4 pr-11 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
          >
            {cities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </span>
      </label>

      <Field
        label="اسم المستخدم"
        required
        dir="ltr"
        autoComplete="username"
        placeholder="selecto_user"
        value={username}
        onChange={(event) => onUsernameChange(event.currentTarget.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
      />
      <Field
        label="كلمة المرور"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={password}
        onChange={(event) => onPasswordChange(event.currentTarget.value)}
      />
      <Field
        label="تأكيد كلمة المرور"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.currentTarget.value)}
      />
      
      <Field label="المنطقة، اختياري" placeholder="مثال: الماصيون" value={area} onChange={(event) => onAreaChange(event.currentTarget.value)} />
    </div>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-black text-muted-foreground">{label}</span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-2xl border bg-card px-4 py-3 text-sm font-bold outline-none focus:ring-2 ${
          error ? "border-destructive focus:ring-destructive/20" : "border-input focus:ring-ring"
        }`}
      />
      {error && <span className="mt-1.5 block text-[11px] font-bold text-destructive">{error}</span>}
    </label>
  );
}

function normalizePalestinePhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "").trim();

  if (/^0(56|59)\d{7}$/.test(digits)) return `+970${digits.slice(1)}`;
  if (/^97(0|2)(56|59)\d{7}$/.test(digits)) return `+${digits}`;
  if (/^\+97(0|2)(56|59)\d{7}$/.test(digits)) return digits;

  return null;
}

function isValidUsername(value: string) {
  return /^[a-z0-9_]{3,32}$/.test(value.trim().toLowerCase());
}

async function fetchCustomerProfile(): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, display_name, city, area")
    .maybeSingle();

  if (error) throw error;
  return data;
}

function isProfileComplete(profile: CustomerProfile | null) {
  return Boolean(profile?.username?.trim() && (profile?.full_name?.trim() || profile?.display_name?.trim()) && profile?.city?.trim());
}

async function saveCustomerProfile({
  username,
  fullName,
  city,
  area,
  phoneNumber,
}: {
  username: string;
  fullName: string;
  city: string;
  area: string;
  phoneNumber?: string | null;
}) {
  const { error } = await supabase.rpc("complete_customer_profile", {
    _username: username.trim().toLowerCase(),
    _full_name: fullName.trim(),
    _city: city.trim(),
    _area: area.trim() || null,
    _phone_number: phoneNumber?.trim() || null,
  });

  if (error) {
    console.error("[Auth] complete_customer_profile error:", error);
    throw error;
  }
}

function safeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/offers";
  return value;
}

function ensureSupabaseClientConfig() {
  try {
    getSupabaseConfig();
  } catch (err) {
    console.error("[Auth] Supabase client config missing:", err);
    throw new Error("إعدادات Supabase غير مكتملة. يرجى التأكد من SUPABASE_URL و SUPABASE_PUBLISHABLE_KEY.");
  }
}

function toFriendlyAuthError(err: unknown, fallback = "تعذر إكمال العملية. حاول مرة أخرى.") {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = message.toLowerCase();

  if (message === LOGIN_ERROR_MESSAGE || lower.includes("invalid login") || lower.includes("credentials")) return LOGIN_ERROR_MESSAGE;
  if (lower.includes("username is already taken") || lower.includes("duplicate")) return "اسم المستخدم مستخدم مسبقاً.";
  if (lower.includes("invalid username")) return "اسم المستخدم يجب أن يكون 3 أحرف على الأقل وبدون مسافات.";
  if (lower.includes("phone")) return "يرجى إدخال رقم هاتف صحيح يبدأ بـ 970 أو 972 أو بصيغة محلية صحيحة.";
  if (lower.includes("password")) return "تعذر حفظ كلمة المرور. تأكد أنها 6 أحرف على الأقل.";
  if (lower.includes("network") || lower.includes("fetch")) return "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.";
  if (lower.includes("profile")) return "تعذر حفظ بيانات الحساب. حاول مرة أخرى.";
  if (lower.includes("role") || lower.includes("permission") || lower.includes("rls")) return "تعذر إنشاء دور الزبون. يرجى المحاولة لاحقاً.";

  return message && message.length < 140 ? message : fallback;
}
