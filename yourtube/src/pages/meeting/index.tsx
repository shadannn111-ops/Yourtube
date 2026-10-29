import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Users, Shield, Settings } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // ✅ Meeting Details Fetch
  useEffect(() => {
    if (!roomId) return;
    const fetchMeeting = async () => {
      try {
        const res = await axiosInstance.get(`/meeting/${roomId}`);
        setMeeting(res.data);
      } catch (error) { console.log(error); } 
      finally { setLoading(false); }
    };
    fetchMeeting();
  }, [roomId]);

  // ✅ Camera & Mic Start (Permission check)
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsVideoOn(true);
      setIsAudioOn(true);
      setPermissionGranted(true);
      toast.success("Camera and Mic connected!");
    } catch (error) {
      toast.error("Camera/Mic access denied. Please allow permissions.");
      setPermissionGranted(false);
    }
  };

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
        <p className="text-lg font-medium">Joining meeting...</p>
      </div>
    </div>
  );

  if (!roomId) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  // ✅ Zoom-Style Main Interface
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      
      {/* ✅ Top Bar */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center shadow-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Video className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-base font-bold">{meeting?.title || "Meeting Room"}</h1>
            <p className="text-xs text-gray-400">Room: {roomId} • Host: {meeting?.host?.name || "Unknown"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-1 border border-green-500/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-400">Live</span>
          </div>
          <button onClick={copyRoomId} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} Copy ID
          </button>
        </div>
      </div>

      {/* ✅ Main Video Grid */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="grid grid-cols-1 gap-4 w-full max-w-6xl h-full max-h-[75vh]">
          
          {/* Main Video (Your Camera) */}
          <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700 flex items-center justify-center">
            {!permissionGranted ? (
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to join?</h3>
                <p className="text-gray-400 mb-6 text-sm">Click the button below to enable camera and mic.</p>
                <Button onClick={startCamera} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                  Join Now
                </Button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }} // ✅ Mirror effect (like Zoom)
                />
                
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-5xl font-bold shadow-xl border-4 border-gray-700">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-sm border border-white/10">
                  <Shield className="w-4 h-4 text-red-500" />
                  {user?.name || "You"} (Host)
                  {!isAudioOn && <MicOff className="w-4 h-4 text-red-500" />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Controls Bar */}
      <div className="bg-gray-800 p-4 md:p-6 flex justify-center gap-4 shadow-inner border-t border-gray-700">
        <button 
          onClick={toggleAudio} 
          disabled={!permissionGranted}
          className={`p-4 rounded-full transition-all active:scale-95 shadow-lg disabled:opacity-50 ${isAudioOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}
          title={isAudioOn ? "Mute" : "Unmute"}
        >
          {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          disabled={!permissionGranted}
          className={`p-4 rounded-full transition-all active:scale-95 shadow-lg disabled:opacity-50 ${isVideoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}
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