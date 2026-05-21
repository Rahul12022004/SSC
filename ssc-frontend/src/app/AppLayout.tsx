import { useLocation, Outlet } from "react-router-dom";
import DynamicNavbar from "@/common/components/DynamicNavbar";
import Footer from "@/common/components/Footer";
import ScrollToTop from "@/common/components/ScrollToTop";

const HIDE_LAYOUT_PREFIXES = ["/quiz", "/exam", "/testQuiz", "/result", "/mock-test"];

export default function AppLayout() {
  const { pathname } = useLocation();
  const hideLayout = HIDE_LAYOUT_PREFIXES.some((p) => pathname.startsWith(p));
  const hideFooter = hideLayout || pathname === "/tests";

  return (
    <div className="appLayout">
      <ScrollToTop />
      {!hideLayout && <DynamicNavbar />}
      <main className="mainContent">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
