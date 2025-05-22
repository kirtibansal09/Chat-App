import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";

const initialState = {
  modals: {
    gif: false,
    audio: false,
    media: false,
    doc: false,
  },
  selectedGifUrl: "",
  friends: [],
  friendRequests: {
    incoming: [],
    outgoing: []
  },
  chat_type: null, // individual / group
  room_id: null,
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateGifModal(state, action) {
      state.modals.gif = action.payload.value;
      state.selectedGifUrl = action.payload.url;
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
    },
    // deselecting chat when user logs out
    deselectConversation(state, action) {
      state.chat_type = null;
      state.room_id = null;
    },
  },
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

export const DeSelectConversation = () => {
  return (dispatch, getState) => {
    dispatch(slice.actions.deselectConversation());
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
