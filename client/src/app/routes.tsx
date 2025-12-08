/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import RoleGate from "@/features/auth/RoleGate";

const AdminPage = () => <div>Panel admina</div>;
const TrainerPage = () => <div>Kalendarz trenera</div>;
const ClientPage = () => <div>Widok klienta</div>;

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "app", element: <RoleGate roles={["user","trainer","admin"]}><ClientPage/></RoleGate> },
          { path: "trainer", element: <RoleGate roles={["trainer","admin"]}><TrainerPage/></RoleGate> },
          { path: "admin", element: <RoleGate roles={["admin"]}><AdminPage/></RoleGate> },
        ]
      }
    ]
  },
  { path: "*", element: <div>404</div> }
]);
