import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Loader2, Shield, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import { io } from "socket.io-client";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingRoom() {
  const router = useRouter();
  const { user } = useUser();
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [roomId, setRoomId] = useState<string>("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [peerConnected, setPeerConnected] = useState(false);

  // ✅ Socket Connection Setup (Render URL direct)
  const SOCKET_URL = "https://yourtube-backend-4g40.onrender.com";

  useEffect(() => {
    const storedRoom = localStorage.getItem("activeMeetingRoom");
    if (storedRoom) { setRoomId(storedRoom); setLoading(false); } 
    else { createNewRoom(); }
  }, []);

  const createNewRoom = async () => {
    if (!user) { router.push("/login"); return; }
    try {
      const res = await axiosInstance.post("/meeting/create", { userId: user._id || user.id, title: "Instant Meeting", password: "default", maxParticipants: 10, duration: 60 });
      if (res.data.success) { localStorage.setItem("activeMeetingRoom", res.data.meeting.roomId); setRoomId(res.data.meeting.roomId); }
    } catch (error) { router.push("/meeting"); } finally { setLoading(false); }
  };

  const startCall = async () => {
    try {
      // 1. Camera & Mic On
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (userVideoRef.current) userVideoRef.current.srcObject = stream;
      setInCall(true);

      // 2. Socket Connect
      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit("join-room", roomId);

      // 3. Peer Connection Setup (WebRTC)
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 4. Peer Track Receive (Dusre ka video)
      pc.ontrack = (event) => {
        if (peerVideoRef.current) peerVideoRef.current.srcObject = event.streams[0];
        setPeerConnected(true);
      };

      // 5. Ice Candidate
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", { target: socketRef.current.id, candidate: event.candidate });
        }
      };

      // 6. Socket Events
      socketRef.current.on("user-joined", async (peerId: string) => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit("offer", { target: peerId, caller: socketRef.current.id, sdp: pc.localDescription });
      });

      socketRef.current.on("offer", async (payload: any) => {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("answer", { target: payload.caller, sdp: pc.localDescription });
      });

      socketRef.current.on("answer", async (payload: any) => {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      });

      socketRef.current.on("ice-candidate", async (candidate: any) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { console.log(e); }
      });

    } catch (error) {
      toast.error("Camera/Mic access denied.");
    }
  };

  const toggleVideo = () => { if (localStreamRef.current) { const v = localStreamRef.current.getVideoTracks()[0]; v.enabled = !v.enabled; setIsVideoOn(v.enabled); } };
  const toggleAudio = () => { if (localStreamRef.current) { const a = localStreamRef.current.getAudioTracks()[0]; a.enabled = !a.enabled; setIsAudioOn(a.enabled); } };
  
  const leaveMeeting = () => { 
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop()); 
    if (socketRef.current) socketRef.current.disconnect();
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    localStorage.removeItem("activeMeetingRoom");
    router.push("/meeting"); 
  };

  const copyInviteLink = () => { 
    if (!roomId) return;
    navigator.clipboard.writeText(roomId); 
    setCopied(true); 
    toast.success("Room ID Copied!"); 
    setTimeout(() => setCopied(false), 2000); 
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-red-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Video className="w-5 h-5" /></div>
          <div>
            <h1 className="text-base font-bold">Meeting Room</h1>
            <p className="text-xs text-gray-400">Room ID: {roomId}</p>
          </div>
        </div>
        <button onClick={copyInviteLink} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm font-medium">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} Copy ID
        </button>
      </div>

      <div className="flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Video */}
        <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-700 h-full min-h-[300px]">
          {!inCall ? (
            <div className="flex items-center justify-center h-full">
              <Button onClick={startCall} className="bg-red-600 px-8 py-6 text-lg rounded-full">Join Call</Button>
            </div>
          ) : (
            <>
              <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg text-xs">{user?.name || "You"}</div>
            </>
          )}
        </div>

        {/* Peer Video */}
        <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-700 h-full min-h-[300px] flex items-center justify-center">
          {peerConnected ? (
            <video ref={peerVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-center">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Waiting for peer...</p>
              <p className="text-xs mt-1">Share Room ID: {roomId}</p>
            </div>
          )}
        </div>
      </div>

      {inCall && (
        <div className="bg-gray-800 p-4 flex justify-center gap-4 border-t border-gray-700">
          <button onClick={toggleAudio} className={`p-4 rounded-full ${isAudioOn ? "bg-gray-700" : "bg-red-600"}`}>{isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}</button>
          <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOn ? "bg-gray-700" : "bg-red-600"}`}>{isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}</button>
          <button onClick={leaveMeeting} className="p-4 rounded-full bg-red-600 px-8 flex items-center gap-2 font-bold"><PhoneOff className="w-6 h-6" /> Leave</button>
        </div>
      )}
    </div>
  );
}
