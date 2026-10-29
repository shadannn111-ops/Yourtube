import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Plus, LogIn, Users, Clock, Lock, Key } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosinstance";

export default function MeetingHome() {
  const { user } = useUser();
  const router = useRouter();
  
  // Create State
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [duration, setDuration] = useState(60);
  
  // Join State
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const getUserId = () => user?._id || user?.id || null;

  const handleCreate = async () => {
    const userId = getUserId();
    if (!userId) return toast.error("Please login first");
    if (!password) return toast.error("Please set a meeting password");

    setLoading(true);
    try {
      const res = await axiosInstance.post("/meeting/create", {
        userId, title: title || "Video Call", password, maxParticipants, duration,
      });
      if (res.data.success) {
        toast.success("Meeting created!");
        router.push(`/meeting/${res.data.meeting.roomId}?host=true`);
      }
    } catch (error) { toast.error("Failed to create meeting"); } 
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinRoomId || !joinPassword) return toast.error("Enter Room ID and Password");
    
    setLoading(true);
    try {
      const res = await axiosInstance.post("/meeting/join", {
        roomId: joinRoomId.toUpperCase(), password: joinPassword,
      });
      if (res.data.success) {
        toast.success("Joined meeting!");
        router.push(`/meeting/${res.data.meeting.roomId}`);
      }
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to join"); } 
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><Video className="w-10 h-10 text-red-600" /></div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Video Meetings</h2>
          <p className="text-gray-500 mb-8">Sign in to create or join video meetings</p>
          <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700 w-full py-6 text-lg rounded-xl text-white">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg"><Video className="w-8 h-8 text-white" /></div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Video Meetings</h1>
            <p className="text-gray-500 font-medium mt-1">Secure, high-quality video calls for your team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ✅ Create Meeting Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"><Plus className="w-6 h-6 text-red-600" /></div>
              <h2 className="text-2xl font-bold">Create Meeting</h2>
            </div>
            <div className="space-y-5">
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">Meeting Title</label><Input placeholder="e.g., Team Standup" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-50 border-gray-200 h-12 rounded-xl focus:border-red-500" /></div>
              
              <div><label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Lock className="w-4 h-4" />Meeting Password</label><Input type="password" placeholder="Set a secure password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border-gray-200 h-12 rounded-xl focus:border-red-500" /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Users className="w-4 h-4" />Max Participants</label><Input type="number" min={2} max={50} value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} className="bg-gray-50 border-gray-200 h-12 rounded-xl" /></div>
                <div><label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Clock className="w-4 h-4" />Duration (min)</label><Input type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="bg-gray-50 border-gray-200 h-12 rounded-xl" /></div>
              </div>
              <Button onClick={handleCreate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold rounded-xl shadow-md">{loading ? "Creating..." : "Create New Meeting"}</Button>
            </div>
          </div>

          {/* ✅ Join Meeting Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><LogIn className="w-6 h-6 text-blue-600" /></div>
              <h2 className="text-2xl font-bold">Join Meeting</h2>
            </div>
            <div className="space-y-5">
              <div><label className="text-sm font-semibold text-gray-700 mb-2 block">Room ID</label><Input placeholder="Enter Room ID" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())} className="bg-gray-50 border-gray-200 font-mono text-lg h-12 rounded-xl focus:border-blue-500" /></div>
              
              <div><label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Key className="w-4 h-4" />Password</label><Input type="password" placeholder="Enter meeting password" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} className="bg-gray-50 border-gray-200 h-12 rounded-xl focus:border-blue-500" /></div>

              <Button onClick={handleJoin} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold rounded-xl shadow-md">{loading ? "Joining..." : "Join Meeting"}</Button>
              <p className="text-xs text-gray-500 text-center font-medium">Ask the host for Room ID and Password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
