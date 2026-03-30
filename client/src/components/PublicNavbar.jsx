import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, User, UserPlus, X } from "lucide-react";

const NAV_LINKS = [
  { label: "الرئيسية", to: "/" },
  { label: "فنادق", to: "/" },
  { label: "أنشطة", to: "/" },
  { label: "مطاعم", to: "/" },
  { label: "أصبح شريكاً", to: "/become-partner" },
];

export default function PublicNavbar({
  clientSession = null,
  onLogout,
  onOpenAuthModal,
  fallbackActionLabel = "العودة للرئيسية",
  fallbackActionTo = "/",
  variant = "default",
  scrolled = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const navbarCSS = `
    @media (max-width: 768px) {
      .pn-desktop-nav { display: none !important; }
      .pn-desktop-actions { display: none !important; }
      .pn-mobile-toggle { display: flex !important; }
    }
    @media (min-width: 769px) {
      .pn-mobile-toggle { display: none !important; }
      .pn-mobile-drawer { display: none !important; }
    }
  `;

  const renderDropdownButton = (label = clientSession?.name || "دخول") => {
    if (!onOpenAuthModal) {
      return (
        <Link to={fallbackActionTo} style={actionButtonStyle}>
          {fallbackActionLabel}
        </Link>
      );
    }

    return (
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setMenuOpen((c) => !c)}
          style={{ ...actionButtonStyle, border: "none", cursor: "pointer", background: "white" }}
        >
          <ChevronDown size={14} style={{ color: "#667085" }} />
          <User size={14} style={{ color: "#344054" }} />
          <span>{label}</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              width: "220px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.98)",
              boxShadow: "0 16px 48px rgba(15, 23, 42, 0.16)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              padding: "0.75rem",
              zIndex: 200,
            }}
          >
            <p style={{ margin: "0 0 0.5rem", color: "#475467", fontWeight: 700, fontSize: "0.85rem" }}>
              {clientSession ? `مرحباً، ${clientSession.name}` : "مرحباً، زائر"}
            </p>

            {!clientSession ? (
              <>
                <button type="button" onClick={() => { setMenuOpen(false); onOpenAuthModal("login"); }} style={menuItemButtonStyle}>
                  <User size={16} /> تسجيل الدخول
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); onOpenAuthModal("signup"); }} style={menuItemButtonStyle}>
                  <UserPlus size={16} /> إنشاء حساب
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setMenuOpen(false); onLogout?.(); }} style={menuItemButtonStyle}>
                <LogOut size={16} /> تسجيل الخروج
              </button>
            )}

            <button
              type="button"
              onClick={() => { setMenuOpen(false); navigate("/login"); }}
              style={{ ...menuItemButtonStyle, borderTop: "1px solid #eef2f7", marginTop: "0.3rem", paddingTop: "0.7rem" }}
            >
              <User size={16} /> تسجيل دخول كشريك
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDesktopActions = () => {
    if (variant === "partner") {
      return (
        <div className="pn-desktop-actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <button type="button" onClick={() => onOpenAuthModal?.("signup")} style={partnerPrimaryButtonStyle}>إنشاء حساب</button>
          <button type="button" onClick={() => onOpenAuthModal?.("login")} style={partnerTextButtonStyle}>تسجيل الدخول</button>
          {renderDropdownButton("دخول")}
          <span style={badgeStyle}>USD US</span>
          <span style={badgeStyle}>AR EG</span>
        </div>
      );
    }

    return (
      <div className="pn-desktop-actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
        {renderDropdownButton()}
        <span style={badgeStyle}>USD US</span>
        <span style={badgeStyle}>AR EG</span>
      </div>
    );
  };

  return (
    <>
      <style>{navbarCSS}</style>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.72)",
          borderBottom: scrolled ? "1px solid rgba(15, 23, 42, 0.09)" : "1px solid rgba(15, 23, 42, 0.04)",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.2rem",
          boxShadow: scrolled ? "0 6px 24px rgba(15, 23, 42, 0.10)" : "0 2px 8px rgba(15, 23, 42, 0.03)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          transition: "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
          fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
        }}
        dir="rtl"
      >
        {renderDesktopActions()}

        <button
          type="button"
          className="pn-mobile-toggle"
          onClick={() => setMobileOpen((c) => !c)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#12386a",
            padding: "0.3rem",
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="pn-desktop-nav" style={{ display: "flex", gap: "1.3rem", justifyContent: "center", flex: "1 1 auto" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              style={{
                fontSize: "0.88rem",
                color: location.pathname === link.to ? "#1d3f74" : "#5c6475",
                textDecoration: "none",
                fontWeight: location.pathname === link.to ? 800 : 700,
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#12386a", flexShrink: 0 }}>
          <img src="/logo_transparent.png" alt="Travky" style={{ height: "30px", width: "auto", objectFit: "contain" }} />
        </Link>
      </header>

      {mobileOpen && (
        <div
          className="pn-mobile-drawer"
          style={{
            position: "fixed",
            top: "56px",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflowY: "auto",
            fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
            animation: "pn-slide-down 0.25s ease",
          }}
          dir="rtl"
        >
          <style>{`@keyframes pn-slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: none; } }`}</style>
          <nav style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "0.95rem",
                  color: location.pathname === link.to ? "#1d3f74" : "#454d5e",
                  textDecoration: "none",
                  fontWeight: location.pathname === link.to ? 800 : 700,
                  padding: "0.75rem 0.5rem",
                  borderRadius: "12px",
                  background: location.pathname === link.to ? "rgba(23, 63, 120, 0.06)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: "0 1.2rem 0.8rem", borderTop: "1px solid #eef2f7" }}>
            <p style={{ margin: "0.9rem 0 0.6rem", color: "#475467", fontWeight: 700, fontSize: "0.82rem" }}>
              {clientSession ? `مرحباً، ${clientSession.name}` : "الحساب"}
            </p>

            {!clientSession ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {onOpenAuthModal && (
                  <>
                    <button type="button" onClick={() => { setMobileOpen(false); onOpenAuthModal("login"); }} style={mobileMenuBtnStyle}>
                      <User size={16} /> تسجيل الدخول
                    </button>
                    <button type="button" onClick={() => { setMobileOpen(false); onOpenAuthModal("signup"); }} style={mobileMenuBtnStyle}>
                      <UserPlus size={16} /> إنشاء حساب
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => { setMobileOpen(false); onLogout?.(); }} style={mobileMenuBtnStyle}>
                <LogOut size={16} /> تسجيل الخروج
              </button>
            )}

      
          </div>

          <div style={{ padding: "0 1.2rem 1rem", display: "flex", gap: "0.5rem" }}>
            <span style={badgeStyle}>USD US</span>
            <span style={badgeStyle}>AR EG</span>
          </div>
        </div>
      )}
    </>
  );
}

const actionButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.45rem 0.85rem",
  border: "1px solid rgba(18, 56, 106, 0.12)",
  borderRadius: "999px",
  fontSize: "0.82rem",
  color: "#12386a",
  textDecoration: "none",
  fontWeight: 800,
  boxShadow: "0 6px 18px rgba(18, 56, 106, 0.05)",
};

const partnerPrimaryButtonStyle = {
  border: "none",
  borderRadius: "12px",
  background: "#173f78",
  color: "#ffffff",
  padding: "0.55rem 0.95rem",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(23, 63, 120, 0.20)",
};

const partnerTextButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#1b2434",
  padding: "0.4rem 0.15rem",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  fontWeight: 800,
  cursor: "pointer",
};

const badgeStyle = {
  fontSize: "0.75rem",
  color: "#667085",
  fontWeight: 700,
  padding: "0.35rem 0.65rem",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(15, 23, 42, 0.06)",
};

const menuItemButtonStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "0.55rem 0.3rem",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  color: "#101828",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "right",
};

const mobileMenuBtnStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "0.65rem 0.4rem",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  color: "#101828",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "right",
};
