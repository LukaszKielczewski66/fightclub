import { createContext } from "react";
import type { AuthState } from "./auth.types";

export const AuthCtx = createContext<AuthState | null>(null);
