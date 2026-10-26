import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Plus, LogIn, Users, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (user) fetchMeetings();
  }, [user]);

  const fetchMeetings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/meeting/user/" + user._id);
      setMeetings(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateMeeting = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/meeting/create", {
        userId: user._id,
        title: title || "Video Call",
        maxParticipants,
        duration,
      });
      if (res.data.success) {
        toast.success("Meeting created!");
        router.push("/meeting/" + res.data.meeting.roomId);
      }
    } catch (error) {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = () => {
    if (!roomId.trim()) {
      toast.error("Please enter room ID");
      return;
    }
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
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <Video className="w-20 h-20 mx-auto text-gray-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Video Meetings</h2>
          <p className="text-gray-400 mb-8">Sign in to create or join video meetings</p>
          <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Video Meetings</h1>
            <p className="text-gray-400">Connect with anyone, anywhere, anytime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold">Create Meeting</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Meeting Title</label>
                <Input placeholder="e.g., Team Standup" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 flex items-center gap-1"><Users className="w-3 h-3" />Max Participants</label>
                  <Input type="number" min={2} max={50} value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" />Duration (min)</label>
                  <Input type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>
              <Button onClick={handleCreateMeeting} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg font-semibold">
                {loading ? "Creating..." : "Create New Meeting"}
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold">Join Meeting</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Room ID</label>
                <Input placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} className="bg-gray-800 border-gray-700 text-white font-mono text-lg" />
              </div>
              <Button onClick={handleJoinMeeting} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold">
                Join Meeting
              </Button>
              <p className="text-xs text-gray-500 text-center">Ask the host for the Room ID to join</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Recent Meetings</h2>
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">No meetings yet. Create your first meeting!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-red-600 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <p className="text-sm text-gray-400">Host: {meeting.host?.name || "Unknown"}</p>
                    </div>
                    <span className={"text-xs px-2 py-1 rounded-full " + (meeting.status === "active" ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-400")}>{meeting.status}</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2 mb-3">
                    <span className="font-mono text-sm text-gray-300">{meeting.roomId}</span>
                    <button onClick={() => copyRoomId(meeting.roomId)} className="text-gray-400 hover:text-white">
                      {copiedId === meeting.roomId ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{new Date(meeting.createdAt).toLocaleString()}</p>
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