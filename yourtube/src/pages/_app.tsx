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
        
        {/* ✅ Premium Toast Notification */}
        <Toaster 
          position="bottom-right" 
          theme="dark" 
          toastOptions={{
            className: "font-sans",
            style: {
              background: "#1f2937", // Dark gray
              color: "#ffffff",
              border: "1px solid #374151",
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              fontSize: "14px",
              fontWeight: "500",
            },
          }}
        />

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
            <div key={router.pathname} className="page-transition h-full">
              <Component {...pageProps} />
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
