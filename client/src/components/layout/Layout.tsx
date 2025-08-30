import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/health">Health</Link>
        </nav>
      </header>
      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
      <footer style={{ padding: 12, borderTop: "1px solid #eee", fontSize: 12, color: "#666" }}>
        © {new Date().getFullYear()} FightClub
      </footer>
    </div>
  );
}
