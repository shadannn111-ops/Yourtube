import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);

  // ✅ Camera & Mic Setup
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setIsVideoOn(true);
        setIsAudioOn(true);
      } catch (error) {
        toast.error("Camera/Mic access denied. Please allow permissions.");
        setIsVideoOn(false);
        setIsAudioOn(false);
      } finally {
        setLoading(false);
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // ✅ Meeting Details Fetch
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!roomId) return;
      try {
        const res = await axiosInstance.get(`/meeting/${roomId}`);
        setMeeting(res.data);
      } catch (error) { console.log(error); }
    };
    fetchMeeting();
  }, [roomId]);

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

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Setting up your camera...</p>
      </div>
    </div>
  );

  if (!roomId) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      
      {/* ✅ Header (Room Info) */}
      <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Video className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-lg font-bold">Meeting Room</h1>
            <p className="text-xs text-gray-400">Host: {meeting?.host?.name || "Unknown"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
            <span className="text-sm font-mono text-gray-300">{roomId}</span>
            <button onClick={copyRoomId} className="text-gray-400 hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-1 border border-green-500/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* ✅ Main Video Area */}
      <div className="flex-1 p-4 md:p-6 flex items-center justify-center relative">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover mirror" 
            style={{ transform: "scaleX(-1)" }} // ✅ Mirror effect (like Zoom)
          />
          
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-5xl font-bold shadow-xl border-4 border-gray-700">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          )}

          {/* Name Tag */}
          <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-sm border border-white/10">
            <Shield className="w-4 h-4 text-red-500" />
            {user?.name || "You"} (Host)
            {!isAudioOn && <MicOff className="w-4 h-4 text-red-500" />}
          </div>
        </div>
      </div>

      {/* ✅ Controls Bar (Zoom Style) */}
      <div className="bg-gray-800 p-4 md:p-6 flex justify-center gap-4 shadow-inner border-t border-gray-700">
        <button 
          onClick={toggleAudio} 
          className={`p-4 rounded-full transition-all active:scale-95 shadow-lg ${isAudioOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}
          title={isAudioOn ? "Mute" : "Unmute"}
        >
          {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          className={`p-4 rounded-full transition-all active:scale-95 shadow-lg ${isVideoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}
          title={isVideoOn ? "Turn off Camera" : "Turn on Camera"}
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={leaveMeeting} 
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 px-8 flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-6 h-6" /> Leave
        </button>
      </div>
    </div>
  );
}