/* eslint-disable @typescript-eslint/no-explicit-any */
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const err = useRouteError();
  if (isRouteErrorResponse(err)) {
    return (
      <div>
        <h1>Oops!</h1>
        <p>Status: {err.status}</p>
        <pre>{err.statusText}</pre>
      </div>
    );
  }
  return (
    <div>
      <h1>Coś poszło nie tak</h1>
      <pre>{String((err as any)?.message ?? err)}</pre>
    </div>
  );
}
