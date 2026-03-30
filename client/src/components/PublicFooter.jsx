import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer
      style={{
        background:
          "linear-gradient(135deg, #0f1f3c 0%, #18345f 55%, #1f4b79 100%)",
        color: "white",
        padding: "3rem 1.5rem 1.25rem",
      }}
    >
      <div className="sa" style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2.5rem",
            marginBottom: "2rem",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: "220px", maxWidth: "280px" }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.9rem",
                textDecoration: "none",
                color: "white",
              }}
            >
              <span style={{ fontSize: "1.7rem", fontWeight: 900, letterSpacing: "-1px" }}>
                Travky
              </span>
              <span style={{ fontSize: "1.6rem" }}>🗺</span>
            </Link>
            <p style={{ fontSize: "0.9rem", opacity: 0.82, lineHeight: 1.8 }}>
              منصة سفر وحجوزات متكاملة تربط المسافرين بالشركاء وتمنح فرق التشغيل
              لوحة تحكم واحدة لإدارة الفنادق والأنشطة والمطاعم.
            </p>
          </div>

          <div>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>
              روابط سريعة
            </h3>
            <Link to="/" style={linkStyle}>
              الرئيسية
            </Link>
            <Link to="/become-partner" style={linkStyle}>
              أصبح شريكاً
            </Link>
            <Link to="/login" style={linkStyle}>
              دخول الشركاء
            </Link>
          </div>

          <div>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>
              الدعم
            </h3>
            <a href="mailto:support@travky.com" style={linkStyle}>
              support@travky.com
            </a>
            <a href="tel:+20123456789" style={linkStyle}>
              +20 123 456 789
            </a>
            <span style={{ ...linkStyle, cursor: "default" }}>القاهرة، مصر</span>
          </div>

          <div>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>
              لماذا ترافكي
            </h3>
            <span style={{ ...linkStyle, cursor: "default" }}>إدارة تشغيل موحدة</span>
            <span style={{ ...linkStyle, cursor: "default" }}>تقارير لحظية</span>
            <span style={{ ...linkStyle, cursor: "default" }}>وصول أسرع للعملاء</span>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,.15)",
            paddingTop: "1rem",
            textAlign: "center",
            fontSize: "0.82rem",
            opacity: 0.7,
          }}
        >
          © Travky 2026. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}

const linkStyle = {
  display: "block",
  fontSize: "0.875rem",
  opacity: 0.8,
  textDecoration: "none",
  color: "white",
  marginBottom: "0.65rem",
};