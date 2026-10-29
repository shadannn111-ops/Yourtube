import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  Edit,
  Delete,
  Flag,
  Languages,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  userProfilePic?: string;
  commentedon: string;
  likeCount: number;
  dislikeCount: number;
  replies?: Comment[];
  isEdited?: boolean;
  parentComment?: string | null;
  language?: string;
}

// 🌐 Supported translation target languages
const TARGET_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
];

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 🌐 Translation state
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<{
    [key: string]: { text: string; lang: string; sourceLang: string };
  }>({});
  const [translationMenuOpen, setTranslationMenuOpen] = useState<string | null>(
    null
  );

  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const getUserId = () => user?._id || user?.id || null;

  useEffect(() => {
    loadComments();
  }, [videoId, sortBy]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}?sort=${sortBy}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) return toast.error("Please login first");
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: getUserId(),
        commentbody: newComment,
        usercommented: user.name || "Anonymous",
        userProfilePic: user.image || "",
      });
      if (res.data.comment) {
        toast.success("Comment posted!");
        setNewComment("");
        loadComments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post(`/comment/like/${commentId}`, {
        userId: getUserId(),
      });
      if (res.data.likeCount !== undefined) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, likeCount: res.data.likeCount } : c
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async (commentId: string) => {
    if (!user) return toast.error("Please login first");
    try {
      const res = await axiosInstance.post(`/comment/dislike/${commentId}`, {
        userId: getUserId(),
      });
      if (res.data.dislikeCount !== undefined) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, dislikeCount: res.data.dislikeCount }
              : c
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 🌐 TRANSLATE HANDLER — supports any target language
  const handleTranslate = async (
    comment: Comment,
    targetLang: string = "en"
  ) => {
    setTranslationMenuOpen(null);
    const cacheKey = `${comment._id}_${targetLang}`;

    // Toggle: agar same language mein already translated hai toh original show karo
    if (
      translatedText[comment._id] &&
      translatedText[comment._id].lang === targetLang
    ) {
      const newT = { ...translatedText };
      delete newT[comment._id];
      setTranslatedText(newT);
      return;
    }

    setTranslatingId(comment._id);

    try {
      const res = await axiosInstance.post("/comment/translate", {
        text: comment.commentbody,
        targetLanguage: targetLang,
      });

      if (res.data.success && res.data.translatedText) {
        // Agar original already target language mein tha
        if (res.data.alreadyInTargetLang) {
          toast.info(
            `Comment is already in ${
              TARGET_LANGUAGES.find((l) => l.code === targetLang)?.label ||
              targetLang
            }`
          );
          setTranslatingId(null);
          return;
        }

        setTranslatedText((prev) => ({
          ...prev,
          [comment._id]: {
            text: res.data.translatedText,
            lang: targetLang,
            sourceLang: res.data.sourceLanguage || "auto",
          },
        }));

        const sourceLangLabel =
          res.data.sourceLanguage?.toUpperCase() || "AUTO";
        const targetLangLabel =
          TARGET_LANGUAGES.find((l) => l.code === targetLang)?.label ||
          targetLang;
        toast.success(`Translated ${sourceLangLabel} → ${targetLangLabel}`);
      } else if (res.data.translationFailed) {
        toast.error("Translation service unavailable. Please try again.");
      }
    } catch (error: any) {
      console.error("Translation error:", error);
      toast.error(error.response?.data?.message || "Translation failed");
    } finally {
      setTranslatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`, {
        data: { userId: getUserId() },
      });
      if (res.data.comment) {
        toast.success("Deleted!");
        loadComments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      await axiosInstance.post(`/comment/editcomment/${editingCommentId}`, {
        commentbody: editText,
      });
      toast.success("Updated!");
      setEditingCommentId(null);
      setEditText("");
      loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user) return toast.error("Please login first");
    if (!replyText.trim()) return;
    try {
      await axiosInstance.post(`/comment/reply/${parentId}`, {
        userid: getUserId(),
        videoid: videoId,
        commentbody: replyText,
        usercommented: user.name || "Anonymous",
        userProfilePic: user.image || "",
      });
      toast.success("Reply posted!");
      setReplyingTo(null);
      setReplyText("");
      loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleReport = async (commentId: string) => {
    if (!user) return toast.error("Please login first");
    try {
      await axiosInstance.post(`/comment/report/${commentId}`, {
        reason: "spam",
      });
      toast.success("Reported");
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{comments.length} Comments</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostliked">Most Liked</option>
          <option value="relevant">Most Relevant</option>
        </select>
      </div>

      {/* Comment Input */}
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={user ? "Add a comment..." : "Sign in to comment..."}
            value={newComment}
            onChange={(e: any) => setNewComment(e.target.value)}
            disabled={!user}
            className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setNewComment("")}
              disabled={!newComment.trim()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting || !user}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const translation = translatedText[comment._id];
            return (
              <div key={comment._id} className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.userProfilePic || ""} />
                  <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.usercommented}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(comment.commentedon))} ago
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={handleUpdateComment}
                          disabled={!editText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 🌐 Translated text or original */}
                      <p className="text-sm selectable-text">
                        {translation ? translation.text : comment.commentbody}
                      </p>

                      {/* Translation indicator with "Show original" toggle */}
                      {translation && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-blue-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Translated{" "}
                            {translation.sourceLang?.toUpperCase() || "AUTO"} →{" "}
                            {TARGET_LANGUAGES.find(
                              (l) => l.code === translation.lang
                            )?.label || translation.lang}
                          </span>
                          <button
                            onClick={() =>
                              setTranslatedText((prev) => {
                                const newT = { ...prev };
                                delete newT[comment._id];
                                return newT;
                              })
                            }
                            className="text-xs text-gray-500 hover:text-gray-800 underline"
                          >
                            Show original
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500 items-center">
                    <button
                      onClick={() => handleLike(comment._id)}
                      className="flex items-center gap-1 hover:text-black"
                    >
                      <ThumbsUp className="w-4 h-4" /> {comment.likeCount || 0}
                    </button>
                    <button
                      onClick={() => handleDislike(comment._id)}
                      className="flex items-center gap-1 hover:text-black"
                    >
                      <ThumbsDown className="w-4 h-4" />{" "}
                      {comment.dislikeCount || 0}
                    </button>
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment._id ? null : comment._id
                        )
                      }
                      className="flex items-center gap-1 hover:text-black"
                    >
                      <Reply className="w-4 h-4" /> Reply
                    </button>

                    {/* 🌐 Translate button with language dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setTranslationMenuOpen(
                            translationMenuOpen === comment._id
                              ? null
                              : comment._id
                          )
                        }
                        disabled={translatingId === comment._id}
                        className="flex items-center gap-1 hover:text-blue-600 disabled:opacity-50"
                      >
                        <Languages className="w-4 h-4" />
                        {translatingId === comment._id
                          ? "Translating..."
                          : translation
                          ? "Change Language"
                          : "Translate"}
                      </button>

                      {/* Language dropdown */}
                      {translationMenuOpen === comment._id && (
                        <div className="absolute bottom-full mb-2 left-0 bg-popover border rounded-lg shadow-lg z-50 w-48 max-h-64 overflow-y-auto">
                          <div className="p-2 text-xs font-semibold text-gray-500 border-b">
                            Translate to:
                          </div>
                          {TARGET_LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() =>
                                handleTranslate(comment, lang.code)
                              }
                              className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                                translation?.lang === lang.code
                                  ? "text-blue-600 font-medium"
                                  : ""
                              }`}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {comment.userid === getUserId() && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditText(comment.commentbody);
                          }}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="flex items-center gap-1 hover:text-red-500"
                        >
                          <Delete className="w-4 h-4" /> Delete
                        </button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:text-black">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleReport(comment._id)}
                        >
                          <Flag className="w-4 h-4 mr-2" /> Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Reply Box */}
                  {replyingTo === comment._id && (
                    <div className="flex gap-2 mt-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback>
                          {user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder={`Reply to @${comment.usercommented}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleReply(comment._id)}
                            disabled={!replyText.trim()}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3 ml-4">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={reply.userProfilePic || ""} />
                            <AvatarFallback>
                              {reply.usercommented[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">
                                {reply.usercommented}
                              </span>
                              <span className="text-xs text-gray-600">
                                {formatDistanceToNow(
                                  new Date(reply.commentedon)
                                )}{" "}
                                ago
                              </span>
                            </div>
                            <p className="text-sm selectable-text">{reply.commentbody}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Comments;
