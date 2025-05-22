import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectConversation, SendFriendRequest, RemoveFriend } from '../../redux/slices/app';
import { UserPlus, UserMinus, DotsThree } from '@phosphor-icons/react';

const ChatTab = ({ user, isFriend = false }) => {
  const dispatch = useDispatch();
  const authToken = useSelector((store) => store?.auth?.token);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure we have all required properties with fallbacks
  const userId = user?.id || user?._id || "unknown";
  const userName = user?.name || "Unknown User";
  const userStatus = user?.status || "Offline";
  const userImage = user?.avatar || "https://via.placeholder.com/40";
  
  const handleSelectConversation = () => {
    dispatch(SelectConversation({ room_id: userId }));
  };

  const handleSendFriendRequest = async (e) => {
    e.stopPropagation(); // Prevent triggering the parent click
    setIsLoading(true);
    try {
      await dispatch(SendFriendRequest(userId, authToken));
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  const handleRemoveFriend = async (e) => {
    e.stopPropagation(); // Prevent triggering the parent click
    setIsLoading(true);
    try {
      await dispatch(RemoveFriend(userId, authToken));
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
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
          <p
            className="!mt-0.5 text-sm"
            dangerouslySetInnerHTML={{ __html: user.message }}
          ></p>
        </div>
        <div className="!ml-2">
          {isFriend ? (
            <div className="!flex !items-center !gap-2">
              <button
                className="!h-8 !w-8 !rounded-full !bg-gray-1 !p-!2 !hover:bg-gray-2"
                onClick={handleRemoveFriend}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="!h-!4 !w-!4 !animate-spin !border-!2 !border-t!2 !border-gray-!5 !rounded-full"></div>
                ) : (
                  <UserMinus size={16} className="!text-gray-!5" />
                )}
              </button>
              <button
                className="!h-!8 !w-!8 !rounded-full !bg-gray-!1 !p-!2 !hover:bg-gray-!2"
                onClick={toggleOptions}
              >
                <DotsThree size={16} className="!text-gray-!5" />
              </button>
            </div>
          ) : (
            <button
              className="!h-!8 !w-!8 !rounded-full !bg-gray-!1 !p-!2 !hover:bg-gray-!2"
              onClick={handleSendFriendRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="!h-!4 !w-!4 !animate-spin !border-!2 !border-t!2 !border-gray-!5 !rounded-full"></div>
              ) : (
                <UserPlus size={16} className="!text-gray-!5" />
              )}
            </button>
          )}
        </div>
      </div>
      {showOptions && (
        <div className="!absolute !right-!2 !top-!10 !z-!10 !w-!32 !rounded-!2 !bg-white !shadow-!2 !dark:bg-boxdark-!2 !dark:shadow-!2 !flex !flex-col !gap-!2 !p-!2 !min-w-!24 !max-w-!32 !!z-!10">
          <button
            className="!w-full !rounded-!2 !py-!2 !text-sm !font-medium !text-gray-!7 !hover:!bg-gray-!1 !dark:!text-white !dark:!hover:!bg-boxdark-!3"
            onClick={handleSendFriendRequest}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Friend Request"}
          </button>
          <button
            className="!w-full !rounded-!2 !py-!2 !text-sm !font-medium !text-gray-!7 !hover:!bg-gray-!1 !dark:!text-white !dark:!hover:!bg-boxdark-!3"
            onClick={handleRemoveFriend}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Friend"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatTab;
