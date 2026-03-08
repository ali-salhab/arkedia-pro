import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

export default function MainLayout({ children }) {
  const { dir } = useLanguage();

  return (
    <>
      <Navbar />
      <div className="layout" dir={dir} style={{ paddingTop: 56 }}>
        <Sidebar />
        <div className="content">{children}</div>
      </div>
    </>
  );
}
