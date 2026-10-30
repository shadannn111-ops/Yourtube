import CustomVideoPlayer from "./CustomVideoPlayer";
import { useUser } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export default function VideoPlayer({ video }: { video: any }) {
  const { user, login } = useUser();
  const [freshPlan, setFreshPlan] = useState<string>("free");
  const [isSlowNet, setIsSlowNet] = useState(false);
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    const fetchLatestPlan = async () => {
      if (!user) return;
      try {
        const userId = user._id || user.id;
        const res = await axiosInstance.get(`/subscription/${userId}`);
        if (res.data && res.data.plan) {
          setFreshPlan(res.data.plan.toLowerCase());
          if (user.subscriptionPlan !== res.data.plan.toLowerCase()) {
            if (login) login({ ...user, subscriptionPlan: res.data.plan.toLowerCase() });
          }
        }
      } catch (error) { setFreshPlan(user?.subscriptionPlan || "free"); }
    };
    fetchLatestPlan();
  }, [user?._id, user?.id]);

  // ✅ Slow Network Detector (10 sec baad error)
  useEffect(() => {
    setIsSlowNet(false);
    const timer = setTimeout(() => { setIsSlowNet(true); }, 10000);
    return () => clearTimeout(timer);
  }, [video?._id, key]);

  let videoUrl = video?.filepath || "";
  if (videoUrl.startsWith("http://")) videoUrl = videoUrl.replace("http://", "https://");

  const playerKey = `${video?._id}-${freshPlan}-${key}`; 
  const subtitlesUrl = "/sample-subtitles.vtt";

  if (isSlowNet) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white p-6 border border-gray-700">
        <div className="bg-red-600/20 p-4 rounded-full mb-4"><WifiOff className="w-12 h-12 text-red-500" /></div>
        <h2 className="text-xl font-bold mb-2">Slow Internet Connection</h2>
        <p className="text-gray-400 text-center text-sm mb-6 max-w-md">We are unable to load the video. Please check your internet connection or try again.</p>
        <Button onClick={() => setKey(Date.now())} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Retry Loading</Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <CustomVideoPlayer key={playerKey} videoUrl={videoUrl} userPlan={freshPlan} subtitlesUrl={subtitlesUrl} />
    </div>
  );
}
