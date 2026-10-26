import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function GlobalLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const start = () => {
      setLoading(true);
      setProgress(10);
      
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 150);

      // ✅ SAFETY FIX: Agar 1.5 second tak page load nahi hota, toh loader band kar do
      hideTimeout = setTimeout(() => {
        complete();
      }, 1500);
    };

    const complete = () => {
      setProgress(100);
      clearInterval(progressInterval);
      clearTimeout(hideTimeout);
      
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", complete);
    router.events.on("routeChangeError", complete);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", complete);
      router.events.off("routeChangeError", complete);
      clearInterval(progressInterval);
      clearTimeout(hideTimeout);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
        <div 
          className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="fixed inset-0 z-[9998] bg-white/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </>
  );
}
