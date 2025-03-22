import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modals: {
    gif: false,
    audio: false,
    media: false,
    doc: false,
  },
  selectedGifUrl: "",
  friends: [],
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

export default slice.reducer; //export the property slice.reducer not the slice

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

export const UpdateFriends = (value) => {
  return (dispatch, getState) => {
    dispatch(slice.actions.updateFriends(value));
  };
};

export const SelectConversation = ({ room_id }) => {
  return (dispatch, getState) => {
    dispatch(slice.actions.selectConversation({ room_id }));
  };
};

export const DeSelectConversation = () => {
  return (dispatch, getState) => {
    dispatch(slice.actions.deselectConversation());
  };
};
