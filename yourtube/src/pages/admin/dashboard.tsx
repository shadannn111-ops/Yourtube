import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Clock, Crown, Upload, LogOut, RefreshCw, Trash2, PlaySquare, AlertTriangle, Image as ImageIcon, Pencil } from "lucide-react";
import { useRouter } from "next/router";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = ["Music", "Gaming", "Movies", "News", "Sports", "Technology", "Comedy", "Education", "Science", "Travel", "Food", "Fashion", "Nature"];

// ✅ UPDATED SMART THUMBNAIL (Force HTTPS & Fix Black Box)
function SmartThumbnail({ video }: { video: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumb, setThumb] = useState<string>(video.thumbnail || "");

  // Force HTTPS fix
  let videoUrl = video?.filepath || "";
  if (videoUrl.startsWith("http://")) {
    videoUrl = videoUrl.replace("http://", "https://");
  }

  const generateThumb = () => {
    const v = videoRef.current; 
    const c = canvasRef.current;
    if (!v || !c) return;
    try {
      c.width = v.videoWidth; 
      c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (ctx) { 
        ctx.drawImage(v, 0, 0, c.width, c.height); 
        setThumb(c.toDataURL("image/jpeg", 0.7)); 
      }
    } catch (e) { 
      console.log("Thumb generation error:", e); 
    }
  };

  return (
    <div className="relative w-28 sm:w-32 aspect-video bg-gray-100 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
      {thumb ? (
        <img src={thumb} alt="thumb" className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <PlaySquare className="w-6 h-6 animate-pulse" />
        </div>
      )}
      {/* ✅ Hidden video to extract frame */}
      <video 
        ref={videoRef} 
        src={videoUrl} 
        className="hidden" 
        muted 
        preload="metadata" 
        crossOrigin="anonymous" 
        onLoadedData={() => { if (videoRef.current) videoRef.current.currentTime = 1; }} 
        onSeeked={generateThumb} 
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [videos, setVideos] = useState([]);
  
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("Music");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) { router.push("/admin/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, historyRes, subsRes, videosRes] = await Promise.all([
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/login-history"),
        axiosInstance.get("/admin/subscriptions"),
        axiosInstance.get("/video/getall")
      ]);
      setUsers(usersRes.data); setLoginHistory(historyRes.data); setSubscriptions(subsRes.data); setVideos(videosRes.data);
    } catch (error) { console.log(error); } finally { setLoading(false); }
  };

  const confirmDelete = (video: any) => { setVideoToDelete(video); setDeleteModalOpen(true); };
  const executeDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/video/delete/${videoToDelete._id}`);
      toast.success("Video deleted successfully"); fetchData(); setDeleteModalOpen(false);
    } catch (error) { toast.error("Failed to delete video"); } finally { setIsDeleting(false); setVideoToDelete(null); }
  };

  const openEditModal = (video: any) => {
    setVideoToEdit(video); setEditTitle(video.videotitle); setEditCategory(video.category || "Music"); setEditModalOpen(true);
  };

  const handleUpdateVideo = async () => {
    if (!editTitle) { toast.error("Title cannot be empty"); return; }
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/admin/update-video/${videoToEdit._id}`, { videotitle: editTitle, category: editCategory });
      toast.success("Video updated successfully"); fetchData(); setEditModalOpen(false);
    } catch (error) { toast.error("Failed to update video"); } finally { setIsUpdating(false); }
  };

  const handleUpload = async () => {
    if (!videoTitle || !videoFile) { toast.error("Please provide title and video file"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile); formData.append("videotitle", videoTitle); formData.append("category", videoCategory); formData.append("videochanel", "YourTube Official");
      
      if (thumbnailFile) {
        const reader = new FileReader();
        reader.onloadend = async () => { formData.append("thumbnail", reader.result as string); await sendUploadRequest(formData); };
        reader.readAsDataURL(thumbnailFile);
      } else { await sendUploadRequest(formData); }
    } catch (error) { toast.error("Failed to upload video"); setUploading(false); }
  };

  const sendUploadRequest = async (formData: FormData) => {
    try {
      const res = await axiosInstance.post("/admin/upload-video", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data) { toast.success("Video uploaded successfully!"); setVideoTitle(""); setVideoFile(null); setThumbnailFile(null); setVideoCategory("Music"); fetchData(); }
    } catch (error) { toast.error("Failed to upload video"); } finally { setUploading(false); }
  };

  const handleLogout = () => { localStorage.removeItem("adminToken"); localStorage.removeItem("adminUser"); router.push("/admin/login"); };

  if (loading) return <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center"><RefreshCw className="animate-spin w-8 h-8 text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-red-600 p-1.5 md:p-2 rounded-lg"><Crown className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-wide">Admin Dashboard</h1>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} className="border-gray-300 text-gray-700 hover:text-black hover:bg-gray-100"><RefreshCw className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Refresh</span></Button>
          <Button variant="destructive" size="sm" onClick={handleLogout} className="bg-red-600 hover:bg-red-700"><LogOut className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Logout</span></Button>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex items-center gap-4 hover:shadow-md transition"><div className="bg-blue-100 p-3 md:p-4 rounded-xl"><Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" /></div><div><p className="text-xs md:text-sm font-medium text-gray-500">Total Users</p><p className="text-xl md:text-3xl font-bold text-gray-900">{users.length}</p></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex items-center gap-4 hover:shadow-md transition"><div className="bg-green-100 p-3 md:p-4 rounded-xl"><Crown className="w-6 h-6 md:w-8 md:h-8 text-green-600" /></div><div><p className="text-xs md:text-sm font-medium text-gray-500">Active Subscriptions</p><p className="text-xl md:text-3xl font-bold text-gray-900">{subscriptions.length}</p></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex items-center gap-4 hover:shadow-md transition"><div className="bg-orange-100 p-3 md:p-4 rounded-xl"><Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-600" /></div><div><p className="text-xs md:text-sm font-medium text-gray-500">Login Activities</p><p className="text-xl md:text-3xl font-bold text-gray-900">{loginHistory.length}</p></div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-red-600" />Upload New Video</h2>
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-gray-700">Video Title</Label><Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="e.g. Top 10 Coding Tips" className="bg-white border-gray-300 text-gray-900 focus:border-red-500" /></div>
              <div className="space-y-2"><Label className="text-gray-700">Category</Label><select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:border-red-500 outline-none" value={videoCategory} onChange={(e) => setVideoCategory(e.target.value)}>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div className="space-y-2"><Label className="text-gray-700">Video File (MP4)</Label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative"><Input type="file" accept="video/mp4" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} /><Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">{videoFile ? videoFile.name : "Click to browse"}</p></div></div>
              <div className="space-y-2"><Label className="text-gray-700">Custom Thumbnail (Optional)</Label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative"><Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} /><ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">{thumbnailFile ? thumbnailFile.name : "Choose Image"}</p></div></div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full bg-red-600 hover:bg-red-700 text-white h-10">{uploading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : "Upload Video"}</Button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center"><h2 className="text-lg font-bold text-gray-900">Video Library</h2><span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{videos.length} Videos</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200"><tr><th className="px-4 md:px-6 py-4">Video</th><th className="px-4 md:px-6 py-4">Details</th><th className="px-4 md:px-6 py-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {videos.map((video: any) => (
                    <tr key={video._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 md:px-6 py-4"><SmartThumbnail video={video} /></td>
                      <td className="px-4 md:px-6 py-4">
                        <p className="font-semibold text-gray-900 truncate max-w-[150px] md:max-w-[200px]" title={video.videotitle}>{video.videotitle}</p>
                        <span className="inline-block bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded mt-1 font-medium">{video.category || "Uncategorized"}</span>
                        <p className="text-gray-500 text-xs mt-1">{video.views || 0} views</p>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center space-x-1 md:space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(video)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(video)} className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 border-gray-200">
          <DialogHeader><DialogTitle>Edit Video Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-gray-700">Video Title</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-white border-gray-300 text-gray-900" /></div>
            <div className="space-y-2"><Label className="text-gray-700">Category</Label><select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 text-sm" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isUpdating} className="border-gray-300 text-gray-700">Cancel</Button><Button onClick={handleUpdateVideo} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white">{isUpdating ? "Saving..." : "Save Changes"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 rounded-2xl shadow-xl border-gray-200">
          <DialogHeader className="pt-2"><div className="mx-auto bg-red-100 p-3 rounded-full mb-3 w-fit"><AlertTriangle className="w-8 h-8 text-red-600" /></div><DialogTitle className="text-center text-xl font-bold text-gray-900">Delete Video?</DialogTitle><DialogDescription className="text-center text-gray-500 pt-2">Are you sure you want to delete <br/><span className="font-semibold text-red-600">"{videoToDelete?.videotitle}"</span>? <br/>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4"><Button variant="outline" className="w-full sm:w-1/2 rounded-xl border-gray-300 text-gray-700" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>Cancel</Button><Button variant="destructive" className="w-full sm:w-1/2 rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={executeDelete} disabled={isDeleting}>{isDeleting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Yes, Delete"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
