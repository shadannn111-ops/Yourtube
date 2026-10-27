import { useRouter } from "next/router";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";
import { Youtube, Loader2 } from "lucide-react";

const Channeldialogue = ({ isopen, onclose, channeldata, mode }: any) => {
  const { user, login } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setisSubmitting] = useState(false);

  useEffect(() => {
    if (channeldata && mode === "edit") {
      setFormData({
        name: channeldata.name || "",
        description: channeldata.description || "",
      });
    } else {
      setFormData({
        name: user?.name || "",
        description: "",
      });
    }
  }, [channeldata, user, mode, isopen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlesubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Channel name is required");
      return;
    }
    setisSubmitting(true);
    
    const payload = {
      channelname: formData.name,
      description: formData.description,
    };
    
    try {
      const response = await axiosInstance.patch(`/user/update/${user._id}`, payload);
      login(response?.data);
      toast.success(mode === "create" ? "Channel created successfully! 🎉" : "Channel updated!");
      router.push(`/channel/${user?._id}`);
      setFormData({ name: "", description: "" });
      onclose();
    } catch (error) {
      toast.error("Failed to save channel details");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <Dialog open={isopen} onOpenChange={onclose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl shadow-2xl border-0 p-0 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* ✅ Premium Header with Gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {mode === "create" ? "Create Your Channel" : "Edit Channel"}
              </DialogTitle>
              <DialogDescription className="text-red-100 text-sm mt-1">
                {mode === "create" ? "Start sharing your videos with the world." : "Update your channel details."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handlesubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-semibold">Channel Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., YourTube Official"
              className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500 transition-all text-base"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-semibold">Channel Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell viewers about your channel..."
              className="bg-gray-50 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500 transition-all text-base resize-none"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onclose}
              className="w-full sm:w-1/2 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-1/2 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
              ) : mode === "create" ? "Create Channel" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Channeldialogue;
