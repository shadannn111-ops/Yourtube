import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Flame, Compass, Sparkles } from "lucide-react";

export default function Explore() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        const videosData = Array.isArray(res.data) ? res.data : [res.data];
        const shuffled = videosData.sort(() => 0.5 - Math.random());
        setVideos(shuffled);
      } catch (error) { console.log("Fetch error:", error); } 
      finally { setLoading(false); }
    };
    fetchvideo();
  }, []);

  const trendingVideos = videos.slice(0, 5);
  const techVideos = videos.filter(v => v.category === "Technology").slice(0, 4);
  const natureVideos = videos.filter(v => v.category === "Nature").slice(0, 4);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

  return (
    <div className="flex-1 min-h-screen bg-gray-50 pb-12">
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-8 overflow-hidden rounded-b-3xl shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm"><Compass className="w-10 h-10 text-white" /></div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Explore YourTube</h1>
            <p className="text-lg text-red-100 mt-2 font-light">Discover trending videos, categories, and creators.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-12 -mt-8 relative z-20">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {trendingVideos.map((video, idx) => (
              <Link key={video._id} href={`/watch/${video._id}`} className="snap-start flex-shrink-0 w-72 group relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <video src={`${video.filepath.replace(/\\/g, "/").startsWith("http") ? video.filepath.replace(/\\/g, "/") : "https://yourtube-backend-4g40.onrender.com/" + video.filepath.replace(/\\/g, "/")}#t=1`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" preload="metadata" muted playsInline />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-md">#{idx + 1} Trending</div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-base line-clamp-2">{video.videotitle}</h3>
                    <p className="text-xs text-gray-300 mt-1">{video.videochanel} • {video.views} views</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
