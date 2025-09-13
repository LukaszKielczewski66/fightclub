import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>

      {user ? (
          <>
            <Link to="/app">App</Link>
            {(user.role === "trainer" || user.role === "admin") && <Link to="/trainer">Trainer</Link>}
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <span style={{ marginLeft: "auto" }}>
              {user.name} ({user.role})
            </span>
            <button onClick={logout}>Wyloguj</button>
          </>
        ) : (
          <Link to="/login">Zaloguj</Link>
        )}
      </nav>

      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
