import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk, logout as logoutAction, restoreSession, selectAuth } from "@/store/slices/auth.slice";
import type { User } from "./auth.types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, status, error } = useAppSelector(selectAuth);

  return {
    user, token, status, error,

    async login(email: string, password: string) {
      const res = await dispatch(loginThunk({ email, password })).unwrap();
      localStorage.setItem("session", JSON.stringify({ token: res.accessToken, user: res.user }));
      return res; 
    },

    logout() {
      localStorage.removeItem("session");
      dispatch(logoutAction());
    },

    restoreFromStorage() {
      const raw = localStorage.getItem("session");
      if (!raw) return;
      try {
        const { token, user } = JSON.parse(raw) as { token: string; user: User };
        if (token && user) dispatch(restoreSession({ token, user }));
      } catch {
        console.error('error auth')
      }
    },
  };
}