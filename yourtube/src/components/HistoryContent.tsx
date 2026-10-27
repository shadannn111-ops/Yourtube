"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) loadHistory();
    else setLoading(false);
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const historyData = await axiosInstance.get(`/history/${user?._id}`);
      const validHistory = historyData.data.filter((item: any) => item.videoid !== null);
      setHistory(validHistory);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    try { 
      await axiosInstance.delete(`/history/delete/${historyId}`);
      setHistory(history.filter((item) => item._id !== historyId)); 
      toast.success("Removed from history");
    } catch (error) { toast.error("Failed to remove"); }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Clock className="w-12 h-12 text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Keep track of what you watch</h2>
      <p className="text-gray-500">Watch history isn't viewable when signed out.</p>
    </div>
  );

  if (loading) return <div className="text-center py-10 text-gray-500">Loading history...</div>;

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Clock className="w-12 h-12 text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No watch history yet</h2>
      <p className="text-gray-500">Videos you watch will appear here.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Watch History</h1>
            <p className="text-sm text-gray-500">{history.length} videos</p>
          </div>
        </div>
        <Button onClick={loadHistory} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {history.map((item) => {
          if (!item.videoid) return null; 
          
          let videoUrl = item?.videoid?.filepath || "";
          if (videoUrl.startsWith("http://")) videoUrl = videoUrl.replace("http://", "https://");

          return (
            <div key={item._id} className="group flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              
              <Link href={`/watch/${item.videoid._id}`} className="w-full sm:w-72 flex-shrink-0 relative">
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                  <video src={`${videoUrl}#t=1`} className="object-cover w-full h-full pointer-events-none group-hover:scale-105 transition-transform duration-500" preload="metadata" muted playsInline />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">{item.videoid.videotitle}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.videoid.videochanel}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{item.videoid.views?.toLocaleString()} views</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 w-fit px-3 py-1.5 rounded-md">
                  Watched {formatDistanceToNow(new Date(item.createdAt))} ago
                </div>
              </div>

              <div className="flex sm:flex-col justify-end items-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-100 shadow-xl rounded-xl">
                    <DropdownMenuItem onClick={() => handleRemoveFromHistory(item._id)} className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer font-medium">
                      <X className="w-4 h-4 mr-2" /> Remove from history
                    </DropdownMenuItem>
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
