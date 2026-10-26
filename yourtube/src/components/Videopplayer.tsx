import CustomVideoPlayer from "./CustomVideoPlayer";
import { useUser } from "@/lib/AuthContext";

export default function VideoPlayer({ video }: { video: any }) {
  const { user } = useUser();

  // ✅ HTTPS FORCE FIX
  let videoUrl = video?.filepath || "";
  if (videoUrl.startsWith("http://")) {
    videoUrl = videoUrl.replace("http://", "https://");
  }

  const userPlan = user?.subscriptionPlan || "free";
  const subtitlesUrl = "/sample-subtitles.vtt";

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <CustomVideoPlayer
        videoUrl={videoUrl}
        userPlan={userPlan}
        subtitlesUrl={subtitlesUrl}
      />
    </div>
  );
}
