import { Chat } from '@phosphor-icons/react'
import React from 'react'

const Sidebar = () => {
  return (
    <div className='flex flex-col border-r border-stroke p-2 dark:border-strokedark '>
        <div className='mx-auto border border-stroke p-2 dark:border-strokedark rounded-md'>
            <Chat/>
        </div>

        <div className="mx-auto self-end justify-self-end">
                  <p>h</p>
        </div>

        <div className="mx-auto justify-self-end">
            <p>y
            </p>
        </div>
      
    </div> 
  )
}

export default Sidebar
