import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axiosInstance from "@/lib/axiosinstance";
import { PlaySquare, Search } from "lucide-react";

const SearchResult = ({ query }: any) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!query || query.trim() === "") {
        setVideos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // ✅ Backend se saari videos fetch karo
        const res = await axiosInstance.get("/video/getall");
        const allVideos = Array.isArray(res.data) ? res.data : [res.data];

        // ✅ Filter logic: Title ya Channel naam me query match karo
        const filtered = allVideos.filter((vid: any) => 
          vid.videotitle?.toLowerCase().includes(query.toLowerCase()) ||
          vid.videochanel?.toLowerCase().includes(query.toLowerCase())
        );

        setVideos(filtered);
      } catch (error) {
        console.log("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [query]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Searching videos...</div>;
  }

  if (!query || query.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
        <div className="bg-red-50 p-6 rounded-full mb-6"><Search className="w-12 h-12 text-red-500" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search YourTube</h2>
        <p className="text-gray-500">Enter a search term to find videos and channels.</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
        <div className="bg-gray-50 p-6 rounded-full mb-6"><Search className="w-12 h-12 text-gray-400" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
        <p className="text-gray-500">Try different keywords or remove search filters.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Search results for "{query}"</h2>
      
      <div className="space-y-6">
        {videos.map((video: any) => {
          let videoUrl = video?.filepath || "";
          if (videoUrl.startsWith("http://")) videoUrl = videoUrl.replace("http://", "https://");

          return (
            <div key={video._id} className="group flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              
              <Link href={`/watch/${video._id}`} className="w-full sm:w-72 flex-shrink-0 relative">
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                  <video src={`${videoUrl}#t=1`} className="object-cover w-full h-full pointer-events-none group-hover:scale-105 transition-transform duration-500" preload="metadata" muted playsInline />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/watch/${video._id}`}>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-2">{video.videotitle}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">{video.videochanel}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{video.views?.toLocaleString() || 0} views</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Avatar className="w-6 h-6"><AvatarFallback className="text-xs bg-gray-200">{video.videochanel?.[0] || "Y"}</AvatarFallback></Avatar>
                  <span>{video.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : "recently"} ago</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResult;
