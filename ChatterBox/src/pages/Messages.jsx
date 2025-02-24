import GifModal from '../components/GifModal'
import { ChatList, Inbox, Sidebar } from '../section/chat'

const Messages = () => {
  return (
    <div className='h-screen overflow-hidden'>
      <div className="h-full rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
         {/* {Sidebar} */}
         <Sidebar/>
         {/* Chatlist */}
         <ChatList/>
         {/* Inbox */}
         <Inbox/>
      </div>

      <GifModal/>
      
    </div>
  )
}

export default Messages
