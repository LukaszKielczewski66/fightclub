// src/features/admin/UsersTable.tsx
import {
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useUsers } from "@/features/admin/useUsers";
import { AdminUserListItem } from "@/types/adminUsers";
import { Role } from "@/features/auth/auth.types";
import { UsersTableView } from "./UserTableView";
import { UserEditDialog } from "./UserEditDialog";
import { useUpdateUser } from "@/features/admin/useUpdateUser";


export const UsersTable = () => {
  const { data, isLoading, isError } = useUsers();
  const users = data?.items ?? [];

  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleOpenEdit = (user: AdminUserListItem) => {
    setEditingUser(user);
    setEditError(null);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditError(null);
  };

  const handleSubmitEdit = async (data: { name: string; role: Role; active: boolean }) => {
    if (!editingUser) return;
    setEditError(null);

    try {
      await updateUser({
        id: editingUser.id,
        data,
      });
      setSuccessOpen(true);
      handleCloseEdit();
      } catch (err: unknown) {
        let msg = "Nie udało się zaktualizować użytkownika";

        if (err && typeof err === "object") {
          const axiosErr = err as { response?: { data?: { message?: string } }, message?: string };

          msg =
            axiosErr?.response?.data?.message ??
            axiosErr?.message ??
            msg;
        }

        setEditError(msg);
      }
  };

  return (
    <>
      <UsersTableView
        users={users}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleOpenEdit}
      />

      <UserEditDialog
        open={!!editingUser}
        user={editingUser}
        loading={isUpdating}
        error={editError}
        onClose={handleCloseEdit}
        onSubmit={handleSubmitEdit}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Zapisano zmiany użytkownika.
        </Alert>
      </Snackbar>
    </>
  );
};
