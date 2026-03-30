import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesCombined,
  Globe,
  ShieldCheck,
  Users,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import PublicAuthModal from "../components/PublicAuthModal";
import { usePublicClientSession } from "../hooks/usePublicClientSession";
import { useState, useEffect, useRef } from "react";

const STATS = [
  { icon: Users, value: "+2,500", label: "شريك نشط" },
  { icon: CalendarDays, value: "+50K", label: "حجز شهرياً" },
  { icon: Globe, value: "+45", label: "دولة" },
  { icon: ShieldCheck, value: "98%", label: "رضا العملاء" },
];

const FEATURES = [
  {
    icon: ChartNoAxesCombined,
    title: "لوحة تشغيل مركزية",
    body: "راقب الأداء والحجوزات والمدفوعات من شاشة واحدة مصممة لفرق التشغيل اليومية.",
    accent: "#2f6db6",
  },
  {
    icon: Globe,
    title: "وصول أوسع للأسواق",
    body: "اعرض خدماتك على منصة موحدة تصل إلى عملاء وشركات سفر في أسواق متعددة.",
    accent: "#ffb020",
  },
  {
    icon: ShieldCheck,
    title: "تحكم وصلاحيات",
    body: "أنشئ فرقك الداخلية وحدد الصلاحيات لكل دور مع تتبع واضح لكل عملية.",
    accent: "#2fb67d",
  },
];

export default function BecomePartnerPage() {
  const navigate = useNavigate();
  const [clientSession, setClientSession] = usePublicClientSession();
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);

  const [navScrolled, setNavScrolled] = useState(false);
  const pageRef = useRef(null);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const partnerAnimCSS = `
    .ptn-animate {
      opacity: 0;
      transform: translateY(38px);
      transition: opacity 0.62s ease, transform 0.62s ease;
    }
    .ptn-animate.ptn-visible {
      opacity: 1;
      transform: none;
    }
  `;

  useEffect(() => {
    if (!pageRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("ptn-visible");
          observer.unobserve(entry.target);
        }
      }),
      { root: pageRef.current, threshold: 0.08, rootMargin: "0px 0px -50px 0px" }
    );
    pageRef.current.querySelectorAll(".ptn-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pageRef}
      dir="rtl"
      style={{
        height: "100vh",
        overflowY: "auto",
        background:
          "radial-gradient(circle at 15% 20%, rgba(255, 184, 77, 0.18), transparent 24%), radial-gradient(circle at 85% 18%, rgba(47, 109, 182, 0.14), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
        fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
      }}
      onScroll={(e) => setNavScrolled(e.currentTarget.scrollTop > 40)}
    >
      <style>{partnerAnimCSS}</style>
      <PublicNavbar
        clientSession={clientSession}
        onLogout={() => setClientSession(null)}
        onOpenAuthModal={openAuth}
        variant="partner"
        scrolled={navScrolled}
      />

      <section style={{ padding: "68px 1rem 2rem" }}>
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.2rem",
            alignItems: "center",
            minHeight: "520px",
          }}
        >
            <div style={{ order: 2, paddingInlineStart: "0.6rem" }}>
            <div
              className="ptn-animate"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                borderRadius: "999px",
                border: "1px solid rgba(31, 50, 88, 0.12)",
                background: "rgba(255,255,255,0.86)",
                color: "#243b67",
                padding: "0.5rem 0.85rem",
                fontWeight: 800,
                fontSize: "0.78rem",
                marginBottom: "0.95rem"
              }}
            >
              <span>Travky Partner Program</span>
              <span style={{ color: "#ffb020" }}>⚡</span>
            </div>

            <h1
              className="ptn-animate"
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                lineHeight: 1.08,
                fontWeight: 900,
                color: "#121826",
                letterSpacing: "-0.018em",
              }}
            >
              حوّل نشاطك السياحي
              <br />
              إلى وجهة عالمية
            </h1>

            <p
              className="ptn-animate"
              style={{
                margin: "1.2rem 0 0",
                color: "#6a7488",
                fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                lineHeight: 1.7,
                maxWidth: "580px",
              }}
            >
              انضم إلى منصة ترافكي واحصل على لوحة تحكم متكاملة لإدارة أعمالك
              والوصول لآلاف العملاء من مكان واحد.
            </p>

            <div className="ptn-animate" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "2.35rem" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  border: "none",
                  borderRadius: "14px",
                  background: "#173f78",
                  color: "white",
                  padding: "0.8rem 1.3rem",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  boxShadow: "0 14px 32px rgba(23, 63, 120, 0.20)",
                }}
              >
                ابدأ كشريك الآن
                <ArrowLeft size={18} />
              </button>
              <a
                href="#partner-features"
                style={{
                  borderRadius: "14px",
                  border: "2px solid #173f78",
                  color: "#173f78",
                  padding: "0.75rem 1.3rem",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                مشاهدة عرض توضيحي
              </a>
            </div>
          </div>

          <div className="ptn-animate" style={{ order: 1, display: "flex", justifyContent: "center", alignItems: "center", paddingInlineEnd: "0.8rem" }}>
            <div
              style={{
                position: "relative",
                width: "min(100%, 600px)",
                aspectRatio: "1.1 / 0.9",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "14% 8% 12% 16%",
                  background: "radial-gradient(circle, rgba(244, 190, 88, 0.2), rgba(244, 190, 88, 0.04) 40%, transparent 72%)",
                  filter: "blur(14px)",
                }}
              />
              <img
                src="/partner-laptop.svg"
                alt="Travky dashboard preview"
                style={{
                  position: "relative",
                  zIndex: 2,
                  width: "90%",
                  maxWidth: "580px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 28px 32px rgba(31, 35, 44, 0.12))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 1.5rem 2rem" }}>
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.82)",
            borderRadius: "24px",
            boxShadow: "0 16px 40px rgba(18, 56, 106, 0.06)",
            border: "1px solid rgba(18, 56, 106, 0.08)",
            padding: "1.2rem 0.9rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.8rem",
          }}
        >
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <div key={label} className="ptn-animate" style={{ textAlign: "center", padding: "0.9rem", transitionDelay: `${i * 0.1}s` }}>
              <Icon size={22} style={{ color: "#12386a", marginBottom: "0.8rem" }} />
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#101828", lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ color: "#667085", marginTop: "0.4rem", fontSize: "0.85rem" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="partner-features" style={{ padding: "2.8rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div className="ptn-animate" style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ margin: 0, color: "#12386a", fontWeight: 800, fontSize: "0.9rem" }}>كل ما تحتاجه لتنمية أعمالك</p>
            <h2 style={{ margin: "0.45rem 0 0", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: "#101828" }}>
              منصة واحدة، آلاف العملاء، تحكم كامل
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {FEATURES.map(({ icon: Icon, title, body, accent }, i) => (
              <article
                key={title}
                className="ptn-animate"
                style={{
                  borderRadius: "30px",
                  background: "rgba(255,255,255,0.92)",
                  padding: "1.5rem",
                  boxShadow: "0 18px 48px rgba(18, 56, 106, 0.08)",
                  border: "1px solid rgba(18, 56, 106, 0.06)",
                  transitionDelay: `${i * 0.13}s`,
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: `${accent}22`,
                    color: accent,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "0.9rem",
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ margin: 0, color: "#101828", fontWeight: 900, fontSize: "1rem" }}>{title}</h3>
                <p style={{ margin: "0.7rem 0 0", color: "#667085", lineHeight: 1.8, fontSize: "0.9rem" }}>{body}</p>
              </article>
            ))}
          </div>

          <div
            className="ptn-animate"
            style={{
              marginTop: "1.8rem",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #12386a 0%, #0f4c8d 100%)",
              color: "white",
              padding: "1.6rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.2rem" }}>جاهز لتوسيع نشاطك مع ترافكي؟</h3>
              <p style={{ margin: "0.5rem 0 0", opacity: 0.82, fontSize: "0.9rem" }}>
                ادخل الآن إلى لوحة كشريك أو أنشئ حساب عميل من الصفحة الرئيسية عند الحاجة.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  background: "white",
                  color: "#12386a",
                  padding: "0.7rem 1rem",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                دخول كشريك
              </button>
              <Link
                to="/"
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "white",
                  padding: "0.7rem 1rem",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                العودة إلى الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <PublicAuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onAuthenticated={setClientSession}
      />
    </div>
  );
}
