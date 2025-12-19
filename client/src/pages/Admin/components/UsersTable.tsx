import { Alert, Snackbar, TablePagination, Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useUsers } from "@/features/admin/useUsers";
import { AdminUserListItem, Role } from "@/types/adminUsers";
import { UsersTableView } from "./UserTableView";
import { UserEditDialog } from "./UserEditDialog";
import { useUpdateUser } from "@/features/admin/useUpdateUser";
import { UsersFilters, UsersFiltersState } from "./UsersFilters";

function useDebouncedValue<T>(value: T, delayMs = 350) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export const UsersTable = () => {
  const [page0, setPage0] = useState(0);

  const [filters, setFilters] = useState<UsersFiltersState>({
    query: "",
    role: "all",
    active: "all",
    sort: "createdAt:desc",
    limit: 20,
  });

  const debouncedQuery = useDebouncedValue(filters.query, 350);

  const params = useMemo(() => {
    return {
      page: page0 + 1,
      limit: filters.limit,
      query: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
      role: filters.role === "all" ? undefined : (filters.role as Role),
      active:
        filters.active === "all"
          ? undefined
          : filters.active === "true"
            ? true
            : false,
      sort: filters.sort,
    };
  }, [page0, filters.limit, filters.role, filters.active, filters.sort, debouncedQuery]);

  const { data, isLoading, isError } = useUsers(params);
  const users = data?.items ?? [];
  const total = data?.total ?? 0;

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

  const handleSubmitEdit = async (payload: { name: string; role: Role; active: boolean }) => {
    if (!editingUser) return;
    setEditError(null);

    try {
      await updateUser({
        id: editingUser.id,
        data: payload,
      });
      setSuccessOpen(true);
      handleCloseEdit();
    } catch (err: unknown) {
      let msg = "Nie udało się zaktualizować użytkownika";
      if (err && typeof err === "object") {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? msg;
      }
      setEditError(msg);
    }
  };

  const handleChangeFilters = (next: UsersFiltersState) => {
    setFilters(next);
    setPage0(0);
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <UsersFilters value={filters} onChange={handleChangeFilters} />
      </Box>

      <UsersTableView users={users} isLoading={isLoading} isError={isError} onEdit={handleOpenEdit} />

      <TablePagination
        component="div"
        count={total}
        page={page0}
        onPageChange={(_, nextPage) => setPage0(nextPage)}
        rowsPerPage={filters.limit}
        onRowsPerPageChange={(e) =>
          handleChangeFilters({ ...filters, limit: Number(e.target.value) as UsersFiltersState["limit"] })
        }
        rowsPerPageOptions={[10, 20, 50, 100]}
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
        <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          Zapisano zmiany użytkownika.
        </Alert>
      </Snackbar>
    </>
  );
};
