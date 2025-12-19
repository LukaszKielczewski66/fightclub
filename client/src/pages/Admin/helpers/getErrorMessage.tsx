export function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "message" in err) {
    const e = err as { message?: unknown };
    if (typeof e.message === "string") return e.message;
  }
  return fallback;
}
