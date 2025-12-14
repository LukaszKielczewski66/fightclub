import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type Props = {
  open: boolean;
  sessionName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmBookingModal({
  open,
  sessionName,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Potwierdź zapis</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Czy chcesz zapisać się na zajęcia <strong>{sessionName}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? "Zapisywanie..." : "Zapisz się"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
