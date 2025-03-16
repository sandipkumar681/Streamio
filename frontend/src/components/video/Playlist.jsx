import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { Link } from "react-router-dom";

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await backendCaller(
          "/playlists/getuserplaylists",
          "GET"
        );
        if (response.success) {
          setPlaylists(response.data);
        } else {
          setError("Failed to fetch playlists");
        }
      } catch (err) {
        setError("Error fetching playlists");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async () => {
    try {
      const response = await backendCaller(
        "/playlists/createplaylist",
        "POST",
        { "Content-Type": "application/json" },
        {
          name,
          description,
        }
      );
      if (response.success) {
        setPlaylists([...playlists, response.data]);
        setShowModal(false);
        setName("");
        setDescription("");
      } else {
        setError("Failed to create playlist");
      }
    } catch (err) {
      setError("Error creating playlist");
    }
  };

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Playlists</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded text-white"
        >
          Create Playlist
        </button>
      </div>
      {playlists.length === 0 ? (
        <p className="text-center text-gray-400">No playlists found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition"
              to={`/playlists/${playlist?._id}`}
            >
              <img
                src={playlist.thumbnail || "/default-thumbnail.jpg"}
                alt={playlist.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-xl font-semibold mt-2">{playlist.name}</h3>
              <p className="text-gray-400">{playlist.videos.length} videos</p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;
