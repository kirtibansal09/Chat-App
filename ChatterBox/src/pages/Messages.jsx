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

import React from 'react'
import { ChatList, Inbox } from '../section/chat'
import DocumentPicker from "../components/DocumentPicker";
import GifModal from "../components/GifModal";
import MediaPicker from "../components/MediaPicker";
import VoiceRecorder from "../components/VoiceRecorder";

const Messages = () => {
  return (
    <>
      <div className='flex w-full'>
        {/* ChatList */}
        <ChatList />

        {/* Inbox */}
        <Inbox />

        <GifModal />

        <VoiceRecorder />
        <MediaPicker />
        <DocumentPicker />

      </div>
    </>
  )
}

export default Messages

