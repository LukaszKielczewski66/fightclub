import { useAuth } from "@/features/auth/useAuth";
import HomePublic from "./HomePublic";
import HomeAdmin from "./HomeAdmin";
import HomeTrainer from "./HomeTrainer";
import HomeClient from "./HomeClient";

export default function Home() {
  const { user } = useAuth();

  if (!user) return <HomePublic />;

  switch (user.role) {
    case "admin":
      return <HomeAdmin />;
    case "trainer":
      return <HomeTrainer />;
    case "client":
      return <HomeClient />;
    default:
      return <HomePublic />;
  }
}
