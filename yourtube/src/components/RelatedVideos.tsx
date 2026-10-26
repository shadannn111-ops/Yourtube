import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";

// Auto thumbnail generator component
function VideoThumbnail({ videoUrl, alt }: { videoUrl: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumb, setThumb] = useState<string>("");

  const handleLoadedData = () => {
    const v = videoRef.current;
    if (v) v.currentTime = 1;
  };

  const handleSeeked = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    try {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        setThumb(c.toDataURL("image/jpeg", 0.7));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0">
      {thumb ? (
        <img src={thumb} alt={alt} className="object-cover w-full h-full" />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        className="hidden"
        muted
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedData={handleLoadedData}
        onSeeked={handleSeeked}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
    filepath?: string;
    thumbnail?: string;
  }>;
}

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos?.map((video) => {
        const cleanPath = video?.filepath?.replace(/\\/g, "/");
        const videoUrl = cleanPath?.startsWith("http")
          ? cleanPath
          : `http://localhost:5000/${cleanPath}`;

        return (
          <Link
            key={video._id}
            href={`/watch/${video._id}`}
            className="flex gap-2 group"
          >
            {/* ✅ FIX: Auto-generate thumbnail instead of broken img */}
            {video.thumbnail ? (
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.videotitle}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            ) : (
              <VideoThumbnail videoUrl={videoUrl} alt={video.videotitle} />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                {video.videotitle}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
              <p className="text-xs text-gray-600">
                {video.views?.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(video.createdAt))} ago
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}