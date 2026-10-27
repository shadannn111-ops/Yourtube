import CustomVideoPlayer from "./CustomVideoPlayer";
import { useUser } from "@/lib/AuthContext";

export default function VideoPlayer({ video }: { video: any }) {
  const { user } = useUser();

  // ✅ HTTPS FORCE FIX
  let videoUrl = video?.filepath || "";
  if (videoUrl.startsWith("http://")) {
    videoUrl = videoUrl.replace("http://", "https://");
  }

  // ✅ DYNAMIC PLAN FIX: User plan hamesha latest state se aayega
  const userPlan = user?.subscriptionPlan || "free";
  
  // ✅ Key prop add karo taaki plan change hote hi player re-render ho
  const playerKey = `${video?._id}-${userPlan}`;

  const subtitlesUrl = "/sample-subtitles.vtt";

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <CustomVideoPlayer
        key={playerKey} // ✅ Ye line sabse zaroori hai
        videoUrl={videoUrl}
        userPlan={userPlan}
        subtitlesUrl={subtitlesUrl}
      />
    </div>
  );
}
