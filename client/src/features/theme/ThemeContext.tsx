import { createContext } from "react";

export type Mode = "light" | "dark";

export type ThemeCtxType = {
  mode: Mode;
  toggleMode: () => void;
};

export const ThemeCtx = createContext<ThemeCtxType | null>(null);
