import { PropsWithChildren } from "react";
import { useAuth } from "@/features/auth/useAuth";


export default function RoleGate({ roles, children }: PropsWithChildren<{ roles: Array<"admin"|"trainer"|"user"> }>) {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) return <div>Brak uprawnień</div>;
  return <>{children}</>;
}
