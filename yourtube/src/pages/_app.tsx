import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import OTPModal from "@/components/OTPModal";
import { Toaster } from "@/components/ui/sonner";
import GlobalLoader from "@/components/GlobalLoader";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // Desktop pe default open, mobile pe default closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  return (
    <UserProvider>
      <GlobalLoader />
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        <title>Your-Tube Clone</title>
        
        {/* ✅ Header ko pass kiya ki sidebar open hai ya nahi */}
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        <Toaster />
        <OTPModal />
        
        <div className="flex flex-1 overflow-hidden relative">
          {/* ✅ Sidebar: Mobile pe fixed overlay, desktop pe normal */}
          <div className={`
            fixed md:static inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"}
            mt-[57px] md:mt-0
          `}>
            <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
          </div>

          {/* Mobile ke liye black overlay jab sidebar khule */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden mt-[57px]"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-16 md:pb-0">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
