
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/Videopplayer";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const WatchPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [video, setVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        // ✅ AxiosInstance use ho raha hai
        const res = await axiosInstance.get("/video/getall");
        const allVids = Array.isArray(res.data) ? res.data : [res.data];
        setAllVideos(allVids);
        const foundVideo = allVids.find((v) => v._id === id) || allVids[0];
        setVideo(foundVideo);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  useEffect(() => {
    const saveHistory = async () => {
      if (!user || !id || typeof id !== "string") return;
      try {
        // ✅ AxiosInstance use ho raha hai
        await axiosInstance.post(`/history/views/${id}`);
        await axiosInstance.post(`/history/${id}`, { userId: user._id || user.id });
      } catch (error) {
        console.log("History save error:", error);
      }
    };
    saveHistory();
  }, [user, id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!video) return <div className="p-6">Video not found</div>;

  return (
    <div className="flex-1 bg-white min-h-screen w-full">
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer video={video} />
            <VideoInfo video={video} />
            <Comments videoId={id} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={allVideos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;