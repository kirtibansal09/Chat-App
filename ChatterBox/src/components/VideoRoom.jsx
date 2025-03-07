import React from 'react'

const VideoRoom = ({open, handleClose}) => {
  return (
    <div className={`fixed left-0 top-0 z-99 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5  ${open ? "block" : "hidden"}`}>
        <div className='w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark-2 md:py-8 px-8 py-12 '>

        </div>
      
    </div>
  )
}

export default VideoRoom
