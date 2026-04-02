import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BadgeCheck, Loader2, MailWarning, XCircle } from "lucide-react";
import {
  usePublicClientVerifyEmailQuery,
  usePublicClientResendVerificationMutation,
} from "../store/services/api";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const { data, error, isLoading } = usePublicClientVerifyEmailQuery(token, {
    skip: !token,
  });

  // Auto-redirect to home after success
  useEffect(() => {
    if (data?.client) {
      redirectTimer.current = setTimeout(() => navigate("/"), 3500);
    }
    return () => clearTimeout(redirectTimer.current);
  }, [data, navigate]);

  /* ── No token in URL ── */
  if (!token) {
    return (
      <VerifyCard
        icon={<MailWarning size={48} className="text-amber-500" />}
        title="رابط غير صالح"
        body="لم يتم العثور على رمز التحقق. تحقق من رابط البريد الإلكتروني وحاول مرة أخرى."
        footer={<BackHome />}
      />
    );
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <VerifyCard
        icon={<Loader2 size={48} className="animate-spin text-[#173f78]" />}
        title="جارٍ التحقق…"
        body="يرجى الانتظار بينما نتحقق من بريدك الإلكتروني."
      />
    );
  }

  /* ── Error / expired ── */
  if (error) {
    const msg =
      error?.data?.message ||
      "فشل التحقق من البريد الإلكتروني. قد يكون الرابط منتهي الصلاحية أو مستخدماً من قبل.";
    const isExpired = error?.status === 410;
    return (
      <VerifyCard
        icon={<XCircle size={48} className="text-red-500" />}
        title={isExpired ? "انتهت صلاحية الرابط" : "فشل التحقق"}
        body={msg}
        footer={
          <div className="space-y-3">
            <ResendForm />
            <BackHome />
          </div>
        }
      />
    );
  }

  /* ── Success ── */
  return (
    <VerifyCard
      icon={<BadgeCheck size={48} className="text-emerald-500" />}
      title="تم التحقق بنجاح! 🎉"
      body={`مرحباً ${data?.client?.name || ""}! تم تأكيد بريدك الإلكتروني. سيتم توجيهك للصفحة الرئيسية تلقائياً…`}
      footer={<BackHome label="الذهاب للرئيسية الآن" />}
      accent="emerald"
    />
  );
}

/* ─── Shared card shell ─── */
function VerifyCard({ icon, title, body, footer, accent = "blue" }) {
  const accentClass = accent === "emerald" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200";
  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0f4fa] to-[#e8eef7] p-5"
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-2xl border border-slate-200">
        {/* Top accent bar */}
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[20px] border ${accentClass}`}>
          {icon}
        </div>

        <h1 className="mb-3 text-[24px] font-black text-slate-900">{title}</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-slate-500">{body}</p>

        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}

/* ─── Resend form ─── */
function ResendForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [resend, { isLoading }] = usePublicClientResendVerificationMutation();

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    await resend({ email: email.trim().toLowerCase() }).unwrap();
    setDone(true);
  };

  if (done) {
    return (
      <p className="rounded-[12px] bg-emerald-50 px-4 py-3 text-[14px] font-semibold text-emerald-700">
        ✅ إذا كان البريد صحيحاً وغير مفعّل، تم إرسال رابط جديد.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="أدخل بريدك الإلكتروني"
        className="h-11 flex-1 rounded-[12px] border border-slate-200 px-4 text-[14px] text-slate-800 outline-none focus:border-[#173f78]"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-11 items-center gap-1.5 rounded-[12px] px-5 text-[14px] font-bold text-white disabled:opacity-70"
        style={{ backgroundColor: "#173f78" }}
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        إعادة الإرسال
      </button>
    </form>
  );
}

function BackHome({ label = "العودة للرئيسية" }) {
  return (
    <Link
      to="/"
      className="inline-block text-[14px] font-bold text-[#173f78] underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}
