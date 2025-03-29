import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await backendCaller("/dashboard/stats");

        if (response.success) {
          setChannelData(response.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">Channel Dashboard</h2>

      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* User Details */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">
              {channelData.userName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{channelData.fullName}</h3>
            <p className="text-gray-400">@{channelData.userName}</p>
          </div>
        </div>

        {/* Subscriber Count */}
        <div className="bg-gray-700 p-4 rounded-lg text-center mb-6">
          <p className="text-lg font-semibold">Subscribers</p>
          <p className="text-2xl font-bold">{channelData.totalSubscribers}</p>
        </div>

        {/* Channel Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Videos"
            value={channelData.channelInfo.totalVideos}
          />
          <StatCard
            label="Total Likes"
            value={channelData.channelInfo.totalLikes}
          />
          <StatCard
            label="Total Comments"
            value={channelData.channelInfo.totalComments}
          />
          <StatCard
            label="Total Views"
            value={channelData.channelInfo.totalViews}
          />
        </div>
      </div>

      {/* View All Videos Button */}
      <div className="text-center">
        <Link
          to={`/dashboard/videos`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          View All Videos
        </Link>
      </div>
    </div>
  );
};

// Reusable Card Component for Stats
const StatCard = ({ label, value }) => (
  <div className="bg-gray-700 p-4 rounded-lg text-center">
    <p className="text-lg font-semibold">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Dashboard;
