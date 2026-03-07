import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

export default function MainLayout({ children }) {
  const { dir } = useLanguage();

  return (
    <div className="layout" dir={dir}>
      <Sidebar />
      <div className="content">
        <Navbar />
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
}
