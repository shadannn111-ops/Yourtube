import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Camera, Pencil } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

const ChannelHeader = ({ channel, user, onUpdate }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login } = useUser();

  // ✅ Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(channel?.channelname || channel?.name || "");
  const [editDesc, setEditDesc] = useState(channel?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const displayName = channel?.channelname || channel?.name || channel?.email || "User";
  const initialChar = displayName.charAt(0).toUpperCase() || "U";
  const isOwnChannel = user && channel && (user._id === channel._id || user.id === channel._id);

  useEffect(() => {
    if (channel?._id) {
      axiosInstance.get(`/subscribe/count/${channel._id}`).then(res => setSubscriberCount(res.data.count)).catch(err => console.log(err));
    }
  }, [channel?._id]);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be less than 5MB");

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await axiosInstance.patch(`/user/update/${channel._id}`, { image: base64 });
        if (res.data) {
          toast.success("Profile picture updated!");
          if (login) login(res.data);
          if (onUpdate) onUpdate();
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) { toast.error("Failed to upload"); setUploading(false); }
  };

  // ✅ Save Channel Details
  const handleSaveDetails = async () => {
    if (!editName.trim()) return toast.error("Channel name cannot be empty");
    setIsSaving(true);
    try {
      const res = await axiosInstance.patch(`/user/update/${channel._id}`, {
        channelname: editName,
        description: editDesc
      });
      if (res.data) {
        toast.success("Channel details updated!");
        if (login) login(res.data);
        if (onUpdate) onUpdate();
        setIsEditModalOpen(false);
      }
    } catch (error) { toast.error("Failed to update details"); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="w-full">
      <div className="relative h-32 md:h-48 lg:h-56 bg-gradient-to-r from-red-600 via-red-500 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative -mt-16 md:-mt-20">
            <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background shadow-lg">
              <AvatarImage src={channel?.image || ""} />
              <AvatarFallback className="text-4xl bg-gray-200">{initialChar}</AvatarFallback>
            </Avatar>
            {isOwnChannel && (
              <>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 border-2 border-background rounded-full p-2 shadow-lg hover:bg-gray-100 transition disabled:opacity-50" title="Change profile picture">
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
              </>
            )}
          </div>

          <div className="flex-1 space-y-2 mt-4 md:mt-0">
            <h1 className="text-2xl md:text-4xl font-bold">{displayName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>@{displayName.toLowerCase().replace(/\s+/g, "")}</span>
            </div>
            {channel?.description && <p className="text-sm text-gray-700 max-w-2xl">{channel?.description}</p>}
            <div className="flex gap-4 text-sm text-gray-600 pt-1">
              <span><strong>{subscriberCount}</strong> subscribers</span>
              <span><strong>0</strong> videos</span>
            </div>
          </div>

          {isOwnChannel ? (
            <div className="flex gap-2 mt-4 md:mt-0">
              {/* ✅ Edit Button */}
              <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="gap-2">
                <Pencil className="w-4 h-4" /> Edit Channel
              </Button>
            </div>
          ) : (
            user && (
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button onClick={() => setIsSubscribed(!isSubscribed)} variant={isSubscribed ? "outline" : "default"} className={isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700"}>
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ✅ Professional Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Channel Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. YourTube Official" />
            </div>
            <div className="space-y-2">
              <Label>Description / About</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Tell viewers about your channel..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveDetails} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelHeader;
