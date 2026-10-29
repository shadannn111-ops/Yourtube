import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, Reply, MoreHorizontal, Edit, Delete, Flag, Languages, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const TARGET_LANGUAGES = [
  { code: "en", label: "English" }, { code: "hi", label: "Hindi" }, { code: "ur", label: "Urdu" },
  { code: "es", label: "Spanish" }, { code: "fr", label: "French" }, { code: "de", label: "German" },
];

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const getUserId = () => user?._id || user?.id || null;

  useEffect(() => { loadComments(); }, [videoId, sortBy]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}?sort=${sortBy}`);
      setComments(res.data);
    } catch (error) { console.log(error); } finally { setLoading(false); }
  };

  const handleSubmitComment = async () => {
    if (!user) return toast.error("Please login first");
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId, userid: getUserId(), commentbody: newComment, usercommented: user.name || "Anonymous", userProfilePic: user.image || "",
      });
      if (res.data.comment) { toast.success("Comment posted!"); setNewComment(""); loadComments(); }
    } catch (error: any) { toast.error(error.response?.data?.message || "Error"); } 
    finally { setIsSubmitting(false); }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post(`/comment/like/${commentId}`, { userId: getUserId() });
      if (res.data.likeCount !== undefined) { setComments((prev) => prev.map((c) => c._id === commentId ? { ...c, likeCount: res.data.likeCount } : c)); }
    } catch (error) { console.log(error); }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{comments.length} Comments</h2>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-300 rounded-full px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer font-medium text-gray-700">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="mostliked">Most Liked</option>
        </select>
      </div>

      {/* ✅ Premium Comment Input Box */}
      <div className="flex gap-4 items-start">
        <Avatar className="w-10 h-10 mt-1"><AvatarImage src={user?.image || ""} /><AvatarFallback className="bg-red-100 text-red-700 font-bold">{user?.name?.[0] || "U"}</AvatarFallback></Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={user ? "Add a comment..." : "Sign in to comment..."}
            value={newComment}
            onChange={(e: any) => setNewComment(e.target.value)}
            disabled={!user}
            className="min-h-[60px] resize-none border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-gray-900 transition-colors px-0 text-base"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" className="rounded-full font-medium" onClick={() => setNewComment("")} disabled={!newComment.trim()}>Cancel</Button>
            <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting || !user} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-md">
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Comments List with Hover Effects */}
      <div className="space-y-6 mt-6">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <Avatar className="w-10 h-10 mt-1"><AvatarImage src={comment.userProfilePic || ""} /><AvatarFallback className="bg-gray-200 text-gray-700 font-bold">{comment.usercommented[0]}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900">{comment.usercommented}</span>
                  <span className="text-xs text-gray-500 font-medium">{formatDistanceToNow(new Date(comment.commentedon))} ago</span>
                </div>
                
                <p className="text-sm text-gray-800 leading-relaxed mb-2 selectable-text">{comment.commentbody}</p>
                
                {/* ✅ Comment Action Buttons */}
                <div className="flex gap-4 mt-2 text-xs font-medium text-gray-500 items-center">
                  <button onClick={() => handleLike(comment._id)} className="flex items-center gap-1 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-full transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {comment.likeCount || 0}
                  </button>
                  <button onClick={() => handleDislike(comment._id)} className="flex items-center gap-1 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-full transition-colors">
                    <ThumbsDown className="w-4 h-4" /> {comment.dislikeCount || 0}
                  </button>
                  <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} className="flex items-center gap-1 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-full transition-colors font-bold">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
