import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import type { User } from "@/features/auth/auth.types";
import { AuthState } from "@/types/authTypes";

function loadPreloadedAuth(): { auth: AuthState } | undefined {
  try {
    const raw = localStorage.getItem("session");
    if (!raw) return undefined;

    const { token, user } = JSON.parse(raw) as { token?: string; user?: User };
    if (!token || !user) return undefined;

    const auth: AuthState = {
      user,
      token,
      status: "succeeded",
      error: null,
    };

    return { auth };
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadPreloadedAuth(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
