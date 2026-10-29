import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Clock, Download, MoreHorizontal, Share, ThumbsDown, ThumbsUp, Flag, Bookmark, Ban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");

  const getUserId = () => user?._id || user?.id || null;

  useEffect(() => {
    setlikes(video?.Like || 0); setDislikes(video?.Dislike || 0); setIsLiked(false); setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const checkSubStatus = async () => {
      if (user && video?.uploader) {
        try { const res = await axiosInstance.get(`/subscribe/check/${video.uploader}/${getUserId()}`); setIsSubscribed(res.data.isSubscribed); } catch (error) { console.log(error); }
      }
    };
    checkSubStatus();
  }, [user, video]);

  useEffect(() => {
    const saveHistory = async () => {
      if (!video?._id) return;
      try {
        const userId = getUserId();
        if (userId) { await axiosInstance.post(`/history/${video._id}`, { userId: userId }); } 
        else { await axiosInstance.post(`/history/views/${video._id}`); }
      } catch (error) { console.log(error); }
    };
    if (video?._id) saveHistory();
  }, [video?._id, user]);

  const handleLike = async () => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, { userId: getUserId() });
      if (res.data.liked) {
        if (isLiked) { setlikes((p: any) => p - 1); setIsLiked(false); } 
        else { setlikes((p: any) => p + 1); setIsLiked(true); if (isDisliked) { setDislikes((p: any) => p - 1); setIsDisliked(false); } }
      }
    } catch (error) { console.log(error); }
  };

  const handleWatchLater = async () => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, { userId: getUserId() });
      if (res.data.watchlater) { setIsWatchLater(true); toast.success("Added to Watch Later"); } 
      else { setIsWatchLater(false); toast.info("Removed from Watch Later"); }
    } catch (error) { console.log(error); }
  };

  const handleDislike = async () => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, { userId: getUserId() });
      if (!res.data.liked) {
        if (isDisliked) { setDislikes((p: any) => p - 1); setIsDisliked(false); } 
        else { setDislikes((p: any) => p + 1); setIsDisliked(true); if (isLiked) { setlikes((p: any) => p - 1); setIsLiked(false); } }
      }
    } catch (error) { console.log(error); }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: video.videotitle, url: window.location.href }); } 
      else { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }
    } catch (error) { console.log(error); }
  };

  const handleDownload = async () => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post("/download/download", { userId: getUserId(), videoId: video._id, videoTitle: video.videotitle, thumbnail: video.thumbnail });
      if (res.data.success) { setDownloadStatus("Downloaded successfully!"); toast.success("Video downloaded!"); } 
      else { toast.error(res.data.message || "Failed to download"); }
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to download"); }
  };

  const handleSubscribe = async () => {
    if (!user) return toast.error("Please login first");
    const channelId = video?.uploader;
    if (!channelId) return toast.error("Channel information missing");
    try {
      const res = await axiosInstance.post(`/subscribe/${channelId}`, { subscriberId: getUserId() });
      if (res.data.subscribed) { setIsSubscribed(true); toast.success("Subscribed! 🎉"); } 
      else { setIsSubscribed(false); toast.info("Unsubscribed"); }
    } catch (error: any) { toast.error("Failed to subscribe"); }
  };

  return (
    <div className="space-y-4 text-gray-900 mt-2">
      <h1 className="text-xl md:text-2xl font-bold leading-tight">{video?.videotitle}</h1>

      {/* ✅ REAL YOUTUBE LAYOUT (Channel info & Buttons same line on desktop) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Channel + Subscribe */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-gray-200 shadow-sm">
            <AvatarFallback className="bg-gray-100 text-gray-700 text-lg font-bold">{video?.videochanel?.[0]}</AvatarFallback>
          </Avatar>
          <div className="mr-2">
            <h3 className="font-bold text-base md:text-lg leading-tight">{video?.videochanel}</h3>
            <p className="text-xs md:text-sm text-gray-500 font-medium">1.2M subscribers</p>
          </div>
          
          <Button 
            onClick={handleSubscribe} 
            className={`rounded-full px-5 font-bold shadow-sm transition-all ${
              isSubscribed 
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </div>

        {/* Right: Action Buttons (All in one line) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {/* Like / Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button variant="ghost" size="sm" className="rounded-l-full hover:bg-gray-200 font-medium pr-3 pl-4" onClick={handleLike}>
              <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? "fill-black text-black" : ""}`} />{likes?.toLocaleString()}
            </Button>
            <div className="w-px h-5 bg-gray-300" />
            <Button variant="ghost" size="sm" className="rounded-r-full hover:bg-gray-200 font-medium pr-4 pl-3" onClick={handleDislike}>
              <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-black text-black" : ""}`} />
            </Button>
          </div>

          {/* Watch Later */}
          <Button variant="ghost" size="sm" className={`bg-gray-100 rounded-full hover:bg-gray-200 font-medium px-4 ${isWatchLater ? "text-red-600" : ""}`} onClick={handleWatchLater}>
            <Clock className="w-4 h-4 mr-2" />{isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          {/* Share */}
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full hover:bg-gray-200 font-medium px-4" onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />Share
          </Button>

          {/* Download */}
          <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full hover:bg-gray-200 font-medium px-4" onClick={handleDownload} disabled={downloadStatus === "Downloaded successfully!"}>
            <Download className="w-4 h-4 mr-2" />{downloadStatus === "Downloaded successfully!" ? "Downloaded" : "Download"}
          </Button>

          {/* 3-Dot Menu (Working) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full hover:bg-gray-200 shrink-0">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-xl rounded-xl">
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer font-medium hover:bg-gray-100">
                <Share className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleWatchLater} className="cursor-pointer font-medium hover:bg-gray-100">
                <Bookmark className="w-4 h-4 mr-2" /> {isWatchLater ? "Remove Watch Later" : "Save to Watch Later"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem onClick={() => toast.info("Report submitted")} className="cursor-pointer font-medium hover:bg-gray-100 text-red-600">
                <Flag className="w-4 h-4 mr-2" /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ✅ Description Box */}
      <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl p-3 md:p-4 cursor-pointer mt-4" onClick={() => setShowFullDescription(!showFullDescription)}>
        <div className="flex gap-2 text-sm font-bold mb-1">
          <span>{video?.views?.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video?.createdAt))} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-2"}`}>
          <p>{video?.description || "No description provided."}</p>
        </div>
        <p className="text-sm font-bold mt-2 hover:underline">{showFullDescription ? "Show less" : "Show more"}</p>
      </div>
    </div>
  );
};

export default VideoInfo;
