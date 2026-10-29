import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import OTPModal from "@/components/OTPModal";
import { Toaster } from "@/components/ui/sonner";
import GlobalLoader from "@/components/GlobalLoader";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebarMobile = () => { if (isMobile) setIsSidebarOpen(false); };

  return (
    <UserProvider>
      <GlobalLoader />
      <div className="h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
        <title>Your-Tube Clone</title>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <Toaster theme="light" />
        <OTPModal />
        
        <div className="flex flex-1 overflow-hidden relative">
          <div className={`
            fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"}
            mt-[57px] md:mt-0
          `}>
            <Sidebar closeSidebar={closeSidebarMobile} />
          </div>

          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden mt-[57px]" onClick={() => setIsSidebarOpen(false)} />
          )}

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-16 md:pb-0 bg-gray-50">
            {/* ✅ page-transition class lagayi hai key ke saath taaki har route change pe animate ho */}
            <div key={router.pathname} className="page-transition h-full">
              <Component {...pageProps} />
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
