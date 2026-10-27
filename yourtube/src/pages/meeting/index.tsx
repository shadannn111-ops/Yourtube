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
      const res = await axiosInstance.post("/meeting/create", { userId: user._id, title: title || "Video Call", maxParticipants, duration });
      if (res.data.success) { toast.success("Meeting created!"); router.push("/meeting/" + res.data.meeting.roomId); }
    } catch (error) { toast.error("Failed to create meeting"); } finally { setLoading(false); }
  };

  const handleJoinMeeting = () => {
    if (!roomId.trim()) { toast.error("Please enter room ID"); return; }
    router.push("/meeting/" + roomId.toUpperCase());
  };

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id); setCopiedId(id); toast.success("Room ID copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg"><Video className="w-8 h-8 text-white" /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Video Meetings</h1>
            <p className="text-gray-500 font-medium mt-1">Connect with anyone, anywhere, anytime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"><Plus className="w-6 h-6 text-red-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Create Meeting</h2>
            </div>
            <div className="space-y-5">
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">Meeting Title</label><Input placeholder="e.g., Team Standup" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-red-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Users className="w-4 h-4" />Max Participants</label><Input type="number" min={2} max={50} value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl" /></div>
                <div><label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Clock className="w-4 h-4" />Duration (min)</label><Input type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl" /></div>
              </div>
              <Button onClick={handleCreateMeeting} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all">{loading ? "Creating..." : "Create New Meeting"}</Button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><LogIn className="w-6 h-6 text-blue-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Join Meeting</h2>
            </div>
            <div className="space-y-5">
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">Room ID</label><Input placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} className="bg-gray-50 border-gray-200 text-gray-900 font-mono text-lg h-12 rounded-xl focus:border-blue-500" /></div>
              <Button onClick={handleJoinMeeting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all">Join Meeting</Button>
              <p className="text-xs text-gray-500 text-center font-medium">Ask the host for the Room ID to join</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
