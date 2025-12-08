/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import RoleGate from "@/features/auth/RoleGate";
import Bookings from "@/pages/Bookings/Bookings";
import { UserSchedule } from "@/pages/Schedule/UserSchedule";

const AdminPage = () => <div>Panel admina</div>;
const TrainerPage = () => <div>Kalendarz trenera</div>;
const AppPage = () => <div>Panel aplikacji (trener/admin)</div>;
const UserHistoryPage = () => <div>Historia aktywności</div>;

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
          {
            path: "app",
            element: (
              <RoleGate roles={["trainer", "admin"]}>
                <AppPage />
              </RoleGate>
            ),
          },

          {
            path: "trainer",
            element: (
              <RoleGate roles={["trainer", "admin"]}>
                <TrainerPage />
              </RoleGate>
            ),
          },

          {
            path: "admin",
            element: (
              <RoleGate roles={["admin"]}>
                <AdminPage />
              </RoleGate>
            ),
          },

          {
            path: "bookings",
            element: (
              <RoleGate roles={["user"]}>
                <Bookings />
              </RoleGate>
            ),
          },

          {
            path: "history",
            element: (
              <RoleGate roles={["user"]}>
                <UserHistoryPage />
              </RoleGate>
            ),
          },
          {
            path: "schedule",
            element: <RoleGate roles={["user"]}>
              <UserSchedule />
            </RoleGate>
          }
        ],
      },
    ],
  },
  { path: "*", element: <div>404</div> },
]);
