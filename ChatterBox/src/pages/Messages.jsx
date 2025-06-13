// import DocumentPicker from "../components/DocumentPicker";
// import GifModal from "../components/GifModal";
// import MediaPicker from "../components/MediaPicker";
// import VoiceRecorder from "../components/VoiceRecorder";
// import { ChatList, Inbox, Sidebar } from "../section/chat";

// const Messages = () => {
//   return (
//     <div className="h-screen overflow-hidden">
//       <div className="h-full rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
//         {/* {Sidebar} */}
//         <Sidebar />
//         {/* Chatlist */}
//         <ChatList />
//         {/* Inbox */}
//         <Inbox />
//       </div>

//       <GifModal />

//       <VoiceRecorder />
//       <MediaPicker/>
//       <DocumentPicker/>
//     </div>
//   );
// };

// export default Messages;

import React from "react";
import { ChatList, Inbox } from "../section/chat";
import DocumentPicker from "../components/DocumentPicker";
import GifModal from "../components/GifModal";
import MediaPicker from "../components/MediaPicker";
import VoiceRecorder from "../components/VoiceRecorder";
import { useSelector } from "react-redux";
import NoChatSVG from "../assets/Illustration/NoChat";

const Messages = () => {
  const { chat_type, room_id, current_conversation } = useSelector((store) => store.app);
  const currentUser = useSelector((store) => store.auth.user);

  // Debug logging
  console.log('Messages Component State:', {
    chat_type,
    room_id,
    current_conversation,
    currentUser
  });

  // Check if we have all required data
  const hasRequiredData = room_id && chat_type === "individual" && current_conversation && currentUser;

  return (
    <>
      <div className="flex w-full">
        {/* ChatList */}
        <ChatList />

        {/* Inbox */}
        {hasRequiredData ? (
          <Inbox />
        ) : (
          <div className="flex h-full flex-1 flex-col justify-center items-center">
            <NoChatSVG />
            <div className="text-gray-500 dark:text-gray-400 mt-4">
              {!currentUser ? "Please log in" : 
               !room_id ? "Select a conversation" :
               !current_conversation ? "Loading conversation..." :
               "Start a new conversation"}
            </div>
          </div>
        )}

        <GifModal />
        <VoiceRecorder />
        <MediaPicker />
        <DocumentPicker />
      </div>
    </>
  );
};

export default Messages;
