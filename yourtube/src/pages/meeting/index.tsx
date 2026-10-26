import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Plus, LogIn, Users, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingHome() {
  const { user } = useUser();
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [duration, setDuration] = useState(60);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { if (user) fetchMeetings(); }, [user]);

  const fetchMeetings = async () => {
    try {
      const res = await axiosInstance.get(`/meeting/user/${user._id}`);
      setMeetings(res.data);
    } catch (error) { console.log(error); }
  };

  const handleCreateMeeting = async () => {
    if (!user) { toast.error("Please login first"); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/meeting/create", {
        userId: user._id, title: title || "Video Call", maxParticipants, duration,
      });
      if (res.data.success) { toast.success("Meeting created!"); router.push("/meeting/" + res.data.meeting.roomId); }
    } catch (error) { toast.error("Failed to create meeting"); } 
    finally { setLoading(false); }
  };

  const handleJoinMeeting = () => {
    if (!roomId.trim()) { toast.error("Please enter room ID"); return; }
    router.push("/meeting/" + roomId.toUpperCase());
  };

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Room ID copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Video className="w-20 h-20 mx-auto text-red-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Video Meetings</h2>
          <p className="text-gray-500 mb-8">Sign in to create or join video meetings</p>
          <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg text-white">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-md">
            <Video className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Video Meetings</h1>
            <p className="text-gray-500 text-sm md:text-base">Connect with anyone, anywhere, anytime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-sm"><Plus className="w-6 h-6 text-white" /></div>
              <h2 className="text-2xl font-semibold text-gray-900">Create Meeting</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Meeting Title</label>
                <Input placeholder="e.g., Team Standup" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white border-gray-300 text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Users className="w-4 h-4" />Max Participants</label>
                  <Input type="number" min={2} max={50} value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} className="bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Clock className="w-4 h-4" />Duration (min)</label>
                  <Input type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="bg-white border-gray-300 text-gray-900" />
                </div>
              </div>
              <Button onClick={handleCreateMeeting} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg font-semibold text-white">
                {loading ? "Creating..." : "Create New Meeting"}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm"><LogIn className="w-6 h-6 text-white" /></div>
              <h2 className="text-2xl font-semibold text-gray-900">Join Meeting</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Room ID</label>
                <Input placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} className="bg-white border-gray-300 text-gray-900 font-mono text-lg" />
              </div>
              <Button onClick={handleJoinMeeting} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold text-white">Join Meeting</Button>
              <p className="text-xs text-gray-500 text-center">Ask the host for the Room ID to join</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Recent Meetings</h2>
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No meetings yet. Create your first meeting!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-red-400 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">Host: {meeting.host?.name || "Unknown"}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${meeting.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{meeting.status}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
                    <span className="font-mono text-sm text-gray-700">{meeting.roomId}</span>
                    <button onClick={() => copyRoomId(meeting.roomId)} className="text-gray-400 hover:text-gray-700">
                      {copiedId === meeting.roomId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{new Date(meeting.createdAt).toLocaleString()}</p>
                    {meeting.status === "active" && (
                      <Button size="sm" onClick={() => router.push("/meeting/" + meeting.roomId)} className="bg-red-600 hover:bg-red-700">Rejoin</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
