import VideoCard from "./videocard";
import { useUser } from "@/lib/AuthContext";
import { Trash2, PlaySquare } from "lucide-react";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

export default function ChannelVideos({ videos }: any) {
  const { user } = useUser();

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await axiosInstance.delete(`/video/delete/${videoId}`);
      toast.success("Video deleted!");
      window.location.reload();
    } catch (error) { toast.error("Failed to delete video"); }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <PlaySquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video: any) => (
          <div key={video._id} className="relative group">
            <VideoCard video={video} />
            {user && user._id === video.uploader && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteVideo(video._id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
