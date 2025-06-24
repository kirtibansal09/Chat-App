import { Navigate, Route, Routes } from "react-router-dom";
import Messages from "./pages/Messages";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import Verification from "./pages/auth/Verification";
import { useEffect } from "react";
import  Layout  from "./layout";
import ProfilePage from "./pages/ProfilePage";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "./context/SocketContext";
import { openCallModal, setIncomingCall, closeCallModal } from "./redux/slices/app";
import AudioRoom from "./components/AudioRoom";
import IncomingCallDialog from "./components/IncomingCallDialog";
import VideoRoom from "./components/VideoRoom";

const App = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const call = useSelector((state) => state.app?.call);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    if (!socket || !user?.id) return;
    
    socket.on("call-offer", ({ fromUserId, offer, callType }) => {
      console.log(`[Frontend Callee] Received ${callType} call-offer from:`, fromUserId);
      if (fromUserId === user.id) return;
      dispatch(setIncomingCall({ offer: { from: fromUserId, offer }, callType }));
    });

    const handleCallEnded = () => {
      dispatch(closeCallModal());
    };

    const handleCallMissed = () => {
      dispatch(closeCallModal());
    }

    socket.on("call-ended", handleCallEnded);
    socket.on("call-missed", handleCallMissed);

    return () => {
      socket.off("call-offer");
      socket.off("call-ended", handleCallEnded);
      socket.off("call-missed", handleCallMissed);
    };
  }, [socket, dispatch, user?.id]);

  useEffect(() => {
    const colorMode = JSON.parse(window.localStorage.getItem("color-theme"));
    const className = "dark";
    const bodyClass = window.document.body.classList;
    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, []);

  return (
    <>
      <Routes>
        {/* Redirect to login page if user is not logged in / ---> /auth/login*/}
        <Route path = "/" element={<Navigate to="/auth/login"/>}/>
        {/* <Route index={true} element={<Messages />} /> */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/verify" element={<Verification />} />

        <Route path="/dashboard" element={<Layout/>}>
          <Route index element={<Messages/>}/>
          <Route path = "profile" element={<ProfilePage/>} />
        </Route>
      </Routes>
      {call?.open && call?.callType === 'audio' && <AudioRoom />}
      {call?.open && call?.callType === 'video' && <VideoRoom />}
      {call?.incomingCallPending && <IncomingCallDialog />}
    </>
  );
};

export default App;
