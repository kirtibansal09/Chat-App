import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { AddMessage, UpdateMessages, SetTyping } from '../redux/slices/app';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  const { token, isLoggedIn } = useSelector((store) => store.auth);
  const { current_conversation } = useSelector((store) => store.app);

  // Initialize socket connection
  useEffect(() => {
    if (isLoggedIn && token && !socket) {
      console.log('Initializing socket connection...');

      const newSocket = io('http://localhost:8000', {
        auth: {
          token: token
        },
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // User status events
      newSocket.on('user-connected', (data) => {
        console.log('User connected:', data);
        handleUserStatusChange(data.userId, "Online");
      });

      newSocket.on('user-disconnected', (data) => {
        console.log('User disconnected:', data);
        handleUserStatusChange(data.userId, "Offline");
      });

      // Message events
      newSocket.on('new-direct-chat', (data) => {
        console.log('New message received:', data);
        // TODO: Add message to current conversation
        handleNewMessage(data);
      });

      // Chat history events
      newSocket.on('chat-history', (data) => {
        console.log('Chat history received:', data);
        // TODO: Update conversation messages
        handleChatHistory(data);
      });

      // Typing events
      newSocket.on('start-typing', (data) => {
        console.log('User started typing:', data);
        const { conversationId, typingUserId } = data;
        handleTypingEvent(conversationId, typingUserId, true);
      });

      newSocket.on('stop-typing', (data) => {
        console.log('User stopped typing:', data);
        const { conversationId, typingUserId } = data;
        handleTypingEvent(conversationId, typingUserId, false);
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Socket error occurred');
      });

      setSocket(newSocket);
    }

    // Cleanup on logout
    if (!isLoggedIn && socket) {
      console.log('Cleaning up socket connection...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      if (socket && !isLoggedIn) {
        socket.disconnect();
      }
    };
  }, [isLoggedIn, token, socket]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // First, remove any existing listeners to prevent duplicates
    socket.off('connect');
    socket.off('disconnect');
    socket.off('new-direct-chat');
    socket.off('message-sent');
    socket.off('chat-history');
    socket.off('start-typing');
    socket.off('stop-typing');
    socket.off('error');

    // Handle connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Handle new direct chat message
    socket.on('new-direct-chat', (data) => {
      console.log('New direct chat message received:', data);
      handleNewMessage(data);
    });

    // Handle message sent confirmation
    socket.on('message-sent', (data) => {
      console.log("THIS STEP WORKS PART 1")
      console.log('Message sent confirmation received:', data);
      if (data.status === 'success' && data.message) {
        console.log('Adding sent message to current conversation:', data.message);
        dispatch(AddMessage(data.message));
      }
    });

    // Handle chat history
    socket.on('chat-history', (data) => {
      console.log('Chat history received:', data);
      handleChatHistory(data);
    });

    // Handle typing events
    socket.on('start-typing', (data) => {
      console.log('Start typing event received:', data);
      if (data.conversationId && data.typingUserId) {
        handleTypingEvent(data.conversationId, data.typingUserId, true);
      }
    });

    socket.on('stop-typing', (data) => {
      console.log('Stop typing event received:', data);
      if (data.conversationId && data.typingUserId) {
        handleTypingEvent(data.conversationId, data.typingUserId, false);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Socket error occurred');
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-direct-chat');
      socket.off('message-sent');
      socket.off('chat-history');
      socket.off('start-typing');
      socket.off('stop-typing');
      socket.off('error');
    };
  }, [socket, dispatch]);

  // Handle new message
  const handleNewMessage = (data) => {
    const { conversationId, message } = data;
    
    console.log('New message received:', data);
    
    // Only add the message if it's for the current conversation
    if (current_conversation && current_conversation._id === conversationId) {
      console.log("THIS STEP WORKS PART 2")
      console.log('Adding message to current conversation:', message);
      dispatch(AddMessage(message));
    } else {
      console.log('Message is for a different conversation');
    }
  };

  // Handle chat history
  const handleChatHistory = (data) => {
    const { conversationId, history } = data;

    // Only update if it's for the current conversation
    if (current_conversation && current_conversation._id === conversationId) {
      console.log('Updating chat history for conversation:', conversationId, history);
      dispatch(UpdateMessages(history));
    }
  };

  // Handle typing events
  const handleTypingEvent = (conversationId, typingUserId, isTyping) => {
    // Only update if it's for the current conversation
    if (current_conversation && current_conversation._id === conversationId) {
      console.log(`User ${typingUserId} is ${isTyping ? 'typing' : 'not typing'} in conversation ${conversationId}`);
      dispatch(SetTyping(conversationId, typingUserId, isTyping));
    }
  };

  // Handle user status changes
  const handleUserStatusChange = (userId, status) => {
    console.log(`User ${userId} is now ${status}`);

    // Update the status in current conversation if it's the other participant
    if (current_conversation) {
      const otherParticipant = current_conversation.participants?.find(
        (participant) => participant._id === userId
      );

      if (otherParticipant) {
        // Update the participant's status in the current conversation
        // This is a simple approach - in a real app, you'd want to update
        // the user's status in a global users store
        console.log(`Updating ${otherParticipant.name} status to ${status}`);
      }
    }
  };

  // Socket methods with useCallback to prevent infinite re-renders
  const sendMessage = useCallback((messageData) => {
    if (socket && isConnected) {
      socket.emit('new-message', messageData);
    } else {
      console.error('Cannot send message: not connected to server');
      toast.error('Cannot send message: not connected to server');
    }
  }, [socket, isConnected]);

  const requestChatHistory = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('direct-chat-history', { conversationId });
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((userId, conversationId) => {
    if (socket && isConnected) {
      console.log('Emitting start-typing:', { userId, conversationId });
      socket.emit('start-typing', { userId, conversationId });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((userId, conversationId) => {
    if (socket && isConnected) {
      console.log('Emitting stop-typing:', { userId, conversationId });
      socket.emit('stop-typing', { userId, conversationId });
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    sendMessage,
    requestChatHistory,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
