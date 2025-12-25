import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
}
