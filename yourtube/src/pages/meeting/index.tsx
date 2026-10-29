import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";

export default function MeetingRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (error) {
        toast.error("Camera/Mic access denied");
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);
    }
  };

  const leaveMeeting = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    router.push("/meeting");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId as string);
    setCopied(true);
    toast.success("Room ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!roomId) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Video className="w-5 h-5 text-white" /></div>
          <h1 className="text-lg font-bold">Meeting Room</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
          <span className="text-sm font-mono text-gray-300">{roomId}</span>
          <button onClick={copyRoomId} className="text-gray-400 hover:text-white">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-4xl font-bold">
                {user?.name?.[0] || "U"}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
            {user?.name || "You"} (Host)
            {!isAudioOn && <MicOff className="w-3 h-3 text-red-500" />}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6 flex justify-center gap-4 shadow-inner">
        <button onClick={toggleAudio} className={`p-4 rounded-full transition-all ${isAudioOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}>
          {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}>
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        <button onClick={leaveMeeting} className="p-4 rounded-full bg-red-600 hover:bg-red-700 px-8 flex items-center gap-2 font-bold transition-all">
          <PhoneOff className="w-6 h-6" /> Leave
        </button>
      </div>
    </div>
  );
}