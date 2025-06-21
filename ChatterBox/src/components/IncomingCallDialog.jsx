import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { openCallModal, closeCallModal } from "../redux/slices/app";
import { useSocket } from "../context/SocketContext";

const IncomingCallDialog = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const callState = useSelector((state) => state.app.call);
  const friends = useSelector((state) => state.app.friends);

  const incomingOffer = callState?.incomingOffer;

  if (!callState?.incomingCallPending || !incomingOffer) {
    return null;
  }

  const caller = friends?.find((friend) => friend.id === incomingOffer?.from);
  const callerName = caller ? caller.name : "Unknown Caller";

  const handleAccept = () => {
    dispatch(openCallModal({ isCaller: false, offer: incomingOffer }));
  };

  const handleReject = () => {
    const callerId = incomingOffer?.from;
    if (callerId && socket) {
      socket.emit("audio-call-rejected", { callerId });
    }
    dispatch(closeCallModal());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-2 text-black dark:text-white">
          Incoming Call
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You have an incoming call from{" "}
          <span className="font-semibold">{callerName}</span>.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={handleReject}
            style={{
              backgroundColor: "#EF4444",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            style={{
              backgroundColor: "#22C55E",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallDialog;