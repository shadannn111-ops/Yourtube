import CustomVideoPlayer from "./CustomVideoPlayer";
import { useUser } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

export default function VideoPlayer({ video }: { video: any }) {
  const { user, login } = useUser();
  const [freshPlan, setFreshPlan] = useState<string>("free");

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

  let videoUrl = video?.filepath || "";
  if (videoUrl.startsWith("http://")) videoUrl = videoUrl.replace("http://", "https://");

  const playerKey = `${video?._id}-${freshPlan}`; 
  const subtitlesUrl = "/sample-subtitles.vtt";

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <CustomVideoPlayer
        key={playerKey} 
        videoUrl={videoUrl}
        userPlan={freshPlan}
        subtitlesUrl={subtitlesUrl}
      />
    </div>
  );
}
