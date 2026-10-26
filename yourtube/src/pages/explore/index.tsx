import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Flame, Compass, Sparkles } from "lucide-react";

export default function Explore() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/video/getall");
        const videosData = Array.isArray(res.data) ? res.data : [res.data];
        // Shuffle videos randomly for explore
        const shuffled = videosData.sort(() => 0.5 - Math.random());
        setVideos(shuffled);
      } catch (error) {
        console.log("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchvideo();
  }, []);

  const trendingVideos = videos.slice(0, 5);
  const techVideos = videos.filter(v => v.category === "Technology").slice(0, 4);
  const natureVideos = videos.filter(v => v.category === "Nature").slice(0, 4);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Explore...</div>;

  return (
    <div className="flex-1 min-h-screen bg-background">
      {/* ✅ Premium Header */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-center gap-4">
          <Compass className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold">Explore YourTube</h1>
            <p className="text-lg text-white/80 mt-2">Discover trending videos, categories, and creators.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-12">
        
        {/* ✅ Section 1: Trending Now (Horizontal Scroll Cards) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {trendingVideos.map((video, idx) => (
              <Link key={video._id} href={`/watch/${video._id}`} className="snap-start flex-shrink-0 w-72 group relative overflow-hidden rounded-xl bg-gray-900 cursor-pointer shadow-md">
                <div className="relative aspect-video overflow-hidden">
                  <video src={`http://localhost:5000/${video.filepath.replace(/\\/g, "/")}#t=1`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" preload="metadata" muted playsInline />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-red-600 text-white font-bold px-2 py-1 rounded text-xs">#{idx + 1} Trending</div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-semibold text-sm line-clamp-2">{video.videotitle}</h3>
                    <p className="text-xs text-gray-300 mt-1">{video.videochanel} • {video.views} views</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ✅ Section 2: Tech & Gadgets Grid */}
        {techVideos.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Tech & Innovation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techVideos.map(video => (
                <Link key={video._id} href={`/watch/${video._id}`} className="group flex flex-col gap-2">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                    <video src={`http://localhost:5000/${video.filepath.replace(/\\/g, "/")}#t=1`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" preload="metadata" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-10 h-10 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2">{video.videotitle}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(video.createdAt))} ago</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ✅ Section 3: Nature & Wildlife */}
        {natureVideos.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
              <h2 className="text-2xl font-bold">Nature & Wildlife</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {natureVideos.map(video => (
                <Link key={video._id} href={`/watch/${video._id}`} className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                  <video src={`http://localhost:5000/${video.filepath.replace(/\\/g, "/")}#t=1`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" preload="metadata" muted playsInline />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-base line-clamp-2">{video.videotitle}</h3>
                    <p className="text-xs text-gray-300 mt-2 flex items-center gap-1"><Play className="w-3 h-3" /> {video.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
