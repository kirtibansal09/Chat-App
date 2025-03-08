import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="h-[calx(100vh)] overflow-hidden sm:h-screen">
    <div className="h-full rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
      {/* {Sidebar} */}
      <Sidebar />

      <Outlet/>  
    </div>
    </div>
  )
}

export default Layout
