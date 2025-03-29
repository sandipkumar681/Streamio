import React from "react";

const About = () => {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-500">
          About Streamio
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          Streamio is a modern video-sharing platform designed to empower
          content creators and provide users with an engaging viewing
          experience. Whether you’re here to share your creativity or discover
          incredible content, Streamio makes it seamless and enjoyable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">
              📹 Upload & Share
            </h2>
            <p className="text-gray-400">
              Easily upload videos, set custom thumbnails, and manage your
              content with an intuitive dashboard.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">
              🎥 Watch & Explore
            </h2>
            <p className="text-gray-400">
              Discover trending videos, subscribe to your favorite channels, and
              create personalized playlists.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">
              🔒 Secure & Private
            </h2>
            <p className="text-gray-400">
              Your privacy is our priority. Control who sees your videos and
              manage your account with secure authentication.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">
              🚀 Fast & Optimized
            </h2>
            <p className="text-gray-400">
              Powered by Cloudinary and optimized for speed, Streamio ensures a
              smooth streaming experience across devices.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-2 text-blue-400">
            Join the Streamio Community!
          </h3>
          <p className="text-gray-400">
            Sign up today to start sharing and exploring amazing content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
