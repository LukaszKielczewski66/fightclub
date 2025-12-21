import { useEffect, type PropsWithChildren } from "react";
import { registerLogout } from "./authStore";
import { store } from "@/store/store";
import { logout as logoutAction } from "@/store/slices/auth.slice";

export function AuthProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    registerLogout(() => {
      localStorage.removeItem("session");
      store.dispatch(logoutAction());
    });
  }, []);

  return <>{children}</>;
}
