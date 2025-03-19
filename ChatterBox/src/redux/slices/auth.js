import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";
import axios from "axios";

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
    loginSuccess(state, action) {
      state.token = action.payload;
      state.isLoggedIn = true;
    },
    logoutSuccess(state, action) {
      state.token = null;
      state.isLoggedIn = false;
    },
  },
});

export default slice.reducer;

const { setError, setLoading, loginSuccess, logoutSuccess } = slice.actions;

// ** REGISTER USER
export function RegisterUser(formData, navigate) {
  return async (dispatch, getState) => {
    dispatch(setError(null));
    dispatch(setLoading(true));
    console.log("AXIOS REGISTER CALL");

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

        toast.success(response.data.message);
      })
      .catch(function (error) {
        console.log(error);
        dispatch(setError(error));

        toast.error(error?.message || "Something went wrong!");
      })
      .finally(() => {
        dispatch(setLoading(false));
        console.log("FINALLY BLOCK");
        if (!getState().auth.error) {
          navigate(`/auth/verify?email=${formData.email}`);
        }
      });
  };
}

// RESEND OTP
export function ResendOTP(email) {
  return async (dispatch, getState) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    // MAKE API CALL
    await axiosInstance
      .post(
        "/auth/resend-otp",
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response.data);
        toast.success(response.data.message);
      })
      .catch(function (error) {
        console.log(error);
        dispatch(setError(error));

        toast.error(error?.message || "Something went wrong!");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// VERIFY OTP
export function VerifyOTP(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    await axiosInstance
      .post(
        "/auth/verify",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response.data);

        const { token, message } = response.data;

        dispatch(loginSuccess(token));

        toast.success(message || "Email Verified Successfully!");
      })
      .catch(function (error) {
        console.log(error);
        dispatch(setError(error));

        toast.error(error?.message || "Something went wrong!");
      })
      .finally(() => {
        dispatch(setLoading(false));

        if (!getState().auth.error) {
          navigate("/dashboard");
        }
      });
  };
}

// LOGIN USER
export function LoginUser(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    await axiosInstance
      .post(
        "/auth/login",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response.data);

        const { token, message } = response.data;

        dispatch(loginSuccess(token));

        toast.success(message || "Logged In Successfully!");
      })
      .catch(function (error) {
        console.log(error);
        dispatch(setError(error));

        toast.error(error?.message || "Something went wrong!");
      })
      .finally(() => {
        dispatch(setLoading(false));

        if (!getState().auth.error) {
          navigate("/dashboard");
        }
      });
  };
}

export function LogoutUser(navigate) {
  return async (dispatch, getState) => {
    try {
      dispatch(logoutSuccess());
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.log(error);
    }
  };
}
