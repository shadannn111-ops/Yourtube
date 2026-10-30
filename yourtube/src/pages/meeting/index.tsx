import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";

export default function MeetingRoom() {
  const router = useRouter();
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);

  // ✅ Router Ready check
  useEffect(() => {
    if (router.isReady) {
      // Page is ready, roomId is available
    }
  }, [router.isReady]);

  const roomId = router.query.roomId as string;

  const userName = user?.name || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsVideoOn(true);
      setIsAudioOn(true);
      setJoined(true);
      toast.success("Camera connected!");
    } catch (error) { toast.error("Camera access denied."); }
  };

  const toggleVideo = () => { if (stream) { const v = stream.getVideoTracks()[0]; v.enabled = !v.enabled; setIsVideoOn(v.enabled); } };
  const toggleAudio = () => { if (stream) { const a = stream.getAudioTracks()[0]; a.enabled = !a.enabled; setIsAudioOn(a.enabled); } };
  const leaveMeeting = () => { if (stream) stream.getTracks().forEach((t) => t.stop()); router.push("/meeting"); };
  
  const copyRoomId = () => { navigator.clipboard.writeText(roomId); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000); };

  // ✅ Loading Screen until router is ready
  if (!router.isReady) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-red-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center shadow-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Video className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-base font-bold">Meeting Room</h1>
            <p className="text-xs text-gray-400">Room ID: {roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyRoomId} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm font-medium">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} Copy ID
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative flex items-center justify-center">
          {!joined ? (
            <div className="text-center p-8 bg-gray-800 rounded-2xl max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"><Video className="w-10 h-10 text-gray-400" /></div>
              <h3 className="text-xl font-bold mb-2 text-white">Ready to join?</h3>
              <Button onClick={startCamera} className="bg-red-600 text-white px-8 py-6 text-lg rounded-full shadow-lg">Join Now</Button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-5xl font-bold border-4 border-gray-700">{userInitial}</div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />{userName}{!isAudioOn && <MicOff className="w-4 h-4 text-red-500" />}
              </div>
            </>
          )}
        </div>
      </div>

      {joined && (
        <div className="bg-gray-800 p-4 md:p-6 flex justify-center gap-4 border-t border-gray-700">
          <button onClick={toggleAudio} className={`p-4 rounded-full ${isAudioOn ? "bg-gray-700" : "bg-red-600"}`}>{isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}</button>
          <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOn ? "bg-gray-700" : "bg-red-600"}`}>{isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}</button>
          <button onClick={leaveMeeting} className="p-4 rounded-full bg-red-600 px-8 flex items-center gap-2 font-bold"><PhoneOff className="w-6 h-6" /> Leave</button>
        </div>
      )}
    </div>
  );
}