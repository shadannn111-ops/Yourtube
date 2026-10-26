"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, ThumbsUp, Play, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

export default function LikedVideosContent() {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => { if (user) loadLikedVideos(); }, [user]);

  const loadLikedVideos = async () => {
    if (!user) return;
    try {
      const likedData = await axiosInstance.get(`/like/${user?._id}`);
      const validLikes = likedData.data.filter((item: any) => item.videoid !== null);
      setLikedVideos(validLikes);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleUnlikeVideo = async (likedVideoId: string) => {
    try { 
      setLikedVideos(likedVideos.filter((item) => item._id !== likedVideoId)); 
      toast.success("Removed from liked videos");
    } 
    catch (error) { console.error(error); }
  };

  if (!user) return (
    <div className="text-center py-16 bg-[#212121] rounded-2xl border border-gray-800">
      <ThumbsUp className="w-16 h-16 mx-auto text-gray-600 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Keep track of videos you like</h2>
      <p className="text-gray-400">Sign in to see your liked videos.</p>
    </div>
  );

  if (loading) return <div className="text-center py-10 text-gray-400">Loading liked videos...</div>;

  if (likedVideos.length === 0) return (
    <div className="text-center py-16 bg-[#212121] rounded-2xl border border-gray-800">
      <ThumbsUp className="w-16 h-16 mx-auto text-gray-600 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">No liked videos yet</h2>
      <p className="text-gray-400">Videos you like will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center bg-[#212121] p-4 rounded-xl border border-gray-800">
        <p className="text-sm font-medium text-gray-300">{likedVideos.length} videos</p>
        <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"><Play className="w-4 h-4" />Play all</Button>
      </div>
      <div className="space-y-4 md:space-y-6">
        {likedVideos.map((item) => {
          if (!item.videoid) return null;
          const cleanPath = item?.videoid?.filepath?.replace(/\\/g, "/");
          const videoUrl = cleanPath?.startsWith("http") ? cleanPath : `http://localhost:5000/${cleanPath}`;

          return (
            <div key={item._id} className="flex flex-col sm:flex-row gap-4 group bg-[#1a1a1a] p-3 md:p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition">
              <Link href={`/watch/${item.videoid._id}`} className="w-full sm:w-64 flex-shrink-0">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video src={`${videoUrl}#t=1`} className="object-cover w-full h-full pointer-events-none group-hover:scale-105 transition-transform duration-300" preload="metadata" muted playsInline />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-bold text-base md:text-lg text-white line-clamp-2 group-hover:text-red-500 transition-colors mb-2">{item.videoid.videotitle}</h3>
                </Link>
                <p className="text-sm text-gray-400">{item.videoid.videochanel}</p>
                <p className="text-sm text-gray-500 mt-1">{item.videoid.views?.toLocaleString()} views • {formatDistanceToNow(new Date(item.videoid.createdAt))} ago</p>
                <p className="text-xs text-gray-600 mt-2 bg-gray-800 inline-block px-2 py-1 rounded">Liked {formatDistanceToNow(new Date(item.createdAt))} ago</p>
              </div>
              <div className="flex sm:flex-col justify-end items-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#212121] border-gray-800 text-white">
                    <DropdownMenuItem onClick={() => handleUnlikeVideo(item._id)} className="hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white cursor-pointer"><X className="w-4 h-4 mr-2" />Remove from liked</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
