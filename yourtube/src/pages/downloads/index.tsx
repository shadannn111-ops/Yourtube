import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Download, Trash2, PlaySquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DownloadsPage = () => {
  const { user } = useUser();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user]);

  const fetchData = async () => {
    try {
      const historyRes = await axios.get(`http://localhost:5000/download/history/${user._id}`);
      const videosRes = await axios.get("http://localhost:5000/video/getall");
      const allVideos = videosRes.data;

      const mergedData = historyRes.data.map((dl: any) => {
        const videoDetails = allVideos.find((v: any) => v._id === dl.videoId);
        return { ...dl, filepath: videoDetails?.filepath || "" };
      });

      setDownloads(mergedData);
    } catch (error) { console.log(error); } 
    finally { setLoading(false); }
  };

  // ✅ FIXED: Ab API call hoga delete karne pe
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/download/delete/${id}`);
      setDownloads(downloads.filter(d => d._id !== id));
      toast.success("Removed from downloads");
    } catch (error) { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6"><div className="max-w-4xl mx-auto text-center py-12"><Download className="w-16 h-16 mx-auto text-gray-400 mb-4" /><p className="text-gray-600">Sign in to see your downloads</p></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Downloads</h1>
        <div className="space-y-4">
          {downloads.length === 0 ? (
            <div className="text-center py-12"><Download className="w-16 h-16 mx-auto text-gray-400 mb-4" /><p className="text-gray-600">No downloads yet</p></div>
          ) : (
            downloads.map((download) => {
              const cleanPath = download.filepath?.replace(/\\/g, "/");
              const videoUrl = cleanPath?.startsWith("http") ? cleanPath : `http://localhost:5000/${cleanPath}`;
              return (
                <div key={download._id} className="flex items-center gap-4 bg-white rounded-lg p-4 border hover:shadow-sm transition">
                  <Link href={`/watch/${download.videoId}`} className="w-32 aspect-video bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer">
                    {download.filepath ? (
                      <video src={`${videoUrl}#t=1`} className="object-cover w-full h-full pointer-events-none" preload="metadata" muted playsInline />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400"><PlaySquare className="w-6 h-6" /></div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/watch/${download.videoId}`}><h3 className="font-medium text-lg truncate hover:text-blue-600 cursor-pointer">{download.videoTitle}</h3></Link>
                    <p className="text-sm text-gray-600 mt-1">{new Date(download.downloadDate).toLocaleDateString()} • {download.subscriptionPlanUsed} plan</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(download._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-5 h-5" /></Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
