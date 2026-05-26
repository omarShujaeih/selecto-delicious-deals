import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, ShieldCheck, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/features/auth/account.functions";
import { useAuth } from "@/features/auth/auth.context";

type LegalKind = "privacy" | "terms" | "delete-account";

const updatedAt = "2026-05-25";

export function createLegalRoute(path: "/privacy" | "/terms" | "/delete-account", kind: LegalKind) {
  return createFileRoute(path)({
    head: () => ({
      meta: [
        { title: `${titles[kind]} | Selecto` },
        { name: "description", content: descriptions[kind] },
      ],
    }),
    component: () => <LegalPage kind={kind} />,
  });
}

const titles: Record<LegalKind, string> = {
  privacy: "سياسة الخصوصية",
  terms: "الشروط والأحكام",
  "delete-account": "حذف الحساب والبيانات",
};

const descriptions: Record<LegalKind, string> = {
  privacy: "كيف يجمع Selecto البيانات ويستخدمها ويحميها.",
  terms: "شروط استخدام Selecto للزبائن والمطاعم.",
  "delete-account": "طلب حذف حساب Selecto والبيانات المرتبطة به.",
};

function LegalPage({ kind }: { kind: LegalKind }) {
  const Icon = kind === "privacy" ? ShieldCheck : kind === "terms" ? FileText : Trash2;

  return (
    <div className="phone-frame min-h-screen bg-background pb-12 text-foreground" dir="rtl">
      <header className="safe-top border-b border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/profile" className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
            <ArrowRight className="size-5" />
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="truncate font-display text-xl font-black">{titles[kind]}</h1>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">آخر تحديث: {updatedAt}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        </div>
      </header>

      <main className="space-y-4 px-5 py-5">
        {kind === "privacy" && <PrivacyContent />}
        {kind === "terms" && <TermsContent />}
        {kind === "delete-account" && <DeleteAccountContent />}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-black text-primary">{title}</h2>
      <div className="mt-2 space-y-2 text-sm font-semibold leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacyContent() {
  return (
    <>
      <Section title="البيانات التي نستخدمها">
        <p>نستخدم بيانات الحساب مثل البريد الإلكتروني والاسم، وبيانات الطلبات، والمفضلة، والمدينة المختارة لتشغيل خدمة Selecto وتحسين تجربة الطلب.</p>
      </Section>
      <Section title="الدفع والطلبات">
        <p>النسخة الحالية تعتمد على الدفع النقدي عند الاستلام. لا نخزن بيانات بطاقات بنكية داخل التطبيق.</p>
      </Section>
      <Section title="مشاركة البيانات">
        <p>نشارك تفاصيل الطلب الضرورية مع المطعم المعني فقط حتى يتم تجهيز الطلب. لا نبيع بيانات المستخدمين.</p>
      </Section>
      <Section title="الأمان والحذف">
        <p>تتم إدارة الحسابات عبر Supabase Auth. يمكنك طلب حذف حسابك وبياناتك من صفحة حذف الحساب داخل التطبيق.</p>
      </Section>
      <Section title="التواصل">
        <p>لأي استفسار عن الخصوصية أو البيانات، تواصل معنا عبر صفحة الدعم داخل التطبيق.</p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <Section title="طبيعة الخدمة">
        <p>Selecto يعرض عروض طعام محلية ويسمح للزبون بحجز الطلب واستلامه من المطعم. الدفع في النسخة الحالية يتم نقداً عند الاستلام.</p>
      </Section>
      <Section title="مسؤوليات الزبون">
        <p>على الزبون التأكد من وقت الاستلام، الكمية، والسعر النهائي الظاهر قبل تأكيد الطلب.</p>
      </Section>
      <Section title="مسؤوليات المطعم">
        <p>المطعم مسؤول عن صحة بيانات العرض، توفر الكمية، جودة الوجبة، ووقت الاستلام المعلن.</p>
      </Section>
      <Section title="الأسعار والعمولة">
        <p>المطعم يحدد سعره، ويعرض Selecto السعر النهائي للزبون بعد إضافة عمولة المنصة بنسبة 20% فوق سعر المطعم.</p>
      </Section>
      <Section title="الإلغاء والدعم">
        <p>في حال وجود مشكلة في الطلب أو عدم توفر الوجبة، يتم التواصل عبر صفحة الدعم لحل المشكلة بأسرع وقت ممكن.</p>
      </Section>
    </>
  );
}

function DeleteAccountContent() {
  const { user, signOut, isAdmin, isRestaurant } = useAuth();
  const deleteAccount = useServerFn(deleteMyAccount);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!user) {
      toast.info("سجل دخولك أولاً لحذف الحساب.");
      return;
    }
    if (isAdmin || isRestaurant) {
      toast.error("حسابات المطاعم والأدمن تحتاج تواصل مع الدعم قبل الحذف.");
      return;
    }
    const confirmed = window.confirm("سيتم حذف حسابك وبياناتك المرتبطة به. هل أنت متأكد؟");
    if (!confirmed) return;

    setBusy(true);
    try {
      await deleteAccount({ data: { confirmation: "DELETE_MY_ACCOUNT" } });
      await signOut();
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف الحساب.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Section title="ماذا يحدث عند حذف الحساب؟">
        <p>سيتم حذف حساب تسجيل الدخول والملف الشخصي والأدوار المرتبطة بالمستخدم. قد تبقى بعض سجلات الطلبات بصيغة محاسبية أو تشغيلية إذا كان الاحتفاظ بها مطلوباً لتسوية الطلبات أو الامتثال.</p>
      </Section>
      <Section title="حسابات المطاعم والأدمن">
        <p>حسابات المطاعم والأدمن مرتبطة بعروض وطلبات ومحاسبة، لذلك يجب التواصل مع الدعم قبل حذفها حتى لا تتأثر العمليات الجارية.</p>
      </Section>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy || !user || isAdmin || isRestaurant}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive px-5 py-4 text-sm font-black text-destructive-foreground shadow-sm disabled:opacity-50"
      >
        <Trash2 className="size-4" />
        {busy ? "جاري حذف الحساب..." : "حذف حسابي"}
      </button>
      {!user && (
        <Link to="/auth" className="block rounded-2xl bg-primary px-5 py-4 text-center text-sm font-black text-primary-foreground">
          تسجيل الدخول
        </Link>
      )}
    </>
  );
}
