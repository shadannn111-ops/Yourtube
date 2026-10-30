import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Video, Copy, Check, Share2, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingRoom() {
  const router = useRouter();
  const { user } = useUser();
  
  const [roomId, setRoomId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);

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

  // ✅ Invite Link Copy
  const copyInviteLink = () => { 
    if (!roomId) return;
    const inviteLink = `${window.location.origin}/meeting/join?roomId=${roomId}`;
    navigator.clipboard.writeText(inviteLink); 
    setCopied(true); 
    toast.success("Invite link copied!"); 
    setTimeout(() => setCopied(false), 2000); 
  };

  const leaveMeeting = () => { 
    localStorage.removeItem("activeMeetingRoom");
    router.push("/meeting"); 
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Preparing Meeting Room...</p>
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
            <p className="text-xs text-gray-400">Room ID: {roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyInviteLink} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} Invite
          </button>
          {inCall && (
            <button onClick={leaveMeeting} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-medium">
              <PhoneOff className="w-4 h-4" /> Leave
            </button>
          )}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 p-2 md:p-4 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative flex flex-col items-center justify-center">
          
          {!inCall ? (
            <div className="text-center p-8 bg-gray-800 rounded-2xl max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Ready to join?</h3>
              <p className="text-gray-400 mb-6 text-sm">Click the button below to join the video call.</p>
              <Button onClick={() => setInCall(true)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                Join Now
              </Button>
            </div>
          ) : (
            // ✅ Jitsi Meet iframe (Real Video Call)
            <iframe
              src={`https://meet.jit.si/yourtube-meeting-${roomId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-0"
              style={{ minHeight: "500px" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
