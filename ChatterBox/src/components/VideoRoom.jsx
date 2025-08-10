import {
  Microphone,
  MicrophoneSlash,
  Phone,
  PhoneDisconnect,
  VideoCamera,
  VideoCameraSlash,
  X
} from "@phosphor-icons/react";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { closeCallModal } from "../redux/slices/app";
import { FaPhoneSlash, FaVideoSlash } from "react-icons/fa";
import * as PhosphorIcons from "@phosphor-icons/react";

import User01 from "../assets/images/user/user-01.png";
import User02 from "../assets/images/user/user-02.png";

console.log(PhosphorIcons);

const VideoRoom = () => {
  const dispatch = useDispatch();
  const { open, isCaller, incomingOffer } = useSelector((state) => state.app.call) || {};
  const userId = useSelector((state) => state.auth?.user?.id);
  const targetUserId = useSelector((state) => state.app?.room_id);
  const { socket } = useSocket();
  const currentConversationId = useSelector((state) => state.app.current_conversation?._id);

  const [muteAudio, setMuteAudio] = useState(false);
  const [muteVideo, setMuteVideo] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartedRef = useRef(false);
  const remoteStreamRef = useRef(null);

  const iceConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!open || !isCaller) return;
    if (!socket || !userId || !targetUserId) return;
    if (callStartedRef.current) return;
    startCall();
    callStartedRef.current = true;
  }, [open, isCaller, socket, userId, targetUserId]);

  useEffect(() => {
    if (!open || isCaller || !incomingOffer?.offer) return;
    if (!socket || !userId) return;
    if (callStartedRef.current) return;
    answerCall(incomingOffer.offer, incomingOffer.from);
    callStartedRef.current = true;
  }, [open, isCaller, incomingOffer, socket, userId]);

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
        } catch (e) {}
      }
    };
    socket.on("call-answer", handleAnswer);
    socket.on("call-ice-candidate", handleIceCandidate);
    const handleCallMissed = () => {
      endCall();
      dispatch(closeCallModal());
    };
    socket.on("call-missed", handleCallMissed);
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

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !muteAudio;
      });
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !muteVideo;
      });
    }
  }, [muteAudio, muteVideo]);

  useEffect(() => {
    if (!open) {
      endCall();
    }
  }, [open]);

  const startCall = async () => {
    await setupLocalStream();
    createPeerConnection(targetUserId);
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("call-offer", { targetUserId, offer, callType: 'video' });
  };

  const answerCall = async (offer, fromUserId) => {
    await setupLocalStream();
    createPeerConnection(fromUserId);
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("call-answer", { targetUserId: fromUserId, answer, callType: 'video' });
    setCallActive(true);
    setRemoteUserJoined(true);
  };

  const setupLocalStream = async () => {
    if (localStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const createPeerConnection = (otherUserId) => {
    if (peerConnectionRef.current) return;
    const pc = new window.RTCPeerConnection(iceConfig);
    remoteStreamRef.current = new window.MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call-ice-candidate", {
          targetUserId: otherUserId,
          candidate: event.candidate,
          callType: 'video',
        });
      }
    };
    pc.ontrack = (event) => {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.addTrack(event.track);
      }
      setRemoteUserJoined(true);
    };
    peerConnectionRef.current = pc;
  };

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
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current = null;
    }
  };

  const handleToggleAudio = () => {
    setMuteAudio((prev) => !prev);
  };

  const handleToggleVideo = () => {
    setMuteVideo((prev) => !prev);
  };

  const handleDisconnect = () => {
    const otherUserId = isCaller ? targetUserId : incomingOffer?.from;
    if (otherUserId) {
      socket.emit('call-hang-up', { otherUserId, callType: 'video', conversationId: currentConversationId });
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 z-99 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 "
    >
      <div className="w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12 ">
        <div className="flex flex-col space-y-0">
          <div className="grid grid-cols-2 gap-4 min-h-[16rem] mb-4 overflow-hidden">
            {/* Local Video */}
            <div className="relative h-full w-full bg-gray dark:bg-boxdark-2 rounded-md flex flex-col justify-center items-center">
              <div className="space-y-2">
                <img
                  src={User01}
                  alt=""
                  className="h-20 w-20 rounded-full object-center object-cover"
                />
                <div className="font-medium text-sm text-center">You</div>
                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
              </div>
              <div className="absolute top-3 right-4">
                {muteAudio && (
                  <MicrophoneSlash size={20} className="text-primary" />
                )}
                {muteVideo && (
                  <VideoCameraSlash size={20} className="text-primary ml-2" />
                )}
              </div>
            </div>
            {/* Remote Video */}
            <div className="relative h-full w-full bg-gray dark:bg-boxdark-2 rounded-md flex flex-col justify-center items-center">
              <div className="space-y-2">
                <img
                  src={User02}
                  alt=""
                  className="h-20 w-20 rounded-full object-center object-cover"
                />
                <div className="font-medium text-sm text-center">
                  {remoteUserJoined ? "Friend" : "Calling..."}
                </div>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
          {/* Call Controls - always below video grid */}
          <div className="flex flex-row items-center justify-center space-x-4 mt-4 p-4 rounded-lg bg-white/80 dark:bg-boxdark-2/80 shadow-lg backdrop-blur-md">
            <button
              onClick={handleToggleAudio}
              className="flex p-3 rounded-md bg-gray dark:bg-boxdark text-black dark:text-white hover:bg-opacity-80 items-center justify-center"
            >
              {muteAudio ? (
                <MicrophoneSlash size={20} />
              ) : (
                <Microphone size={20} />
              )}
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600  text-black dark:text-white text-2xl shadow-lg transition-all duration-150"
              title="Hang Up"
            >
              <PhoneDisconnect size={32} />
            </button>
            <button
              onClick={handleToggleVideo}
              className="flex p-3 rounded-md bg-gray dark:bg-boxdark text-black dark:text-white hover:bg-opacity-80 items-center justify-center"
            >
              {muteVideo ? (
                <VideoCameraSlash size={20} />
              ) : (
                <VideoCamera size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
