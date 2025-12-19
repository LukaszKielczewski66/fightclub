import { AdminUserListItem, Role } from "@/types/adminUsers";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useEffect, useState } from "react";

interface UserEditDialogProps {
  open: boolean;
  user: AdminUserListItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: { name: string; role: Role; active: boolean }) => Promise<void> | void;
}

export const UserEditDialog = ({
  open,
  user,
  loading,
  error,
  onClose,
  onSubmit,
}: UserEditDialogProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (user && open) {
      setName(user.name);
      setRole(user.role);
      setActive(user.active);
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    await onSubmit({ name, role, active });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edycja użytkownika</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>

        <TextField
          label="Imię i nazwisko"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel id="edit-role-label">Rola</InputLabel>
          <Select
            labelId="edit-role-label"
            label="Rola"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="trainer">Trener</MenuItem>
            <MenuItem value="user">Użytkownik</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          }
          label="Konto aktywne"
        />

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
