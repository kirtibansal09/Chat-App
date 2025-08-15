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

  // ICE servers config - STUN + TURN for better connectivity
  const iceConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      // Add TURN servers for better connectivity across different networks
      // You can get free TURN servers from services like Twilio, Xirsys, or self-host coturn
      // For now, using multiple STUN servers as fallback
    ],
    iceCandidatePoolSize: 10,
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
        try {
          console.log('Received answer from user:', fromUserId, answer);
          await peerConnectionRef.current.setRemoteDescription(answer);
          console.log('Remote description set from answer successfully');
          setCallActive(true);
          setRemoteUserJoined(true);
        } catch (error) {
          console.error('Error setting remote description from answer:', error);
        }
      }
    };

    const handleIceCandidate = async ({ fromUserId, candidate }) => {
      if (peerConnectionRef.current && fromUserId !== userId) {
        try {
          console.log('Adding ICE candidate from user:', fromUserId, candidate);
          await peerConnectionRef.current.addIceCandidate(candidate);
          console.log('ICE candidate added successfully');
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
          // This often happens during connection establishment, not necessarily an error
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
    try {
      console.log('Starting call to user:', targetUserId);
      await setupLocalStream();
      createPeerConnection(targetUserId);
      
      if (!peerConnectionRef.current) {
        console.error('Peer connection not created');
        return;
      }
      
      localStreamRef.current.getTracks().forEach((track) => {
        console.log('Adding track to peer connection:', track.kind);
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
      
      console.log('Creating offer...');
      const offer = await peerConnectionRef.current.createOffer();
      console.log('Offer created:', offer);
      
      console.log('Setting local description...');
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('Local description set successfully');
      
      console.log('Emitting call-offer to server...');
      socket.emit("call-offer", { targetUserId, offer, callType: 'audio' });
      console.log('Call offer sent successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call: ' + error.message);
    }
  };

  // Answer a call (as callee)
  const answerCall = async (offer, fromUserId) => {
    try {
      console.log('Answering call from user:', fromUserId);
      console.log('Received offer:', offer);
      
      await setupLocalStream();
      createPeerConnection(fromUserId);
      
      if (!peerConnectionRef.current) {
        console.error('Peer connection not created');
        return;
      }
      
      localStreamRef.current.getTracks().forEach((track) => {
        console.log('Adding track to peer connection:', track.kind);
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
      
      console.log('Setting remote description...');
      await peerConnectionRef.current.setRemoteDescription(offer);
      console.log('Remote description set successfully');
      
      console.log('Creating answer...');
      const answer = await peerConnectionRef.current.createAnswer();
      console.log('Answer created:', answer);
      
      console.log('Setting local description...');
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('Local description set successfully');
      
      console.log('Emitting call-answer to server...');
      socket.emit("call-answer", { targetUserId: fromUserId, answer, callType: 'audio' });
      console.log('Call answer sent successfully');
      
      setCallActive(true);
      setRemoteUserJoined(true);
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call: ' + error.message);
    }
  };

  // Set up local audio stream
  const setupLocalStream = async () => {
    if (localStreamRef.current) return;
    try {
      console.log('Requesting audio permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
      console.log('Local audio stream setup successful');
    } catch (error) {
      console.error("Error accessing media devices:", error);
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Failed to access microphone: ' + error.message);
      }
    }
  };

  // Create peer connection and set up handlers
  const createPeerConnection = (otherUserId) => {
    if (peerConnectionRef.current) return;
    
    try {
      console.log('Creating peer connection with ICE config:', iceConfig);
      const pc = new window.RTCPeerConnection(iceConfig);
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated:', event.candidate);
          socket.emit("call-ice-candidate", {
            targetUserId: otherUserId,
            candidate: event.candidate,
            callType: 'audio',
          });
        } else {
          console.log('ICE candidate gathering completed');
        }
      };
      
      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc.iceGatheringState);
      };
      
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed to:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          console.error('ICE connection failed or disconnected');
          toast.error('Call connection failed. This often happens when users are on different networks.');
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log('Connection state changed to:', pc.connectionState);
        if (pc.connectionState === 'failed') {
          console.error('Peer connection failed');
          toast.error('Call failed to establish connection');
        }
      };
      
      pc.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.signalingState);
      };
      
      pc.ontrack = (event) => {
        console.log('Remote track received:', event.streams[0]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
        setRemoteUserJoined(true);
      };
      
      peerConnectionRef.current = pc;
      console.log('Peer connection created successfully');
    } catch (error) {
      console.error('Failed to create peer connection:', error);
      toast.error('Failed to create call connection');
    }
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