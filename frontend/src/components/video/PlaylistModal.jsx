import { useState, useEffect } from "react";
import { backendCaller } from "../utils/backendCaller";
import { X, PlusCircle } from "lucide-react";

const PlaylistModal = ({ isOpen, onClose, videoId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    const response = await backendCaller("/playlists/getUserPlaylists");
    setIsLoading(false);

    if (response.success) {
      setPlaylists(response.data);
    } else {
      setError("Failed to fetch playlists");
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    const response = await backendCaller(
      `/playlists/addvideotoplaylist`,
      "POST",
      { "Content-Type": "application/json" },
      { playlistId, videoId }
    );
    if (response.success) {
      alert("Video added to playlist successfully!");
      onClose();
    } else {
      alert("Failed to add video to playlist");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) return;
    const response = await backendCaller(
      "/playlists/createplaylist",
      "POST",
      { "Content-Type": "application/json" },
      { name: newPlaylistName, description: newPlaylistDescription }
    );
    if (response.success) {
      setPlaylists([...playlists, response.data]);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
    } else {
      alert("Failed to create playlist");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md z-50">
      <div className="bg-gray-900 bg-opacity-90 p-6 rounded-xl w-96 text-white shadow-xl relative transition-transform scale-100">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Save to Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Playlists List */}
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="max-h-60 overflow-auto space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="flex justify-between items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <span className="font-medium">{playlist.name}</span>
                <button
                  onClick={() => handleAddToPlaylist(playlist._id)}
                  className="bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-500 transition"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Playlist Section */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-sm text-gray-300 mb-2">Create New Playlist</h3>
          <input
            type="text"
            placeholder="Playlist Name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newPlaylistDescription}
            onChange={(e) => setNewPlaylistDescription(e.target.value)}
            className="w-full p-2 mt-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreatePlaylist}
            className="w-full flex items-center justify-center bg-green-600 px-4 py-2 mt-3 rounded-lg hover:bg-green-500 transition"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
