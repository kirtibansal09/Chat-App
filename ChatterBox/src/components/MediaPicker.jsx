import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToggleMediaModal } from "../redux/slices/app";
import FileDropZone from "./FileDropZone";
import { useSocket } from "../context/SocketContext";

const MediaPicker = () => {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { media } = useSelector((state) => state.app.modals);
  const { room_id, current_conversation } = useSelector((state) => state.app);
  const { _id } = useSelector((state) => state.auth.user);
  const [message, setMessage] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState([]);

  // Handle file upload completion
  const handleFileUploaded = (fileData) => {
    console.log("Media uploaded:", fileData);

    // Make sure we have all the necessary data
    if (!fileData || !fileData.url) {
      console.error("Invalid media data received:", fileData);
      return;
    }

    // Store the media data with all necessary fields
    setUploadedMedia((prev) => [
      ...prev,
      {
        url: fileData.url,
        type: fileData.mimetype?.startsWith("image/") ? "image" : "video",
        size: fileData.size,
      },
    ]);
  };

  // Handle sending media message
  const handleSendMedia = () => {
    if (uploadedMedia.length === 0) {
      console.error("No media selected");
      return;
    }

    // Check if we have a valid conversation
    if (!current_conversation || !current_conversation._id) {
      console.error("No active conversation", current_conversation);
      return;
    }

    const conversationId = current_conversation._id;

    // Log the conversation ID for debugging
    console.log("Sending media in conversation with ID:", conversationId);
    console.log("User ID for media sender:", _id);
    console.log("Media data being sent:", uploadedMedia);

    // Prepare message data
    const messageData = {
      conversationId: conversationId,
      message: {
        author: _id,
        content: message || "",
        type: "Media",
        media: uploadedMedia.map((media) => ({
          type: media.type || "image",
          url: media.url,
        })),
      },
    };

    console.log("Sending message data:", messageData);

    // Send message via socket with error handling
    socket.emit("new-message", messageData, (response) => {
      if (response && response.status === "error") {
        console.error("Error sending media message:", response.message);
        alert(`Failed to send media: ${response.message}`);
      }
    });

    // Reset and close modal
    setMessage("");
    setUploadedMedia([]);
    dispatch(ToggleMediaModal(false));
  };

  // Handle modal close
  const handleClose = () => {
    setMessage("");
    setUploadedMedia([]);
    dispatch(ToggleMediaModal(false));
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        media ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12"
      >
        <div className="flex flex-row items-center justify-between mb-8 space-x-2">
          <div className="text-md font-medium text-black dark:text-white">
            Choose Media Files to send
          </div>
          <button onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Show uploaded files preview */}
        {uploadedMedia.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {uploadedMedia.map((media, index) => (
              <div key={index} className="relative">
                {media.type === "image" ? (
                  <img
                    src={
                      media.url.startsWith("/")
                        ? `${import.meta.env.VITE_API_URL}${media.url}`
                        : media.url
                    }
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-200 flex items-center justify-center rounded">
                    <span>Video</span>
                  </div>
                )}
                <button
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  onClick={() =>
                    setUploadedMedia((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <FileDropZone
          maxFileSize={16 * 1024 * 1024}
          onFileUploaded={handleFileUploaded}
          isDocument={false}
        />

        <div className="flex flex-row items-center space-x-2 justify-between mt-4">
          <input
            type="text"
            className="border rounded-lg hover:border-primary outline-none w-full p-2 border-stroke dark:border-strokedark bg-transparent dark:bg-form-input"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            className="p-2.5 border border-primary flex items-center justify-center rounded-lg bg-primary hover:bg-opacity-90 text-white"
            onClick={handleSendMedia}
            disabled={uploadedMedia.length === 0}
          >
            <PaperPlaneTilt size={20} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPicker;
