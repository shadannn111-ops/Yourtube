import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Clock, Download, MoreHorizontal, Share, ThumbsDown, ThumbsUp, Flag, Bookmark, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getUserId = () => user?._id || user?.id || null;

  useEffect(() => {
    setlikes(video?.Like || 0); setDislikes(video?.Dislike || 0); setIsLiked(false); setIsDisliked(false);
  }, [video]);

  // ✅ FIX 1: Subscribe State hamesha backend se check karo
  useEffect(() => {
    const checkSubStatus = async () => {
      if (user && video?.uploader) {
        try { 
          const res = await axiosInstance.get(`/subscribe/check/${video.uploader}/${getUserId()}`); 
          setIsSubscribed(res.data.isSubscribed); 
        } catch (error) { console.log(error); }
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
    setIsDownloading(true);
    try {
      const res = await axiosInstance.post("/download/download", { userId: getUserId(), videoId: video._id, videoTitle: video.videotitle, thumbnail: video.thumbnail });
      if (res.data.success) {
        let videoUrl = video?.filepath || "";
        if (videoUrl.startsWith("http://")) videoUrl = videoUrl.replace("http://", "https://");
        window.open(videoUrl, "_blank");
        toast.success("Video opened in new tab.");
      } else { toast.error(res.data.message || "Failed to download"); }
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to download"); } 
    finally { setIsDownloading(false); }
  };

  // ✅ FIX 2: Subscribe function sirf backend bharosa karega
  const handleSubscribe = async () => {
    if (!user) return toast.error("Please login first");
    const channelId = video?.uploader;
    if (!channelId) return toast.error("Channel information missing");
    try {
      const res = await axiosInstance.post(`/subscribe/${channelId}`, { subscriberId: getUserId() });
      if (res.data.subscribed) { 
        setIsSubscribed(true); 
        toast.success("Subscribed! 🎉"); 
      } else { 
        setIsSubscribed(false); 
        toast.info("Unsubscribed"); 
      }
    } catch (error: any) { toast.error("Failed to subscribe"); }
  };

  const actionBtnClass = "flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm px-4 py-2 rounded-full transition-all duration-150 active:scale-95 select-none cursor-pointer";

  return (
    <div className="space-y-4 text-gray-900 mt-2">
      <h1 className="text-xl md:text-2xl font-bold leading-tight select-none">{video?.videotitle}</h1>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-gray-200 shadow-sm">
            <AvatarFallback className="bg-gray-100 text-gray-700 text-lg font-bold">{video?.videochanel?.[0]}</AvatarFallback>
          </Avatar>
          <div className="mr-2">
            <h3 className="font-bold text-base md:text-lg leading-tight">{video?.videochanel}</h3>
            <p className="text-xs md:text-sm text-gray-500 font-medium">1.2M subscribers</p>
          </div>
          
          <Button onClick={handleSubscribe} className={`rounded-full px-6 font-bold shadow-sm transition-all duration-150 active:scale-95 ${isSubscribed ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-red-600 hover:bg-red-700 text-white"}`}>
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full">
            <button onClick={handleLike} className="flex items-center gap-2 hover:bg-gray-200 px-4 py-2 rounded-l-full transition-all duration-150 active:scale-95 select-none cursor-pointer border-r border-gray-300">
              <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-black" : ""}`} />
              <span className="font-bold text-sm">{likes?.toLocaleString()}</span>
            </button>
            <button onClick={handleDislike} className="flex items-center hover:bg-gray-200 px-4 py-2 rounded-r-full transition-all duration-150 active:scale-95 select-none cursor-pointer">
              <ThumbsDown className={`w-5 h-5 ${isDisliked ? "fill-black" : ""}`} />
            </button>
          </div>

          <button onClick={handleWatchLater} className={`${actionBtnClass} ${isWatchLater ? "text-red-600 bg-red-50 hover:bg-red-100" : ""}`}>
            <Clock className="w-5 h-5" /> {isWatchLater ? "Saved" : "Watch Later"}
          </button>

          <button onClick={handleShare} className={actionBtnClass}>
            <Share className="w-5 h-5" /> Share
          </button>

          <button onClick={handleDownload} disabled={isDownloading} className={`${actionBtnClass} ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isDownloading ? "Opening..." : "Download"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-150 active:scale-95 select-none cursor-pointer">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-xl rounded-xl">
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer font-medium hover:bg-gray-100 py-2.5"><Share className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
              <DropdownMenuItem onClick={handleWatchLater} className="cursor-pointer font-medium hover:bg-gray-100 py-2.5"><Bookmark className="w-4 h-4 mr-2" /> {isWatchLater ? "Remove Watch Later" : "Save to Watch Later"}</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem onClick={() => toast.info("Report submitted")} className="cursor-pointer font-medium hover:bg-gray-100 text-red-600 py-2.5"><Flag className="w-4 h-4 mr-2" /> Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-xl p-3 md:p-4 cursor-pointer mt-4 select-none" onClick={() => setShowFullDescription(!showFullDescription)}>
        <div className="flex gap-2 text-sm font-bold mb-1">
          <span>{video?.views?.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video?.createdAt))} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-2"}`}><p>{video?.description || "No description provided."}</p></div>
        <p className="text-sm font-bold mt-2 hover:underline">{showFullDescription ? "Show less" : "Show more"}</p>
      </div>
    </div>
  );
};

export default VideoInfo;
