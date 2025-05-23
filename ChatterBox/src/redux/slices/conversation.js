import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axios";

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
  },
  group_chat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((el) => {
        const this_user = el.participants.find(
          (elm) => elm._id.toString() !== action.payload.user_id
        );

        return {
          id: el._id,
          user_id: this_user._id,
          name: `${this_user.firstName} ${this_user.lastName}`,
          online: true,
        };
      });

      state.direct_chat.conversations = list;
    },
    setConversations(state, action) {
      state.direct_chat.conversations = action.payload;
    },
  },
});

export default slice.reducer;

export const FetchDirectConversations = ({ conversations, user_id }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.fetchDirectConversations({ conversations, user_id })
    );
  };
};

// getting all the users to show on the chatlist
export const GetAllUsers = (authToken) => async (dispatch) => {
  if (!authToken) {
    console.log("NO AUTH TOKEN FOUND!");
    return;
  }

  try {
    console.log("GETTING ALL USERS");
    const response = await axiosInstance.get("/user/users", {
      headers: { authorization: `Bearer ${authToken}` },
    });

    // console.log("RECEIVING RESPONSE DATA", response.data.data);
    const { users } = response.data.data;
    dispatch(slice.actions.setConversations(users));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};
