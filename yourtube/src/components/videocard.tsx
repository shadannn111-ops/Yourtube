import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";

export default function VideoCard({ video }: any) {
  const [duration, setDuration] = useState<string>("0:00");
  
  // ✅ HTTPS FORCE FIX
  let videoUrl = video?.filepath || "";
  if (videoUrl.startsWith("http://")) {
    videoUrl = videoUrl.replace("http://", "https://");
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration;
    if (d && isFinite(d)) {
      const m = Math.floor(d / 60);
      const s = Math.floor(d % 60);
      setDuration(`${m}:${s.toString().padStart(2, "0")}`);
    }
  };

  return (
    <Link href={`/watch/${video?._id}`} className="group block w-full">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
          <video
            src={`${videoUrl}#t=1`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {duration}
          </div>
        </div>

        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback>{video?.videochanel?.[0] || "Y"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video?.videotitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{video?.videochanel || "Unknown"}</p>
            <p className="text-sm text-gray-600">
              {video?.views?.toLocaleString() || 0} views •{" "}
              {video?.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : "recently"} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
