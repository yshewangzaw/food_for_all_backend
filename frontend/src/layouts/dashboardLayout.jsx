import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import Footer from "../components/layout/Footer";
import TestModeBanner from "../components/layout/TestModeBanner";

/**
 * Shell for every private page: Sidebar + Topbar + <Outlet /> + Footer.
 * Mounted once in routes/appRoutes.jsx — pages render inside <Outlet />.
 */
const DashboardLayout = () => {
  // Only used below 820px; on desktop the sidebar is always visible.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="shell">
      <TestModeBanner />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="main">
        <Topbar onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />

        <main className="content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
