let logoutFn: (() => void) | null = null;

export function registerLogout(fn: () => void) {
  logoutFn = fn;
}

export function triggerLogout() {
  logoutFn?.();
}
