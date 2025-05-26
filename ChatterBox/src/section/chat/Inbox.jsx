import User03 from "../../assets/images/user/user-03.png";
import {
  Gif,
  LinkSimple,
  Microphone,
  PaperPlaneTilt,
  Phone,
  Smiley,
  VideoCamera,
} from "@phosphor-icons/react";
import Dropdown from "../../components/Dropdown";
import EmojiPicker from "../../components/EmojiPicker";
import { useState, useEffect, useRef } from "react";
import UserInfo from "./UserInfo";
import Giphy from "../../components/Giphy";
import { useDispatch, useSelector } from "react-redux";
import { ToggleAudioModal } from "../../redux/slices/app";
import { useSocket } from "../../context/SocketContext";
import Attachment from "../../components/Attachment";
import MsgSeparator from "../../components/MsgSeparator";
import TypingIndicator from "../../components/TypingIndicator";
import {
  DocumentMessage,
  MediaMessage,
  TextMessage,
  VoiceMessage,
} from "../../components/Messages";
import VideoRoom from "../../components/VideoRoom";
import AudioRoom from "../../components/AudioRoom";

const Inbox = () => {
  const dispatch = useDispatch();

  // Get current conversation data from Redux
  const { current_conversation, current_messages, typing_users } = useSelector((store) => store.app);
  const currentUser = useSelector((store) => store.auth.user);



  // Get socket functions
  const { sendMessage, requestChatHistory, isConnected, startTyping, stopTyping } = useSocket();

  // Get the other participant's data
  const currentUserId = currentUser.id || currentUser._id;
  const otherParticipant = current_conversation?.participants?.find(
    (participant) => participant._id !== currentUserId
  );

  // Fallback data if no conversation is selected
  const chatPartner = otherParticipant || {
    name: "Select a conversation",
    avatar: User03,
    status: "Offline"
  };

  const [userInfoOpen, setUserInfoOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const lastConversationId = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [gifOpen, setGifOpen] = useState(false);

  const [videoCall, setVideoCall] = useState(false);
  const [audioCall, setAudioCall] = useState(false);

  const handleToggleVideo = () => {
    setVideoCall((p) => !p);
  };

  const handleToggleAudio = () => {
    setAudioCall((p) => !p);
  };

  const handleToggleGif = (e) => {
    e.preventDefault();
    setGifOpen((prev) => !prev);
  };

  const handleToggleUserInfo = () => {
    setUserInfoOpen((prev) => !prev);
  };

  const handleMicClick = (e) => {
    e.preventDefault();
    dispatch(ToggleAudioModal(true));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim() || !current_conversation || !isConnected) {
      return;
    }

    const messageData = {
      conversationId: current_conversation._id,
      message: {
        author: currentUser.id || currentUser._id,
        content: messageText.trim(),
        type: "Text"
      }
    };



    // Stop typing when sending message
    if (otherParticipant) {
      stopTyping(otherParticipant._id, current_conversation._id);
    }

    sendMessage(messageData);
    setMessageText("");
  };

  // Handle typing events
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);

    if (!current_conversation || !otherParticipant || !isConnected) {
      return;
    }

    // Start typing - send to the other participant
    console.log('Starting typing for user:', otherParticipant._id, 'in conversation:', current_conversation._id);
    startTyping(otherParticipant._id, current_conversation._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      console.log('Stopping typing for user:', otherParticipant._id);
      stopTyping(otherParticipant._id, current_conversation._id);
    }, 2000);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Request chat history when conversation changes
  useEffect(() => {
    if (current_conversation && isConnected && current_conversation._id !== lastConversationId.current) {
      console.log('Requesting chat history for conversation:', current_conversation._id);
      requestChatHistory(current_conversation._id);
      lastConversationId.current = current_conversation._id;
    }
  }, [current_conversation, isConnected, requestChatHistory]);

  return (
    <>
      <div
        className={`flex h-full flex-col border-l border-stroke dark:border-strokedark ${
          userInfoOpen ? "xl:w-1/2" : "xl:w-3/4"
        } `}
      >
        {/* Chat Header */}
        <div className="sticky flex flex-row border-stroke dark:border-strokedark border-b items-center justify-between px-6 py-4.5">
          <div
            className="flex items-center cursor-pointer"
            onClick={handleToggleUserInfo}
          >
            <div className="mr-4.5 h-13 overflow-hidden w-full max-w-13 rounded-full">
              <img
                src={chatPartner.avatar || User03}
                alt="avatar"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div>
              <h5 className="font-medium text-black dark:text-white">
                {chatPartner.name || "Unknown User"}
              </h5>
              <p className="text-sm">{chatPartner.status || "Offline"}</p>
            </div>
          </div>

          <div className="flex flex-row items-center space-x-8">
            <button onClick={handleToggleVideo}>
              <VideoCamera size={24} />
            </button>
            <button onClick={handleToggleAudio}>
              <Phone size={24} />
            </button>
            <Dropdown />
          </div>
        </div>

        {/* List of messages */}
        <div className="max-h-full space-y-3.5 overflow-auto no-scrollbar px-6 py-7.5 grow">
          {current_messages?.length > 0 ? (
            // Render actual messages when they exist
            current_messages.map((message, index) => {
              const messageAuthorId = message.author?._id || message.author;
              const currentUserId = currentUser.id || currentUser._id;
              const isIncoming = messageAuthorId !== currentUserId;

              // For now, show all messages as delivered (gray double tick)
              // TODO: Implement proper read receipts based on user activity
              let readReceipt = "delivered";



              return (
                <div key={message._id || index}>
                  <TextMessage
                    author={message.author?.name || "Unknown"}
                    content={message.content || ""}
                    read_receipt={isIncoming ? "read" : readReceipt}
                    incoming={isIncoming}
                    timestamp={message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : "Now"}
                  />
                </div>
              );
            })
          ) : (
            // Show placeholder when no messages
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No messages yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Start a conversation with {chatPartner.name}
              </p>
            </div>
          )}

          {/* Show typing indicator if someone is typing */}
          {current_conversation &&
           typing_users &&
           typing_users[current_conversation._id] &&
           Object.keys(typing_users[current_conversation._id]).length > 0 && (
            <TypingIndicator />
          )}
        </div>

        {/* Input */}
        <div className="sticky bottom-0 border-t border-stroke px-6 py-5 bg-white dark:bg-boxdark  dark:border-strokedark">
          <form onSubmit={handleSendMessage} className="flex items-center justify-between space-x-4.5 ">
            <div className="relative w-full">
              <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type something here..."
                className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-slate-500 dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                disabled={!isConnected || !current_conversation}
              />

              <div className="absolute right-5 top-1/2 -translate-y-1/2 items-center justify-end space-x-4">
                <button type="button" onClick={handleMicClick} className="hover:text-primary">
                  <Microphone size={20} />
                </button>
                <button
                  type="button"
                  // onClick={(e) => {
                  //   e.preventDefault();
                  // }}
                  className="hover:text-primary"
                >
                  <Attachment />
                </button>
                <button
                  type="button"
                  onClick={handleToggleGif}
                  className="hover:text-primary"
                >
                  <Gif size={20} />
                </button>
                <button type="button" className="hover:text-primary">
                  <EmojiPicker />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!messageText.trim() || !isConnected || !current_conversation}
              className="flex items-center justify-center h-13 max-w-13 w-full rounded-md bg-primary text-white
                    hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <PaperPlaneTilt size={24} weight="bold" />
            </button>
          </form>

          {gifOpen && <Giphy />}
        </div>
      </div>

      {videoCall && (
        <VideoRoom open={videoCall} handleClose={handleToggleVideo} />
      )}
      {audioCall && (
        <AudioRoom open={audioCall} handleClose={handleToggleAudio} />
      )}

      {userInfoOpen && (
        <div className="w-1/4">
          <UserInfo handleToggleUserInfo={handleToggleUserInfo} />
        </div>
      )}
    </>
  );
};

export default Inbox;
