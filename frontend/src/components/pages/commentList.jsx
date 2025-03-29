import { useCallback, useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { timeDifference } from "../utils/timeDifference";
import { useSelector } from "react-redux";

const CommentsList = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const userDetails = useSelector((state) => state.logInReducer.userDetails);
  const isLoggedIn = useSelector((state) => state.logInReducer.isLoggedIn);

  const fetchComments = useCallback(async () => {
    try {
      const response = await backendCaller(`/comments/allcomment/${videoId}`);

      if (response.success) {
        setComments(() => {
          const userComment = response.data.filter((comment) => {
            return comment.isUserComment === true;
          });
          return [
            ...userComment,
            ...response.data.filter((comment) => {
              return comment.isUserComment === false;
            }),
          ];
        });
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handleLike = async (commentId) => {
    try {
      const response = await backendCaller(
        `/likes/togglecommentlike/${commentId}`
      );
      if (response.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  doesUserLiked: !comment.doesUserLiked,
                  like: comment.doesUserLiked
                    ? comment.like - 1
                    : comment.like + 1,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await backendCaller(
        `/comments/addcomment/${videoId}`,
        "POST",
        { "Content-Type": "application/json" },
        { content: newComment }
      );

      if (response.success) {
        setComments((prev) => [
          { ...response.data, isUserComment: true },
          ...prev,
        ]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await backendCaller(
        `/comments/deletecomment/${commentId}`,
        "DELETE"
      );
      if (response.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editedComment.trim()) return;
    try {
      const response = await backendCaller(
        `/comments/editcomment/${commentId}`,
        "PUT",
        { "Content-Type": "application/json" },
        { newContent: editedComment }
      );
      if (response.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, content: editedComment }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditedComment("");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  if (loading)
    return <p className="text-white text-center mt-4">Loading comments...</p>;

  if (comments.length === 0)
    return (
      <>
        <h2 className="text-2xl font-semibold mb-4 text-white">Comments</h2>
        {isLoggedIn && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
            <img
              src={userDetails.avatar}
              alt={userDetails.userName}
              className="w-12 h-12 rounded-full border border-gray-600"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 p-2 bg-gray-700 text-white rounded-lg outline-none"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Post
            </button>
          </div>
        )}
        <p className="text-gray-400 text-center">No comments yet.</p>
      </>
    );

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      {userDetails && !comments[0].isUserComment && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
          <img
            src={userDetails.avatar}
            alt={userDetails.userName}
            className="w-12 h-12 rounded-full border border-gray-600"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white rounded-lg outline-none"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Post
          </button>
        </div>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="flex gap-4 p-4 bg-gray-800 rounded-lg shadow transition hover:bg-gray-700"
          >
            <img
              src={comment.user.avatar}
              alt={comment.user.userName}
              className="w-12 h-12 rounded-full border border-gray-600 object-cover"
              loading="lazy"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {comment.user.fullName}{" "}
                    <span className="text-gray-400">
                      @{comment.user.userName}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {timeDifference(comment.createdAt)}
                  </p>
                </div>
                {userDetails && comment.isUserComment && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment._id);
                        setEditedComment(comment.content);
                      }}
                      className="text-yellow-500 hover:text-yellow-700"
                    >
                      Edit
                    </button>{" "}
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === comment._id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="flex-1 p-2 bg-gray-700 text-white rounded-lg outline-none"
                    placeholder="Edit your comment..."
                  />
                  <button
                    onClick={() => handleEditComment(comment._id)}
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="bg-gray-500 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-gray-300 mt-2">{comment.content}</p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleLike(comment._id)}
                  className={`text-gray-400 hover:text-blue-400 transition ${
                    comment.doesUserLiked ? "text-blue-500" : ""
                  }`}
                >
                  👍 {comment.like}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsList;
