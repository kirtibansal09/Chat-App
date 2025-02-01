import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Messages from './pages/Messages'

const App = () => {
  return (
    <Routes>
      <Route>
        <Route index={true}  element={<Messages/>} />
      </Route>
    </Routes>
  )
}

export default App
