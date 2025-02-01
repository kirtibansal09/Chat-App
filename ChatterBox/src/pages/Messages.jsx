import React from 'react'
import { Sidebar } from '../section/chat'

const Messages = () => {
  return (
    <div className='h-screen overflow-hidden'>
      <div className="h-full rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
         {/* {Sidebar} */}
         <Sidebar/>
         {/* Chatlist */}
         {/* Inbox */}
      </div>
      
    </div>
  )
}

export default Messages
