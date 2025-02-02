import React from 'react'
import User03 from '../../assets/images/user/user-03.png'
import { DotsThree, LinkSimple, PaperPlaneTilt, Smiley } from '@phosphor-icons/react'

const Inbox = () => {
    return (
        <div className='flex h-full flex-col border-l border-stroke dark:border-strokedark xl:w-3/4'>
            <div className="sticky flex flex-row border-stroke dark:border-strokedark border-b items-center justify-between px-6 py-4.5">
                <div className="flex items-center">
                    <div className="mr-4.5 h-13 overflow-hidden w-full max-w-13 rounded-full">
                        <img src={User03} alt="avatar" className='h-full w-full object-cover object-center' />
                    </div>
                    <div>
                        <h5 className='font-medium text-black dark:text-white'>
                            Robert Jhon
                        </h5>
                        <p className='text-sm'>
                            Reply to message
                        </p>
                    </div>
                </div>
                
                <div>
                    <DotsThree weight='bold' size={24}/>
                </div>

            </div>

            <div className='max-h-full space-y-3.5 overflow-auto no-scrollbar px-6 py-7.5 grow'>wefewdewf</div>

            <div className='sticky bottom-0 border-t border-stroke px-6 py-5 bg-white dark:bg-boxdark  dark:border-strokedark'>
                <form className='flex items-center justify-between space-x-4.5'>
                    <div className='relative w-full'>
                        <input type="text" placeholder='Type something here...' className='h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-slate-500 dark:border-strokedark dark:bg-boxdark-2 dark:text-white' />

                        <div className="absolute right-5 top-1/2 -translate-y-1/2 items-center justify-end space-x-4">
                           <button className='hover:text-primary'>
                               <LinkSimple size={20}/>
                           </button>
                           <button className='hover:text-primary'>
                               <Smiley size={20}/>
                           </button>
                        </div>
                    </div>

                    <button className="flex items-center justify-center h-13 max-w-13 w-full rounded-md bg-primary text-white
                    hover:bg-opacity-90 ">
                        <PaperPlaneTilt size={24} weight='bold'/>
                    </button>
                </form>
            </div>

        </div>
    )
}

export default Inbox
