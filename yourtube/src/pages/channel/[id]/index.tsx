import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { Upload } from "lucide-react";

const ChannelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const uploadRef = useRef<HTMLDivElement>(null);

  const isOwnChannel = user && (user._id === id || user.id === id);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  let channel = user;

  return (
    <div className="flex-1 min-h-screen bg-white relative">
      <div className="max-w-full mx-auto pb-24">
        <ChannelHeader channel={channel} user={user} />
        <Channeltabs channelId={id as string} channelData={channel} />

        {/* ✅ Sirf Upload Section rahega */}
        <div ref={uploadRef} className="px-4 pb-8">
          <VideoUploader channelId={id} channelName={channel?.channelname || channel?.name} />
        </div>
        
        {/* ❌ Fake Videos section yahan se hata diya gaya hai */}
      </div>

      {isOwnChannel && (
        <button
          onClick={scrollToUpload}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload some video</span>
        </button>
      )}
    </div>
  );
};

export default ChannelPage;