/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import RoleGate from "@/features/auth/RoleGate";
import Bookings from "@/pages/Bookings/Bookings";
import { UserSchedule } from "@/pages/Schedule/UserSchedule";
import TrainerProfile from "@/pages/Trainer/TrainerProfile";
import TrainerCreateSessions from "@/pages/Trainer/TrainerCreateSessions";
import TrainerMySessions from "@/pages/Trainer/TrainerMySessions";
import TrainerAttendance from "@/pages/Trainer/TrainerAttendance";
import TrainerParticipants from "@/pages/Trainer/TrainerParticipants";
import TrainerReports from "@/pages/Trainer/TrainerReports";



const AdminPage = () => <div>Panel admina</div>;
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
                <Outlet />
              </RoleGate>
            ),
            children: [
              { index: true, element: <TrainerProfile /> },
              { path: "schedule", element: <TrainerCreateSessions /> },
              { path: "my-sessions", element: <TrainerMySessions /> },
              { path: "attendance", element: <TrainerAttendance /> },
              { path: "participants", element: <TrainerParticipants /> },
              { path: "reports", element: <TrainerReports /> },
            ],
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
