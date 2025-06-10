// import { createSlice } from "@reduxjs/toolkit";
// import axiosInstance from "../../utils/axios";

// const initialState = {
//   currentUser: null,
//   loading: false,
//   error: null,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     getUserStart(state) {
//       state.loading = true;
//     },
//     getUserSuccess(state, action) {
//       state.currentUser = action.payload;
//       state.loading = false;
//     },
//     getUserFail(state, action) {
//       state.error = action.payload;
//       state.loading = false;
//     },
//     updateUserSuccess(state, action) {
//       state.currentUser = { ...state.currentUser, ...action.payload };
//     },
//   },
// });

// export default userSlice.reducer;

// export const {
//   getUserStart,
//   getUserSuccess,
//   getUserFail,
//   updateUserSuccess,
// } = userSlice.actions;

// // Async Thunks
// export const fetchUserProfile = (token) => async (dispatch) => {
//   dispatch(getUserStart());
//   try {
//     const res = await axiosInstance.get("/user/me", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     dispatch(getUserSuccess(res.data.data.user));
//   } catch (error) {
//     dispatch(getUserFail(error.message));
//   }
// };

// export const updateUserProfile = (data, token) => async (dispatch) => {
//   try {
//     if (!token) {
//       console.error("No auth token provided.");
//       return;
//     }

//     const res = await axiosInstance.patch("/user/me", data, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     dispatch(updateUserSuccess(res.data.data.user));
//   } catch (error) {
//     console.error("Update failed:", error);
//   }
// };

// export const updateUserAvatar = (avatarData, token) => async (dispatch) => {
//   try {
//     if (!token) {
//       console.error("No auth token provided.");
//       return;
//     }

//     await axiosInstance.patch(
//       "/user/avatar",
//       { avatar: avatarData },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     dispatch(fetchUserProfile());
//   } catch (error) {
//     console.error("Avatar update failed:", error);
//   }
// };


import axiosInstance from "../../utils/axios";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getUserStart(state) {
      state.loading = true;
    },
    getUserSuccess(state, action) {
      state.currentUser = action.payload;
      state.loading = false;
    },
    getUserFail(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    updateUserSuccess(state, action) {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
});

export default userSlice.reducer;

export const {
  getUserStart,
  getUserSuccess,
  getUserFail,
  updateUserSuccess,
} = userSlice.actions;

// Async Thunks
export const fetchUserProfile = (token) => async (dispatch) => {
  dispatch(getUserStart());
  try {
    const res = await axiosInstance.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    dispatch(getUserSuccess(res.data.data.user));
  } catch (error) {
    dispatch(getUserFail(error.message));
  }
};

export const updateUserProfile = (data, token) => async (dispatch) => {
  try {
    if (!token) {
      console.error("No auth token provided.");
      return;
    }

    await axiosInstance.patch("/user/me", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Fetch the latest user profile after update
    dispatch(fetchUserProfile(token));
  } catch (error) {
    console.error("Update failed:", error);
  }
};

export const updateUserAvatar = (avatarData, token) => async (dispatch) => {
  try {
    if (!token) {
      console.error("No auth token provided.");
      return;
    }

    await axiosInstance.patch(
      "/user/avatar",
      { avatar: avatarData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    dispatch(fetchUserProfile(token));
  } catch (error) {
    console.error("Avatar update failed:", error);
  }
};