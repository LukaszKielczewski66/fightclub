import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  CircularProgress,
  Box,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useUsers } from "@/features/admin/useUsers";

const roleLabel: Record<"admin" | "trainer" | "user", string> = {
  admin: "Admin",
  trainer: "Trener",
  user: "Użytkownik",
};

export const UsersTable = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];
  const headBg = isDark
    ? alpha(theme.palette.common.white, 0.04)
    : alpha(theme.palette.grey[900], 0.02);
  const rowHover = isDark
    ? alpha(theme.palette.primary.main, 0.08)
    : alpha(theme.palette.primary.main, 0.06);

  const { data, isLoading, isError } = useUsers();

  const users = data?.items ?? [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        width: "100%",
        borderRadius: 3,
        backgroundColor: cardBg,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <Typography component="h2" variant="h6" gutterBottom>
        Lista użytkowników
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      )}

      {isError && (
        <Typography color="error" variant="body2">
          Nie udało się pobrać użytkowników.
        </Typography>
      )}

      {!isLoading && !isError && (
        <TableContainer
          sx={{
            width: "100%",
            overflowX: { xs: "auto", md: "visible" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table size="small" stickyHeader={false}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: headBg,
                  "& th": {
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    borderBottomColor: theme.palette.divider,
                    py: { xs: 1, md: 1.25 },
                  },
                }}
              >
                <TableCell>Email</TableCell>
                <TableCell>Imię i nazwisko</TableCell>
                <TableCell>Rola</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{
                    transition: "background-color 120ms ease",
                    "&:hover": { backgroundColor: rowHover },
                    "& td": {
                      borderBottomColor: alpha(theme.palette.divider, 0.9),
                      py: { xs: 0.75, md: 1.25 },
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      maxWidth: { xs: 240, sm: "none" },
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell sx={{ whiteSpace: { xs: "nowrap", sm: "normal" } }}>
                    {roleLabel[user.role]}
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      Brak użytkowników do wyświetlenia.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
