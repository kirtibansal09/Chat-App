import { createSlice } from "@reduxjs/toolkit";
import  axiosInstance  from "../../utils/axios";

const initialState = {
  isLoading: false,
  error: null,
  token: null,
  user: {},
  isLoggedIn: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setError(state, action) {
      state.error = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
});

export default slice.reducer;

const { setError, setLoading } = slice.actions;

// ** REGISTER USER
export function RegisterUser(formData) {
  return async (dispatch, getState) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    const reqBody = {
      ...formData,
    };

    // MAKE API CALL
    await axiosInstance
      .post("/auth/signup", reqBody, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
        dispatch(setError(error));
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}
