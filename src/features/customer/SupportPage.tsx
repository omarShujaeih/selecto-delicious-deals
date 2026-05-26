import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, HelpCircle, Info, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "المساعدة والدعم | Selecto" }] }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="phone-frame min-h-screen bg-[#FDFBF7] pb-20 text-slate-900" dir="rtl">
      {/* Header */}
      <header className="safe-top sticky top-0 z-40 bg-[#FDFBF7]/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            className="grid size-10 place-items-center rounded-full bg-white text-slate-900 shadow-sm border border-border"
          >
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="font-display text-lg font-black">المساعدة والدعم</h1>
          <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <HelpCircle className="size-5" />
          </div>
        </div>
      </header>

      <main className="space-y-8 px-5 py-6">
        <section className="text-center">
          <h2 className="font-display text-2xl font-black text-slate-900">كيف نقدر نساعدك؟</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">نحن هنا للإجابة على استفساراتك وتسهيل تجربتك.</p>
        </section>

        {/* FAQ */}
        <FAQSection />

        {/* How to Use */}
        <HowToUseSection />

        {/* About Us */}
        <AboutUsSection />

        {/* Contact Management */}
        <ContactManagementSection />

        {/* Recommendations */}
        <RecommendationsSection />

        {/* Leave a Message */}
        <LeaveMessageForm />
      </main>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    { q: "كيف أستخدم Selecto؟", a: "افتح التطبيق، اختر مدينتك أو منطقتك، تصفّح العروض المتاحة، افتح تفاصيل الوجبة، ثم احجز الكمية المناسبة واستلم طلبك في الوقت المحدد." },
    { q: "هل أحتاج حساب للتصفح؟", a: "لا، يمكنك تصفح العروض بدون حساب. تحتاج تسجيل الدخول فقط عند إتمام الطلب أو متابعة طلباتك." },
    { q: "كيف أعرف وقت الاستلام؟", a: "وقت الاستلام يظهر داخل كرت الوجبة وصفحة التفاصيل، ويتم تحديده من قبل المطعم لكل وجبة." },
    { q: "كيف يتم عرض السعر؟", a: "السعر الذي يظهر لك هو السعر الذي ستدفعه للطلب. لا تحتاج لحساب أي رسوم إضافية بنفسك." },
    { q: "هل العروض متاحة في كل المدن؟", a: "يمكنك اختيار المدينة أو المنطقة من داخل التطبيق، وستظهر لك العروض المتاحة حسب المكان المختار." },
    { q: "ماذا أفعل إذا واجهت مشكلة في الطلب؟", a: "يمكنك التواصل مع الإدارة أو ترك رسالة من خلال نموذج التواصل الموجود في هذه الصفحة." },
  ];

  return (
    <section className="space-y-4">
      <h3 className="font-display text-lg font-black flex items-center gap-2">
        <HelpCircle className="size-5 text-primary" />
        الأسئلة الشائعة
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-right"
      >
        <span className="font-black text-sm text-slate-800">{question}</span>
        <ChevronDown className={`size-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 text-sm font-semibold leading-relaxed text-slate-600">
          {answer}
        </div>
      )}
    </div>
  );
}

function HowToUseSection() {
  const steps = [
    { step: 1, title: "اختر مدينتك", desc: "حدد المدينة أو المنطقة التي تريد تصفح العروض فيها." },
    { step: 2, title: "استكشف العروض", desc: "تصفح الوجبات المتاحة وشاهد السعر ووقت الاستلام." },
    { step: 3, title: "احجز الكمية", desc: "اختر الوجبة المناسبة وحدد الكمية المطلوبة." },
    { step: 4, title: "استلم طلبك", desc: "توجه إلى المطعم في وقت الاستلام المحدد." },
  ];
  return (
    <section className="space-y-4">
      <h3 className="font-display text-lg font-black flex items-center gap-2">
        <Info className="size-5 text-primary" />
        كيف أستعمل Selecto
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {steps.map((s) => (
          <div key={s.step} className="rounded-2xl border border-border bg-white p-4 shadow-sm text-center">
            <span className="mx-auto grid size-8 place-items-center rounded-full bg-primary/10 text-sm font-black text-primary">
              {s.step}
            </span>
            <h4 className="mt-3 text-sm font-black text-slate-800">{s.title}</h4>
            <p className="mt-1 text-[11px] font-semibold text-slate-500 leading-tight">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutUsSection() {
  return (
    <section className="space-y-4">
      <h3 className="font-display text-lg font-black flex items-center gap-2">
        <Info className="size-5 text-primary" />
        من نحن
      </h3>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold leading-relaxed text-slate-600">
          Selecto هو تطبيق يساعد المستخدمين على اكتشاف وجبات مخفّضة من مطاعم قريبة منهم في فلسطين. هدفنا تسهيل الوصول إلى عروض الطعام، دعم المطاعم المحلية، وتقديم تجربة طلب بسيطة وواضحة للمستخدم.
        </p>
      </div>
    </section>
  );
}

function ContactManagementSection() {
  const contacts = [
    { title: "الإدارة العامة", name: "عمر شجاعية", phone: "+970594505012", desc: "للاستفسارات الإدارية العامة وكل ما يتعلق بإدارة المنصة." },
    { title: "الإعلانات داخل التطبيق", name: "محمد شجاعية", phone: "+970********", desc: "للتواصل بخصوص الإعلانات والعروض الترويجية داخل تطبيق Selecto." },
    { title: "جودة الطعام والصحة", name: "آية زين", phone: "+970********", desc: "لكل ما يخص جودة الطعام، صحة الوجبات، أو ملاحظات تتعلق بالمطاعم." },
    { title: "الأعطال التقنية والفنية", name: "ساري عبد الغني", phone: "+970********", desc: "للمشاكل التقنية، الأعطال، أو الأخطاء الفنية داخل التطبيق." },
  ];
  return (
    <section className="space-y-4">
      <h3 className="font-display text-lg font-black flex items-center gap-2">
        <Phone className="size-5 text-primary" />
        تواصل مع الإدارة
      </h3>
      <div className="space-y-3">
        {contacts.map((c, idx) => (
          <div key={idx} className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Phone className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">{c.title}</h4>
              <p className="mt-1 text-[11px] font-bold text-slate-500">{c.name} • <span className="font-mono text-primary" dir="ltr">{c.phone}</span></p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecommendationsSection() {
  return (
    <section className="space-y-4">
      <h3 className="font-display text-lg font-black flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        توصيات وملاحظات
      </h3>
      <div className="rounded-2xl border border-border bg-primary/5 p-5">
        <p className="text-sm font-semibold leading-relaxed text-slate-700">
          نرحب بأي توصيات أو ملاحظات تساعدنا على تحسين Selecto. إذا كان لديك اقتراح لتطوير التطبيق، إضافة مطعم جديد، أو تحسين تجربة المستخدم، شاركنا رأيك.
        </p>
      </div>
    </section>
  );
}

function LeaveMessageForm() {
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay for MVP
    setTimeout(() => {
      setLoading(false);
      toast.success("تم استلام رسالتك بنجاح، سنقوم بالتواصل معك قريباً.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <section className="space-y-4">
      <h3 className="font-display text-lg font-black flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        اترك رسالة هنا
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700">الاسم</label>
          <input required type="text" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="اسمك الكريم" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700">البريد الإلكتروني أو رقم الهاتف</label>
          <input required type="text" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="كيف نتواصل معك؟" dir="rtl" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700">نوع الرسالة</label>
          <select required className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">اختر نوع الرسالة...</option>
            <option value="استفسار عام">استفسار عام</option>
            <option value="مشكلة في طلب">مشكلة في طلب</option>
            <option value="اقتراح أو توصية">اقتراح أو توصية</option>
            <option value="إعلان داخل التطبيق">إعلان داخل التطبيق</option>
            <option value="جودة الطعام">جودة الطعام</option>
            <option value="مشكلة تقنية">مشكلة تقنية</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700">رسالتك</label>
          <textarea required rows={4} className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="اكتب رسالتك هنا..."></textarea>
        </div>
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(10,67,42,0.25)] disabled:opacity-60 transition-transform active:scale-[0.98]">
          {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
        </button>
      </form>
    </section>
  );
}
