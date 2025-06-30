import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openCallModal, closeCallModal } from "../redux/slices/app";
import { useSocket } from "../context/SocketContext";
import ringtone from "../assets/audio/file_example.mp3";
import { Phone, PhoneDisconnect } from "@phosphor-icons/react";

const IncomingCallDialog = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const callState = useSelector((state) => state.app.call);
  const friends = useSelector((state) => state.app.friends);

  const incomingOffer = callState?.incomingOffer;
  const callType = callState?.callType || 'audio';

  // Ringtone logic
  const audioRef = useRef(null);
  useEffect(() => {
    if (callState?.incomingCallPending && incomingOffer) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [callState?.incomingCallPending, incomingOffer]);

  if (!callState?.incomingCallPending || !incomingOffer) {
    return null;
  }

  const caller = friends?.find((friend) => friend.id === incomingOffer?.from);
  const callerName = caller ? caller.name : "Unknown Caller";
  const callerAvatar = caller?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(callerName);

  const handleAccept = () => {
    dispatch(openCallModal({ isCaller: false, offer: incomingOffer, callType }));
  };

  const handleReject = () => {
    const callerId = incomingOffer?.from;
    if (callerId && socket) {
      socket.emit("call-rejected", { callerId, callType });
    }
    dispatch(closeCallModal());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <audio ref={audioRef} src={ringtone} loop autoPlay style={{ display: 'none' }} />
      <div className="bg-white dark:bg-boxdark p-8 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm flex flex-col items-center relative animate-fade-in">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-primary/10 rounded-full p-4 mb-2">
            <Phone size={36} className="text-primary animate-pulse" />
          </div>
          <img
            src={callerAvatar}
            alt={callerName}
            className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-md mb-2"
            onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(callerName); }}
          />
          <div className="text-lg font-semibold text-black dark:text-white mb-1">{callerName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">
            Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-8 mt-2">
          <button
            onClick={handleReject}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600  text-2xl shadow-lg transition-all duration-150  text-red font-bold dark:text-red"
            title="Reject Call"
          >
            X
          </button>
          <button
            onClick={handleAccept}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white text-2xl shadow-lg transition-all duration-150"
            title="Accept Call"
          >
            <Phone size={32} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallDialog;