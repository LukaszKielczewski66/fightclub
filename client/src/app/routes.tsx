/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import RoleGate from "@/features/auth/RoleGate";

// USER
import { UserSchedule } from "@/pages/Schedule/UserSchedule";
import Bookings from "@/pages/Bookings/BookingsPage";
import HistoryPage from "@/pages/History/HistoryPage";

// TRAINER
import TrainerProfile from "@/pages/Trainer/TrainerProfile";
import TrainerCreateSessions from "@/pages/Trainer/TrainerCreateSessions";
import TrainerMySessions from "@/pages/Trainer/TrainerMySessions";
import TrainerAttendance from "@/pages/Trainer/TrainerAttendance";
import TrainerParticipants from "@/pages/Trainer/TrainerParticipants";
import TrainerReports from "@/pages/Trainer/TrainerReports";

// ADMIN 
const AdminPage = () => <div>Panel admina</div>;

const AppPage = () => <div>Panel aplikacji (trener/admin)</div>;

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
          // ======================
          // USER
          // ======================
          {
            path: "user",
            element: (
              <RoleGate roles={["user"]}>
                <Outlet />
              </RoleGate>
            ),
            children: [
              { index: true, element: <Home /> },
              { path: "schedule", element: <UserSchedule /> },
              { path: "bookings", element: <Bookings /> },
              { path: "history", element: <HistoryPage /> },
            ],
          },

          // ======================
          // TRAINER
          // ======================
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

          // ======================
          // ADMIN
          // ======================
          {
            path: "admin",
            element: (
              <RoleGate roles={["admin"]}>
                <AdminPage />
              </RoleGate>
            ),
          },

          { path: "schedule", element: <Navigate to="/user/schedule" replace /> },
          { path: "bookings", element: <Navigate to="/user/bookings" replace /> },
          { path: "history", element: <Navigate to="/user/history" replace /> },
          {
            path: "app",
            element: (
              <RoleGate roles={["trainer", "admin"]}>
                <AppPage />
              </RoleGate>
            ),
          },
        ],
      },
    ],
  },

  { path: "*", element: <div>404</div> },
]);
