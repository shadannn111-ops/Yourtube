import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Loader2, Shield, Share2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingRoom() {
  const router = useRouter();
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [roomId, setRoomId] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ LocalStorage se Room ID uthao
  useEffect(() => {
    const storedRoom = localStorage.getItem("activeMeetingRoom");
    if (storedRoom) {
      setRoomId(storedRoom);
      setLoading(false);
    } else {
      createNewRoom();
    }
  }, []);

  const createNewRoom = async () => {
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }
    try {
      const res = await axiosInstance.post("/meeting/create", {
        userId: user._id || user.id, title: "Instant Meeting", password: "default", maxParticipants: 10, duration: 60,
      });
      if (res.data.success) {
        const newRoomId = res.data.meeting.roomId;
        localStorage.setItem("activeMeetingRoom", newRoomId);
        setRoomId(newRoomId);
      }
    } catch (error) { toast.error("Failed to create meeting"); router.push("/meeting"); } 
    finally { setLoading(false); }
  };

  // ✅ Camera Start (PLAY FIX)
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // ✅ Ye line video stream ko play karegi
        videoRef.current.play().catch((e) => console.log("Play error:", e));
      }
      
      setIsVideoOn(true);
      setIsAudioOn(true);
      setJoined(true);
      toast.success("Camera connected!");
    } catch (error) {
      toast.error("Camera access denied.");
    }
  };

  const toggleVideo = () => { if (stream) { const v = stream.getVideoTracks()[0]; v.enabled = !v.enabled; setIsVideoOn(v.enabled); } };
  const toggleAudio = () => { if (stream) { const a = stream.getAudioTracks()[0]; a.enabled = !a.enabled; setIsAudioOn(a.enabled); } };
  
  const leaveMeeting = () => { 
    if (stream) stream.getTracks().forEach((t) => t.stop()); 
    localStorage.removeItem("activeMeetingRoom");
    router.push("/meeting"); 
  };
  
  // ✅ Invite Link Copy Function
  const copyInviteLink = () => { 
    if (!roomId) return;
    // Invite link jisme roomId ho
    const inviteLink = `${window.location.origin}/meeting/join?roomId=${roomId}`;
    navigator.clipboard.writeText(inviteLink); 
    setCopied(true); 
    toast.success("Invite link copied!"); 
    setTimeout(() => setCopied(false), 2000); 
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
        <p>Creating Meeting Room...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center shadow-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Video className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-base font-bold">Meeting Room</h1>
            <p className="text-xs text-gray-400">Room ID: {roomId || "Generating..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ Invite Button */}
          <button onClick={copyInviteLink} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
            {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />} Invite
          </button>
          <button onClick={copyInviteLink} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm font-medium">
            <Copy className="w-4 h-4" /> Copy ID
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative flex items-center justify-center">
          
          {/* ✅ Video tag hamesha rahega, par hide ho sakta hai */}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${joined ? "block" : "hidden"}`}
            style={{ transform: "scaleX(-1)" }} 
          />

          {!joined ? (
            <div className="text-center p-8 bg-gray-800 rounded-2xl max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Ready to join?</h3>
              <p className="text-gray-400 mb-6 text-sm">Click the button below to enable camera and mic.</p>
              <Button onClick={startCamera} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                Join Now
              </Button>
            </div>
          ) : (
            <>
              {/* Agar video off hai toh initial dikhao */}
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-5xl font-bold shadow-xl border-4 border-gray-700">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-sm border border-white/10">
                <Shield className="w-4 h-4 text-red-500" />
                {user?.name || "Guest"}
                {!isAudioOn && <MicOff className="w-4 h-4 text-red-500" />}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      {joined && (
        <div className="bg-gray-800 p-4 md:p-6 flex justify-center gap-4 shadow-inner border-t border-gray-700">
          <button onClick={toggleAudio} className={`p-4 rounded-full transition-all active:scale-95 shadow-lg ${isAudioOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}>
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          <button onClick={toggleVideo} className={`p-4 rounded-full transition-all active:scale-95 shadow-lg ${isVideoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}>
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          <button onClick={leaveMeeting} className="p-4 rounded-full bg-red-600 hover:bg-red-700 px-8 flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-red-600/30">
            <PhoneOff className="w-6 h-6" /> Leave
          </button>
        </div>
      )}
    </div>
  );
}
