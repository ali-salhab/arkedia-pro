import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

export default function MainLayout({ children }) {
  const { dir } = useLanguage();

  return (
    <>
      <Navbar />
      <div
        className="layout"
        dir={dir}
        style={{ paddingTop: 56, height: "100vh", overflow: "hidden" }}
      >
        <Sidebar />
        <div
          className="content"
          style={{ overflowY: "auto", height: "calc(100vh - 56px)" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
