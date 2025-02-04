import { Route, Routes } from 'react-router-dom'
import Messages from './pages/Messages'
import Login from './pages/auth/Login'

const App = () => {
  return (
    <Routes>
        <Route index={true}  element={<Messages/>} />
        <Route path='/auth/login'  element={<Login/>} />
    </Routes>
  )
}

export default App
