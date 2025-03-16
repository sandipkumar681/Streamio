import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { backendCaller } from "../components/utils/backendCaller";

const initialState = {
  isLoading: false,
  userDetails: {},
  isLoggedIn: null,
  isError: false,
};

export const checkAuth = createAsyncThunk("checkAuth", async () => {
  try {
    const json = await backendCaller("/users/auth/status");
    if (json.success) return json.data;

    const refreshTokenJson = await backendCaller("/users/refresh-tokens");
    if (!refreshTokenJson.success) throw new Error("Refresh Token Not Found!");

    const retryAuthStatusJson = await backendCaller("/users/auth/status");
    if (retryAuthStatusJson.success) return retryAuthStatusJson.data;

    throw new Error("Auth Failed!");
  } catch (error) {
    console.error("Error checking auth status:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    changeIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userDetails = action.payload.userDetails;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.userDetails = action.payload;
    });
    builder.addCase(checkAuth.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
    });
  },
});

export const { changeIsLoggedIn, logout } = loginSlice.actions;

export default loginSlice.reducer;
