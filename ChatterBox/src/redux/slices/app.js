import { createSlice, createAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";

// Create the action outside the slice
export const setSelectedGifUrl = createAction('app/setSelectedGifUrl');

const initialState = {
  modals: {
    media: false,
    doc: false,
    gif: false,  // Changed from giphy to gif to match updateGifModal
    audio: false,
  },
  selectedGifUrl: "",
  friends: [],
  friendRequests: {
    incoming: [],
    outgoing: []
  },
  chat_type: null, // individual / group
  room_id: null,
  current_conversation: null, // Store the current conversation data
  current_messages: [], // Store messages for the current conversation
  typing_users: {}, // Store typing status for conversations
  messageStatus: {}, // Map of messageId to status (sent, delivered, read)
  call: {
    open: false,
    isCaller: false,
    incomingOffer: null,
    incomingCallPending: false,
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateGifModal(state, action) {
      state.modals.gif = action.payload.value;
      state.selectedGifUrl = action.payload.url;
    },
    // Add a reducer to handle the setSelectedGifUrl action
    setGifUrl(state, action) {
      state.selectedGifUrl = action.payload;
    },
    updateAudioModal(state, action) {
      state.modals.audio = action.payload;
    },
    updateMediaModal(state, action) {
      state.modals.media = action.payload;
    },
    updateDocumentModal(state, action) {
      state.modals.doc = action.payload;
    },
    updateFriends(state, action) {
      state.friends = action.payload;
    },
    updateFriendRequests(state, action) {
      state.friendRequests = action.payload;
    },
    // selecting the conversations
    selectConversation(state, action) {
      state.chat_type = "individual";
      state.room_id = action.payload.room_id;
      state.current_conversation = action.payload.conversation || null;
      state.current_messages = action.payload.conversation?.messages || [];
      
      // Initialize message statuses for all messages
      if (action.payload.conversation?.messages) {
        const initialStatuses = {};
        action.payload.conversation.messages.forEach(message => {
          initialStatuses[message._id] = message.status || "sent";
        });
        state.messageStatus = {
          ...state.messageStatus,
          ...initialStatuses
        };
      }
    },
    // deselecting chat when user logs out
    deselectConversation(state, action) {
      state.chat_type = null;
      state.room_id = null;
      state.current_conversation = null;
      state.current_messages = [];
      state.typing_users = {};
    },
    // add new message to current conversation
    AddMessage: (state, action) => {
      const newMessage = action.payload;
      // Initialize message status if not present
      if (!state.messageStatus[newMessage._id]) {
        state.messageStatus[newMessage._id] = newMessage.status || 'sent';
      }
      state.current_messages.push(newMessage);
    },
    // update messages for current conversation
    updateMessages(state, action) {
      state.current_messages = action.payload;
    },
    // typing indicators
    setTyping(state, action) {
      const { conversationId, userId, isTyping } = action.payload;

      // Ensure typing_users object exists
      if (!state.typing_users) {
        state.typing_users = {};
      }

      if (!state.typing_users[conversationId]) {
        state.typing_users[conversationId] = {};
      }

      if (isTyping) {
        state.typing_users[conversationId][userId] = true;
      } else {
        delete state.typing_users[conversationId][userId];
      }
    },
    toggleMediaModal(state, action) {
      state.modals.media = action.payload;
    },
    toggleDocumentModal(state, action) {
      state.modals.doc = action.payload;
    },
    toggleGifModal(state, action) {  // Changed from toggleGiphyModal to match the state
      state.modals.gif = action.payload;
    },
    toggleAudioModal(state, action) {
      state.modals.audio = action.payload;
    },
    // Add message status reducer
    SetMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      // Only update if the new status is "higher" than the current one
      const currentStatus = state.messageStatus[messageId];
      const statusOrder = { sent: 0, delivered: 1, read: 2 };
      
      if (!currentStatus || statusOrder[status] > statusOrder[currentStatus]) {
        state.messageStatus[messageId] = status;
      }
    },
    // Update multiple message statuses
    UpdateMessageStatuses: (state, action) => {
      const { statuses } = action.payload;
      state.messageStatus = {
        ...state.messageStatus,
        ...statuses
      };
    },
    // Call handling
    openCallModal: (state, action) => {
      if (!state.call) {
        state.call = {};
      }
      state.call.open = true;
      state.call.incomingCallPending = false;
      state.call.isCaller = action.payload.isCaller;
      if (action.payload.offer) {
        state.call.incomingOffer = action.payload.offer;
      }
    },
    closeCallModal: (state) => {
      if (!state.call) {
        state.call = {};
      }
      state.call.open = false;
      state.call.isCaller = false;
      state.call.incomingOffer = null;
      state.call.incomingCallPending = false;
    },
    setIncomingCall: (state, action) => {
      if (!state.call) {
        state.call = {};
      }
      state.call.incomingCallPending = true;
      state.call.incomingOffer = action.payload.offer;
    },
  },
  // Add extraReducers to handle the external action
  extraReducers: (builder) => {
    builder.addCase(setSelectedGifUrl, (state, action) => {
      state.selectedGifUrl = action.payload;
    });
  }
});

export default slice.reducer;

// Modal actions
export const ToggleGifModal = (value) => async (dispatchEvent, getState) => {
  dispatchEvent(slice.actions.updateGifModal(value));
};

export const ToggleAudioModal = (value) => async (dispatch, getState) => {
  dispatch(slice.actions.updateAudioModal(value));
};

export const ToggleMediaModal = (value) => async (dispatch, getState) => {
  dispatch(slice.actions.updateMediaModal(value));
};

export const ToggleDocumentModal = (value) => async (dispatch, getState) => {
  dispatch(slice.actions.updateDocumentModal(value));
};

// Friend actions
export const UpdateFriends = (value) => {
  return (dispatch, getState) => {
    dispatch(slice.actions.updateFriends(value));
  };
};

export const SelectConversation = (value) => {
  return (dispatch, getState) => {
    dispatch(slice.actions.selectConversation(value));
  };
};

// Start or get existing conversation
export const StartConversation = (userId, authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("STARTING CONVERSATION WITH USER:", userId);
    const response = await axiosInstance.post(
      "/user/start-conversation",
      { userId },
      {
        headers: { authorization: `Bearer ${authToken}` },
      }
    );

    const { conversation } = response.data.data;
    console.log("CONVERSATION DATA:", conversation);
    console.log("CONVERSATION ID:", conversation._id);

    // Select the conversation with the conversation data
    dispatch(SelectConversation({
      room_id: userId,
      conversation: conversation
    }));

    return conversation;
  } catch (error) {
    console.error("Error starting conversation:", error);
    toast.error("Failed to start conversation");
  }
};

export const DeSelectConversation = () => {
  return (dispatch, getState) => {
    dispatch(slice.actions.deselectConversation());
  };
};

// Message actions
export const AddMessage = (message) => (dispatch, getState) => {
  console.log('Adding message to Redux store:', message);
  
  const { current_conversation } = getState().app;
  
  if (!current_conversation) {
    console.error('No current conversation to add message to');
    return;
  }
  
  console.log('Current conversation ID:', current_conversation._id);
  
  dispatch(slice.actions.AddMessage(message));
};

export const UpdateMessages = (messages) => {
  return (dispatch, getState) => {
    dispatch(slice.actions.updateMessages(messages));
  };
};

// Message status actions
export const SetMessageStatus = (messageId, status) => {
  return (dispatch) => {
    dispatch(slice.actions.SetMessageStatus({ messageId, status }));
  };
};

// Typing actions
export const SetTyping = (conversationId, userId, isTyping) => {
  return (dispatch, getState) => {
    console.log('SetTyping action called with:', { conversationId, userId, isTyping });
    dispatch(slice.actions.setTyping({ conversationId, userId, isTyping }));
  };
};

// Get all friends
export const GetFriends = (authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("GETTING FRIENDS");
    const response = await axiosInstance.get("/friends", {
      headers: { authorization: `Bearer ${authToken}` },
    });

    console.log("Friends API response:", response.data);

    if (response.data && response.data.status === "success") {
      const friends = response.data.data.friends || [];
      console.log("Friends list:", friends);

      // Format friends for UI
      const formattedFriends = friends.map(friend => ({
        id: friend._id,
        user_id: friend._id,
        name: friend.name,
        avatar: friend.avatar,
        status: friend.status || "Offline"
      }));

      dispatch(slice.actions.updateFriends(formattedFriends));
      return formattedFriends;
    }
  } catch (error) {
    console.error("Error fetching friends:", error);
    toast.error("Failed to load friends");
  }
};

// Get friend requests
export const GetFriendRequests = (authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return [];
  }

  try {
    console.log("GETTING FRIEND REQUESTS");
    const response = await axiosInstance.get("/friends/requests", {
      headers: { authorization: `Bearer ${authToken}` },
    });

    console.log("Friend requests API response:", response.data);

    if (response.data && response.data.status === "success") {
      const { incoming, outgoing } = response.data.data;

      dispatch(slice.actions.updateFriendRequests({ incoming, outgoing }));
      return incoming; // Return incoming requests for component use
    }
    return [];
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    toast.error("Failed to load friend requests");
    return [];
  }
};

// Send friend request
export const SendFriendRequest = (recipientId, authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("SENDING FRIEND REQUEST");
    const response = await axiosInstance.post(
      "/friends/send-request",
      { recipientId },
      {
        headers: { authorization: `Bearer ${authToken}` },
      }
    );

    console.log("Send friend request response:", response.data);

    if (response.data && response.data.status === "success") {
      toast.success(response.data.message || "Friend request sent");
      // Refresh friend requests
      dispatch(GetFriendRequests(authToken));
    }
  } catch (error) {
    console.error("Error sending friend request:", error);
    toast.error(error?.response?.data?.message || "Failed to send friend request");
  }
};

// Accept friend request
export const AcceptFriendRequest = (requestId, authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("ACCEPTING FRIEND REQUEST");
    const response = await axiosInstance.patch(
      `/friends/accept/${requestId}`,
      {},
      {
        headers: { authorization: `Bearer ${authToken}` },
      }
    );

    console.log("Accept friend request response:", response.data);

    if (response.data && response.data.status === "success") {
      toast.success(response.data.message || "Friend request accepted");
      // Refresh friend requests and friends list
      dispatch(GetFriendRequests(authToken));
      dispatch(GetFriends(authToken));
      return true;
    }
  } catch (error) {
    console.error("Error accepting friend request:", error);
    toast.error(error?.response?.data?.message || "Failed to accept friend request");
  }
  return false;
};

// Reject friend request
export const RejectFriendRequest = (requestId, authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("REJECTING FRIEND REQUEST");
    const response = await axiosInstance.patch(
      `/friends/reject/${requestId}`,
      {},
      {
        headers: { authorization: `Bearer ${authToken}` },
      }
    );

    console.log("Reject friend request response:", response.data);

    if (response.data && response.data.status === "success") {
      toast.success(response.data.message || "Friend request rejected");
      // Refresh friend requests
      dispatch(GetFriendRequests(authToken));
      return true;
    }
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    toast.error(error?.response?.data?.message || "Failed to reject friend request");
  }
  return false;
};

// Cancel friend request
export const CancelFriendRequest = (requestId, authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("CANCELLING FRIEND REQUEST");
    const response = await axiosInstance.delete(
      `/friends/cancel/${requestId}`,
      {
        headers: { authorization: `Bearer ${authToken}` },
      }
    );

    console.log("Cancel friend request response:", response.data);

    if (response.data && response.data.status === "success") {
      toast.success(response.data.message || "Friend request cancelled");
      // Refresh friend requests
      dispatch(GetFriendRequests(authToken));
      return true;
    }
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    toast.error(error?.response?.data?.message || "Failed to cancel friend request");
  }
  return false;
};

// Remove friend
export const RemoveFriend = (friendId, authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("REMOVING FRIEND");
    const response = await axiosInstance.delete(
      `/friends/${friendId}`,
      {
        headers: { authorization: `Bearer ${authToken}` },
      }
    );

    console.log("Remove friend response:", response.data);

    if (response.data && response.data.status === "success") {
      toast.success(response.data.message || "Friend removed successfully");
      // Refresh friends list
      dispatch(GetFriends(authToken));
      return true;
    }
  } catch (error) {
    console.error("Error removing friend:", error);
    toast.error(error?.response?.data?.message || "Failed to remove friend");
  }
  return false;
};

// Add these actions to your app.js slice

// Upload media file
export const UploadMedia = (file, token) => async (dispatch) => {
  if (!token) {
    console.error("NO AUTH TOKEN PROVIDED FOR UPLOAD!");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      "/upload/media",
      formData,
      {
        headers: { 
          authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data && response.data.status === "success") {
      toast.success("Media uploaded successfully");
      return response.data.data;
    } else {
      toast.error(response.data?.message || "Failed to upload media");
      return null;
    }
  } catch (error) {
    console.error("Error uploading media:", error);
    toast.error(`Failed to upload media: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// Upload document file
export const UploadDocument = (file, token) => async (dispatch) => {
  if (!token) {
    console.error("NO AUTH TOKEN PROVIDED FOR UPLOAD!");
    return null;
  }

  try {
    console.log('Creating form data for document upload');
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending document upload request');
    const response = await axiosInstance.post(
      "/upload/document",  // Change this to match your backend route structure
      formData,
      {
        headers: { 
          authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('Document upload response:', response.data);

    if (response.data && response.data.status === "success") {
      toast.success("Document uploaded successfully");
      return response.data.data;
    } else {
      toast.error(response.data?.message || "Failed to upload document");
      return null;
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    console.error("Error response:", error.response?.data);
    toast.error(`Failed to upload document: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// Send GIF message
export const SendGifMessage = (gifUrl, message, conversationId, token) => async (dispatch) => {
  if (!token) {
    console.error("NO AUTH TOKEN PROVIDED FOR GIF SEND!");
    return null;
  }

  if (!gifUrl) {
    console.error("NO GIF URL PROVIDED!");
    return null;
  }

  if (!conversationId) {
    console.error("NO CONVERSATION ID PROVIDED!");
    return null;
  }

  try {
    console.log('Sending GIF message with URL:', gifUrl);
    
    // Prepare the message data
    const messageData = {
      conversationId: conversationId,
      message: {
        content: message || 'Sent a GIF',
        type: 'Media', // Use Media type for GIFs
        giphyUrl: gifUrl
      }
    };

    // Use socket to send the message
    const socket = getSocket();
    
    return new Promise((resolve, reject) => {
      socket.emit('new-message', messageData, (response) => {
        if (response && response.status === 'error') {
          console.error('Error sending GIF message:', response.message);
          toast.error(`Failed to send GIF: ${response.message}`);
          reject(response.message);
        } else {
          console.log('GIF message sent successfully');
          toast.success("GIF sent successfully");
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error("Error sending GIF message:", error);
    toast.error(`Failed to send GIF: ${error.message}`);
    return null;
  }
};

// Helper function to get socket instance
const getSocket = () => {
  // This is a simple implementation - you might need to adjust based on how you manage sockets
  return window.socket; // Assuming socket is stored globally
};

// Export the actions
export const { 
  toggleMediaModal,
  toggleDocumentModal,
  toggleGifModal,  // Changed from toggleGiphyModal
  toggleAudioModal,
  setGifUrl
} = slice.actions;

// Or if you want to keep the original export names:
export const ToggleGiphyModal = (value) => (dispatch) => {
  dispatch(slice.actions.toggleGifModal(value));
};

// Add new actions
export const UpdateMessageStatuses = (statuses) => {
  return (dispatch) => {
    dispatch(slice.actions.UpdateMessageStatuses(statuses));
  };
};

// Call actions
export const openCallModal = (callData) => (dispatch) => {
  dispatch(slice.actions.openCallModal(callData));
};

export const closeCallModal = () => (dispatch) => {
  dispatch(slice.actions.closeCallModal());
};

export const setIncomingCall = (callData) => (dispatch) => {
  dispatch(slice.actions.setIncomingCall(callData));
};
