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
  const { chat_type, room_id } = useSelector((store) => store.app);
  return (
    <>
      <div className="flex w-full">
        {/* ChatList */}
        <ChatList />

        {/* Inbox */}
        {room_id !== null && chat_type === "individual" ? (
          <Inbox />
        ) : (
          <div className="flex h-full flex-1 flex-col justify-center items-center">
            <NoChatSVG />
            <div>Select a conversation or start a new one</div>
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
