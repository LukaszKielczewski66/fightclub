import { useContext } from "react";
import { ThemeCtx } from "./ThemeContext";

export function useThemeMode() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeProviderCustom");
  return ctx;
}
