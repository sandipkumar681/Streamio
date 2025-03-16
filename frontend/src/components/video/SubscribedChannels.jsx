import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { Link } from "react-router-dom";

const SubscribedChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(true);

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const response = await backendCaller(
          `/subscriptions/getsubscribedChannels`
        );
        if (response.success) {
          setChannels(response.data);
        } else {
          setError(response.message || "Failed to fetch subscribed channels");
        }
      } catch (err) {
        setError("Error fetching subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedChannels();
  }, []);

  // Subscription toggle handler
  const handleSubscription = async (channelId) => {
    try {
      const response = await backendCaller(
        `/subscriptions/togglesubscription/channelId=${channelId}`
      );
      if (response.success) {
        setSubscribed((prev) => (prev = !prev));
      }
    } catch (err) {
      console.error("Subscription error:", err);
    }
  };

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;
  if (error)
    return (
      <div className="min-h-screen bg-gray-900 text-red-500 text-center pt-10">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full flex flex-col gap-4">
      <h2 className="text-3xl font-bold mb-6">Subscribed Channels</h2>

      {channels.length === 0 ? (
        <p className="text-center text-gray-400">
          You haven’t subscribed to any channels yet.
        </p>
      ) : (
        channels.map((channel) => (
          <div
            key={channel._id}
            className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-between"
          >
            {/* Left Section: Avatar */}
            <Link
              to={`/channel-info/${channel.userName}`}
              className="flex items-center gap-4"
            >
              <img
                src={channel.avatar}
                alt={channel.userName}
                className="w-12 h-12 rounded-full border border-gray-600"
              />

              {/* Middle Section: Full Name & Username */}
              <div>
                <h3 className="text-lg font-semibold">{channel.fullName}</h3>
                <p className="text-gray-400 text-sm">
                  @{channel.userName} . {channel.subscriberCount} subscribers
                </p>
              </div>
            </Link>

            {/* Right Section: Subscribe/Unsubscribe Button */}
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                channel.isSubscribed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => handleSubscription(channel._id)}
            >
              {channel.isSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SubscribedChannels;
