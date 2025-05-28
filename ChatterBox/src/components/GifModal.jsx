import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToggleGifModal } from "../redux/slices/app";
import { useSocket } from "../context/SocketContext";

const GifModal = () => {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { socket } = useSocket();

  // Get modal state and selected GIF URL from Redux
  const { gif } = useSelector((state) => state.app.modals);
  const { selectedGifUrl } = useSelector((state) => state.app);
  
  // Get current conversation from Redux
  const { current_conversation } = useSelector((state) => state.conversation);
  
  // Get user ID from auth state
  const { _id } = useSelector((state) => state.auth.user);

  // Handle ESC key to close modal
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!gif || keyCode !== 27) return;

      dispatch(
        ToggleGifModal({
          value: false,
          url: "",
        })
      );
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dispatch, gif]);

  // Handle sending GIF
  const handleSendGif = async () => {
    if (!selectedGifUrl) {
      console.error('No GIF selected');
      return;
    }
    
    if (!current_conversation || !current_conversation._id) {
      console.error('No active conversation');
      return;
    }

    try {
      setSending(true);
      
      // Prepare message data
      const messageData = {
        conversationId: current_conversation._id,
        message: {
          author: _id,
          content: message || 'Sent a GIF',
          type: 'Media', // Use Media type for GIFs
          giphyUrl: selectedGifUrl
        }
      };
      
      console.log('Sending GIF message:', messageData);
      
      // Send message via socket
      socket.emit('new-message', messageData, (response) => {
        setSending(false);
        
        if (response && response.status === 'error') {
          console.error('Error sending GIF message:', response.message);
        } else {
          console.log('GIF message sent successfully');
          
          // Reset and close modal
          setMessage('');
          dispatch(
            ToggleGifModal({
              value: false,
              url: "",
            })
          );
        }
      });
    } catch (error) {
      console.error("Failed to send GIF:", error);
      setSending(false);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        gif ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12"
      >
        <div className="flex flex-row items-center justify-between mb-8 space-x-2">
          <div className="text-md font-medium text-black dark:text-white">
            Send Giphy
          </div>
          <button
            onClick={() => {
              dispatch(
                ToggleGifModal({
                  value: false,
                  url: "",
                })
              );
            }}
          >
            <X size={24} />
          </button>
        </div>

        {selectedGifUrl && (
          <div className="mb-4">
            <img
              src={selectedGifUrl}
              alt="Selected GIF"
              className="w-full mx-auto max-h-125 object-cover object-center rounded-lg"
            />
          </div>
        )}

        <div className="flex flex-row items-center space-x-2 justify-between mt-4">
          <input
            type="text"
            className="border rounded-lg hover:border-primary outline-none w-full p-2 border-stroke dark:border-strokedark bg-transparent dark:bg-form-input"
            placeholder="Add a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button 
            className={`p-2.5 border border-primary flex items-center justify-center rounded-lg bg-primary hover:bg-opacity-90 text-white ${
              sending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSendGif}
            disabled={!selectedGifUrl || sending}
          >
            <PaperPlaneTilt size={20} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GifModal;
