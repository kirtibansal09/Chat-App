import {
  Microphone,
  MicrophoneSlash,
  PhoneDisconnect,
} from "@phosphor-icons/react";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { closeCallModal } from "../redux/slices/app";

import User01 from "../assets/images/user/user-01.png";
import User02 from "../assets/images/user/user-02.png";

const AudioRoom = () => {
  const dispatch = useDispatch();
  const { open, isCaller, incomingOffer } =
    useSelector((state) => state.app.call) || {};

  const [muteAudio, setMuteAudio] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartedRef = useRef(false);

  // Redux selectors
  const userId = useSelector((state) => state.auth?.user?.id);
  const targetUserId = useSelector((state) => state.app?.room_id);
  const { socket } = useSocket();
  const currentConversationId = useSelector((state) => state.app.current_conversation?._id);

  // ICE servers config (use public STUN for demo)
  const iceConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Start call if caller
  useEffect(() => {
    if (!open || !isCaller) return;
    if (!socket || !userId || !targetUserId) return;
    if (callStartedRef.current) return;

    startCall();
    callStartedRef.current = true;
  }, [open, isCaller, socket, userId, targetUserId]);

  // Answer call if callee
  useEffect(() => {
    if (!open || isCaller || !incomingOffer?.offer) return;
    if (!socket || !userId) return;
    if (callStartedRef.current) return;

    answerCall(incomingOffer.offer, incomingOffer.from);
    callStartedRef.current = true;
  }, [open, isCaller, incomingOffer, socket, userId]);
  
  // Listen for signaling events (answer and ICE candidates)
  useEffect(() => {
    if (!socket) return;
    
    const handleAnswer = async ({ fromUserId, answer }) => {
      if (peerConnectionRef.current && fromUserId !== userId) {
        await peerConnectionRef.current.setRemoteDescription(answer);
        setCallActive(true);
        setRemoteUserJoined(true);
      }
    };

    const handleIceCandidate = async ({ fromUserId, candidate }) => {
      if (peerConnectionRef.current && fromUserId !== userId) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (e) {
          // ignore
        }
      }
    };

    socket.on("call-answer", handleAnswer);
    socket.on("call-ice-candidate", handleIceCandidate);

    // Listen for call missed/rejected event
    const handleCallMissed = () => {
      console.log("[Frontend Caller] Received call-missed event!");
      endCall();
      dispatch(closeCallModal());
    };
    socket.on("call-missed", handleCallMissed);

    // Listen for call hang-up event
    const handleCallEnded = (data) => {
      console.log('[Frontend] Received call-ended event:', data);
      endCall();
      dispatch(closeCallModal());
    };
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-answer", handleAnswer);
      socket.off("call-ice-candidate", handleIceCandidate);
      socket.off("call-missed", handleCallMissed);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket, userId, isCaller, dispatch]);


  // Mute/unmute local audio
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !muteAudio;
      });
    }
  }, [muteAudio]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      endCall();
    }
  }, [open]);

  // Start a call (as caller)
  const startCall = async () => {
    await setupLocalStream();
    createPeerConnection(targetUserId);
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("call-offer", { targetUserId, offer, callType: 'audio' });
  };

  // Answer a call (as callee)
  const answerCall = async (offer, fromUserId) => {
    await setupLocalStream();
    createPeerConnection(fromUserId);
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("call-answer", { targetUserId: fromUserId, answer, callType: 'audio' });
    setCallActive(true);
    setRemoteUserJoined(true);
  };

  // Set up local audio stream
  const setupLocalStream = async () => {
    if (localStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  // Create peer connection and set up handlers
  const createPeerConnection = (otherUserId) => {
    if (peerConnectionRef.current) return;
    const pc = new window.RTCPeerConnection(iceConfig);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call-ice-candidate", {
          targetUserId: otherUserId,
          candidate: event.candidate,
          callType: 'audio',
        });
      }
    };
    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
      setRemoteUserJoined(true);
    };
    peerConnectionRef.current = pc;
  };

  // End call and cleanup
  const endCall = () => {
    setCallActive(false);
    setRemoteUserJoined(false);
    callStartedRef.current = false;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  const handleToggleAudio = () => {
    setMuteAudio((prev) => !prev);
  };

  const handleDisconnect = () => {
    // Determine the other user's ID
    const otherUserId = isCaller ? targetUserId : incomingOffer?.from;
    if (otherUserId) {
      socket.emit('call-hang-up', { otherUserId, callType: 'audio', conversationId: currentConversationId });
    }
    // Do not call endCall() or closeCallModal() here; let the event handle it
  };

  if (!open) {
    return null;
  }
  
  return (
    <div
      className="fixed left-0 top-0 z-99 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 block"
    >
      <div className="w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12 ">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-2 gap-4 h-50 mb-4">
            {/* Local Audio */}
            <div className="relative h-full w-full bg-gray dark:bg-boxdark-2 rounded-md flex flex-col justify-center items-center">
              <div className="space-y-2">
                <img
                  src={User01}
                  alt=""
                  className="h-20 w-20 rounded-full object-center object-cover"
                />
                <div className="font-medium text-sm text-center">You</div>
                <audio ref={localAudioRef} autoPlay muted />
              </div>
              <div className="absolute top-3 right-4">
                {muteAudio && (
                  <MicrophoneSlash size={20} className="text-primary" />
                )}
              </div>
            </div>

            {/* Remote Audio */}
            <div className="relative h-full w-full bg-gray  dark:bg-boxdark-2 rounded-md flex flex-col justify-center items-center">
              <div className="space-y-2">
                <img
                  src={User02}
                  alt=""
                  className="h-20 w-20 rounded-full object-center object-cover"
                />
                <div className="font-medium text-sm text-center">
                  {remoteUserJoined ? "Friend" : "Calling..."}
                </div>
                <audio ref={remoteAudioRef} autoPlay />
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex flex-row items-center justify-center space-x-4">
            <button
              onClick={handleToggleAudio}
              className="p-3 rounded-md bg-gray dark:bg-boxdark text-black dark:text-white hover:bg-opacity-80 items-center justify-center"
            >
              {muteAudio ? (
                <MicrophoneSlash size={20} />
              ) : (
                <Microphone size={20} />
              )}
            </button>
            <button
              onClick={handleDisconnect}
              className="p-3 rounded-full bg-red text-white hover:bg-opacity-80"
            >
              <PhoneDisconnect size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRoom;