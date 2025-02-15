import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const ShareModal = ({ videoUrl, isOpen, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(videoUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset message after 2 seconds
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Share Video</h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-200 hover:text-red-800" />
          </button>
        </div>

        <div className="mb-4">
          <label
            htmlFor="videoUrl"
            className="block text-gray-700 font-medium mb-2"
          >
            Video Link:
          </label>
          <input
            type="text"
            id="videoUrl"
            readOnly
            value={videoUrl}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-gray-100 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleCopyToClipboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Copy to Clipboard
          </button>
          {copySuccess && (
            <span className="text-sm text-green-600">Copied!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
