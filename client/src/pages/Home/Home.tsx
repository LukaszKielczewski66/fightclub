import { useAuth } from "@/features/auth/useAuth";
import HomePublic from "./HomePublic";
import HomeTrainer from "./HomeTrainer";
import HomeClient from "./HomeClient";
import { AdminUsers } from "../Admin/AdminUsers";

export default function Home() {
  const { user } = useAuth();

  if (!user) return <HomePublic />;

  switch (user.role) {
    case "admin":
      return <AdminUsers />;
    case "trainer":
      return <HomeTrainer />;
    case "user":
      return <HomeClient />;
    default:
      return <HomePublic />;
  }
}
