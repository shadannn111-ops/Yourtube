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
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
      <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Keep track of what you watch</h2>
      <p className="text-gray-500">Watch history isn't viewable when signed out.</p>
    </div>
  );

  if (loading) return <div className="text-center py-10 text-gray-500">Loading history...</div>;

  if (history.length === 0) return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
      <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">No watch history yet</h2>
      <p className="text-gray-500">Videos you watch will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <p className="text-sm font-medium text-gray-600">{history.length} videos</p>
        <Button onClick={loadHistory} className="bg-red-600 hover:bg-red-700 text-white">Refresh</Button>
      </div>
      <div className="space-y-4 md:space-y-6">
        {history.map((item) => {
          if (!item.videoid) return null; 
          
          let videoUrl = item?.videoid?.filepath || "";
          if (videoUrl.startsWith("http://")) videoUrl = videoUrl.replace("http://", "https://");

          return (
            <div key={item._id} className="flex flex-col sm:flex-row gap-4 group bg-white p-3 md:p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition">
              <Link href={`/watch/${item.videoid._id}`} className="w-full sm:w-64 flex-shrink-0">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video src={`${videoUrl}#t=1`} className="object-cover w-full h-full pointer-events-none group-hover:scale-105 transition-transform duration-300" preload="metadata" muted playsInline />
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-bold text-base md:text-lg text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-2">{item.videoid.videotitle}</h3>
                </Link>
                <p className="text-sm text-gray-600">{item.videoid.videochanel}</p>
                <p className="text-sm text-gray-500 mt-1">{item.videoid.views?.toLocaleString()} views • {formatDistanceToNow(new Date(item.videoid.createdAt))} ago</p>
              </div>
              <div className="flex sm:flex-col justify-end items-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900"><MoreVertical className="w-5 h-5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-900">
                    <DropdownMenuItem onClick={() => handleRemoveFromHistory(item._id)} className="hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"><X className="w-4 h-4 mr-2" />Remove from history</DropdownMenuItem>
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
