import React, { useState } from "react";
import { Button } from "./ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const tabs = [
  { id: "home", label: "Home" },
  { id: "videos", label: "Videos" },
  { id: "shorts", label: "Shorts" },
  { id: "playlists", label: "Playlists" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" },
];

const Channeltabs = ({ channelId, channelData }: any) => {
  const [activeTab, setActiveTab] = useState("about");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user, logout } = useUser();
  const router = useRouter();

  const isOwnChannel = user && (user._id === channelId || user.id === channelId);

  const handleDeleteChannel = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/user/delete/${user._id}`);
      toast.success("Channel deleted successfully");
      logout();
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete channel");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="border-b px-4">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`px-0 py-4 border-b-2 rounded-none ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {activeTab === "about" && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-sm text-gray-700">
                {channelData?.description || "No description available"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Channel Details</h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li><strong>Name:</strong> {channelData?.channelname || channelData?.name || "Unknown"}</li>
                <li><strong>Email:</strong> {channelData?.email || "N/A"}</li>
                <li><strong>Joined:</strong> {channelData?.joinedon ? new Date(channelData.joinedon).toLocaleDateString() : "N/A"}</li>
                <li><strong>Plan:</strong> {channelData?.subscriptionPlan || "free"}</li>
              </ul>
            </div>

            {isOwnChannel && (
              <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-8">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your channel, all your videos, comments, and subscriptions will be permanently deleted. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Channel
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "home" && <div className="text-center py-12 text-gray-500"><p>Home feed coming soon</p></div>}
        {activeTab === "videos" && <div className="text-center py-12 text-gray-500"><p>Videos are shown above</p></div>}
        {activeTab === "shorts" && <div className="text-center py-12 text-gray-500"><p>No shorts yet</p></div>}
        {activeTab === "playlists" && <div className="text-center py-12 text-gray-500"><p>No playlists yet</p></div>}
        {activeTab === "community" && <div className="text-center py-12 text-gray-500"><p>Community posts coming soon</p></div>}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Channel?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your channel, videos, comments, likes, and subscriptions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Yes, Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Channeltabs;
