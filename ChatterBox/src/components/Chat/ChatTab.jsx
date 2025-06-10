import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StartConversation, SendFriendRequest, RemoveFriend } from '../../redux/slices/app';
import { UserPlus, DotsThree } from '@phosphor-icons/react';
import ChatTabDropdown from './ChatTabDropdown';
import { toast } from 'react-toastify';

const ChatTab = ({ user, isFriend = false }) => {
  const dispatch = useDispatch();
  const authToken = useSelector((store) => store?.auth?.token);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef(null);

  // Ensure we have all required properties with fallbacks
  const userId = user?.id || user?._id || "unknown";
  const userName = user?.name || "Unknown User";
  const userStatus = user?.status || "Offline";
  const userImage = user?.avatar || "https://via.placeholder.com/40";
  
  // Get typing status from Redux
  const typing_users = useSelector((store) => store?.app?.typing_users);
  const current_conversation = useSelector((store) => store?.app?.current_conversation);
  
  // Check if this user is typing in any conversation
  const isTyping = Object.entries(typing_users || {}).some(([conversationId, users]) => {
    return users && users[userId];
  });

  const handleSelectConversation = async () => {
    // Only allow conversations with friends
    if (!isFriend) {
      toast.info(`Add ${userName} as a friend to start a conversation`);
      return;
    }

    try {
      await dispatch(StartConversation(userId, authToken));
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.stopPropagation(); // Prevent triggering the parent click
    setIsLoading(true);
    try {
      await dispatch(SendFriendRequest(userId, authToken));
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const handleRemoveFriend = async (e) => {
    e.stopPropagation(); // Prevent triggering the parent click
    setIsLoading(true);
    try {
      await dispatch(RemoveFriend(userId, authToken));
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <div
      className="flex cursor-pointer items-center gap-5 rounded-md px-4 py-3 hover:bg-gray-2 dark:hover:bg-boxdark-2 relative"
      onClick={handleSelectConversation}
    >
      <div className="relative h-10 w-10 rounded-full">
        <img
          src={userImage}
          alt={userName}
          className="h-full w-full rounded-full object-cover object-center"
        />
        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
          userStatus === "Online" ? "bg-success" : "bg-gray-4"
        }`}></span>
      </div>

      <div className="flex flex-1 items-center justify-between">
        <div>
          <h5 className="font-medium text-black dark:text-white">
            {userName}
          </h5>
          <p className={`text-sm ${isTyping ? "text-primary animate-pulse" : "text-gray-5 dark:text-gray-4"}`}>
            {isTyping ? "Typing..." : userStatus}
          </p>
        </div>

        <div className="relative flex">
          {isFriend ? (
            <button
              ref={triggerRef}
              className="h-8 w-8 rounded-full bg-gray-1 dark:bg-boxdark-2 p-2 hover:bg-gray-2 dark:hover:bg-boxdark-3 flex items-center justify-center text-[#98A6AD] hover:text-body"
              onClick={toggleDropdown}
              disabled={isLoading}
            >
              <DotsThree size={16} weight="bold" />
            </button>
          ) : (
            <button
              className="h-8 w-8 rounded-full bg-primary p-2 hover:bg-opacity-90 flex items-center justify-center"
              onClick={handleSendFriendRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin border-2 border-t-2 border-white rounded-full"></div>
              ) : (
                <UserPlus size={16} className="text-white" />
              )}
            </button>
          )}

          {/* Portal-based dropdown */}
          <ChatTabDropdown
            isOpen={showDropdown && isFriend}
            onClose={() => setShowDropdown(false)}
            triggerRef={triggerRef}
            onRemoveFriend={handleRemoveFriend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatTab;
