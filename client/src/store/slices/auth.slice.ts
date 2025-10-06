import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { loginApi } from "@/services/api/auth";
import type { RootState } from "@/store/store";
import type { User } from "@/features/auth/auth.types";
import { initialState } from "@/types/authTypes";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    const res = await loginApi(payload.email, payload.password);
    return res;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreSession(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "succeeded";
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Błąd logowania";
      });
  },
});

export const { logout, restoreSession } = authSlice.actions;

export const selectAuth = (s: RootState) => s.auth;
export const selectUser = (s: RootState) => s.auth.user;
export const selectToken = (s: RootState) => s.auth.token;

export default authSlice.reducer;
