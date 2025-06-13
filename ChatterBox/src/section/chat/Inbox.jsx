import User03 from "../../assets/images/user/user-03.png";
import {
  Gif,
  LinkSimple,
  Microphone,
  PaperPlaneTilt,
  Phone,
  Smiley,
  VideoCamera,
  CaretDown,
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
import Media from '../../components/Messages/Media';
import NoChatSVG from "../../assets/Illustration/NoChat";

const Inbox = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const lastMessageCountRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const prevMessagesRef = useRef([]);

  // Get current conversation data from Redux
  const { current_conversation, current_messages, typing_users } = useSelector((store) => store.app);
  const currentUser = useSelector((store) => store.auth.user);

  // Debug logging
  console.log('Inbox Component State:', {
    current_conversation,
    current_messages,
    currentUser
  });

  // Get socket functions
  const { 
    sendMessage, 
    requestChatHistory, 
    isConnected, 
    startTyping, 
    stopTyping,
    markMessageAsDelivered,
    markMessageAsRead 
  } = useSocket();

  // Get the other participant's data
  const currentUserId = currentUser?.id || currentUser?._id;
  console.log('Current User ID:', currentUserId);

  // Safely find other participant
  const otherParticipant = current_conversation?.participants?.find(
    (participant) => participant?._id !== currentUserId
  );
  console.log('Other Participant:', otherParticipant);

  // Early return if no other participant found
  if (!otherParticipant) {
    console.log('Early return - no other participant found');
    return (
      <div className="flex h-full flex-1 flex-col justify-center items-center">
        <NoChatSVG />
        <div className="text-gray-500 dark:text-gray-400 mt-4">
          Unable to load conversation
        </div>
      </div>
    );
  }

  // Safely get chat partner properties with fallbacks
  const chatPartnerName = otherParticipant?.name || 
    (otherParticipant?.firstName && otherParticipant?.lastName ? 
      `${otherParticipant.firstName} ${otherParticipant.lastName}` : 
      "Unknown User");
  const chatPartnerAvatar = otherParticipant?.avatar || User03;
  const chatPartnerStatus = otherParticipant?.status || "Offline";

  console.log('Chat Partner Details:', {
    name: chatPartnerName,
    avatar: chatPartnerAvatar,
    status: chatPartnerStatus
  });

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

  // Handle sending message
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

    console.log('Sending text message:', messageData);

    // Stop typing when sending message
    if (otherParticipant) {
      stopTyping(otherParticipant._id, current_conversation._id);
    }

    // Send message only once
    sendMessage(messageData);
    
    // Clear input field
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

  // Add debug logging for messages
  useEffect(() => {
    if (current_messages && current_messages.length > 0) {
      // console.log('Current messages:', current_messages);
      // Log the last message to see its structure
      const lastMessage = current_messages[current_messages.length - 1];
      console.log('Last message:', {
        id: lastMessage._id,
        author: lastMessage.author,
        authorName: typeof lastMessage.author === 'object' ? lastMessage.author.name : 'Unknown',
        type: lastMessage.type,
        content: lastMessage.content
      });
    }
  }, [current_messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [current_messages]);

  // Update scroll handling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!container) return;
      
      // Calculate if we're near the bottom (within 100px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      isNearBottomRef.current = isNearBottom;
      
      // Show scroll button if not near bottom
      setShowScrollToBottom(!isNearBottom);
      
      // If we're near bottom, hide new message indicator
      if (isNearBottom) {
        setShowNewMessageIndicator(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !current_messages) return;

    // Check if we have new messages
    const hasNewMessages = current_messages.length > prevMessagesRef.current.length;
    
    if (hasNewMessages) {
      // Get the current scroll position
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      isNearBottomRef.current = isNearBottom;

      if (isNearBottom) {
        // If near bottom, auto-scroll to bottom
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        });
        setShowScrollToBottom(false);
        setShowNewMessageIndicator(false);
      } else {
        // If not near bottom, show new message indicator
        setShowNewMessageIndicator(true);
      }
    }

    // Update previous messages after handling
    prevMessagesRef.current = current_messages;
  }, [current_messages]);

  const handleScrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });
    
    // Hide both indicators after scrolling
    setShowScrollToBottom(false);
    setShowNewMessageIndicator(false);
    isNearBottomRef.current = true;
  };

  // Debug logging
  useEffect(() => {
    console.log('Current messages:', current_messages?.length);
    console.log('Previous messages:', prevMessagesRef.current?.length);
    console.log('Show new message indicator:', showNewMessageIndicator);
    console.log('Is near bottom:', isNearBottomRef.current);
  }, [current_messages, showNewMessageIndicator]);

  // Mark messages as delivered when they are received
  useEffect(() => {
    if (!current_messages || !current_conversation) return;

    current_messages.forEach(message => {
      if (!message.incoming && message.status === 'sent') {
        markMessageAsDelivered(message._id, current_conversation._id);
      }
    });
  }, [current_messages, current_conversation, markMessageAsDelivered]);

  // Mark messages as read when they are viewed
  useEffect(() => {
    if (!current_messages || !current_conversation) return;

    const unreadMessages = current_messages.filter(
      message => message.incoming && message.status !== 'read'
    );

    unreadMessages.forEach(message => {
      markMessageAsRead(message._id, current_conversation._id);
    });
  }, [current_messages, current_conversation, markMessageAsRead]);

  // Render message component based on type
  const renderMessage = (message) => {
    // Get the current user's ID
    const currentUserId = currentUser?.id || currentUser?._id;
    
    // Get the message author's ID
    const messageAuthorId = message.author?._id || message.author;
    
    // Message is incoming if the author is not the current user
    const isIncoming = messageAuthorId !== currentUserId;
    
    // Get author name
    const authorName = isIncoming ? chatPartnerName : "You";
    
    // Format timestamp
    const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    switch (message.type) {
      case "Text":
        return (
          <TextMessage
            key={message._id}
            messageId={message._id}
            author={authorName}
            content={message.content || ""}
            incoming={isIncoming}
            timestamp={timestamp}
          />
        );
      case "Document":
        return (
          <Document
            key={message._id}
            messageId={message._id}
            author={authorName}
            document={message.document}
            content={message.content}
            incoming={isIncoming}
            timestamp={timestamp}
          />
        );
      case "Media":
        return (
          <Media
            key={message._id}
            messageId={message._id}
            author={authorName}
            media={message.media || []}
            content={message.content}
            incoming={isIncoming}
            timestamp={timestamp}
            giphyUrl={message.giphyUrl}
          />
        );
      case "Audio":
        return (
          <VoiceMessage
            key={message._id}
            messageId={message._id}
            author={authorName}
            audioUrl={message.audioUrl}
            incoming={isIncoming}
            timestamp={timestamp}
          />
        );
      default:
        return null;
    }
  };

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
                src={chatPartnerAvatar}
                alt="avatar"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div>
              <h5 className="font-medium text-black dark:text-white">
                {chatPartnerName}
              </h5>
              <p className={`text-sm ${typing_users && typing_users[current_conversation?._id] && typing_users[current_conversation._id][otherParticipant?._id] ? "text-primary animate-pulse" : ""}`}>
                {typing_users && typing_users[current_conversation?._id] && typing_users[current_conversation._id][otherParticipant?._id] ? "Typing..." : chatPartnerStatus}
              </p>
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
        <div 
          ref={messagesContainerRef}
          className="max-h-full space-y-3.5 overflow-auto no-scrollbar px-6 py-7.5 grow relative"
        >
          {current_messages?.length > 0 ? (
            current_messages.map((message) => renderMessage(message))
          ) : (
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
                Start a conversation with {chatPartnerName}
              </p>
            </div>
          )}

          {/* Show typing indicator if someone is typing */}
          {current_conversation &&
           typing_users &&
           typing_users[current_conversation._id] &&
           Object.values(typing_users[current_conversation._id]).some(isTyping => isTyping) && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollToBottom && (
            <button
              onClick={handleScrollToBottom}
              className="fixed bottom-28 right-10 bg-primary text-white rounded-full p-2.5 shadow-lg hover:bg-opacity-90 transition-all duration-200 z-50 group"
              style={{
                boxShadow: '0 4px 16px rgba(60, 80, 224, 0.3)',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(60, 80, 224, 0.95)'
              }}
              aria-label="Scroll to bottom"
            >
              <CaretDown 
                size={24} 
                weight="bold" 
                className="text-white transform group-hover:translate-y-0.5 transition-transform duration-200" 
              />
            </button>
          )}

          {/* New message indicator */}
          {showNewMessageIndicator && (
            <button
              onClick={handleScrollToBottom}
              className="fixed bottom-28 right-10 bg-primary text-white rounded-full px-5 py-2.5 shadow-lg hover:bg-opacity-90 transition-all duration-200 z-50 flex items-center gap-2"
              style={{
                boxShadow: '0 4px 16px rgba(60, 80, 224, 0.3)',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(60, 80, 224, 0.95)'
              }}
            >
              <CaretDown 
                size={22} 
                weight="bold" 
                className="transform group-hover:translate-y-0.5 transition-transform duration-200"
              />
              <span className="text-sm font-bold">New message</span>
            </button>
          )}

          <div ref={messagesEndRef} />
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
