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
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const mockUsers = [
  { id: 1, email: "jan.kowalski@example.com", role: "Uzytkownik" },
  { id: 2, email: "anna.nowak@example.com", role: "Trener" },
  { id: 3, email: "admin@example.com", role: "Admin" },
];

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
        Lista uzytkownikow
      </Typography>

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
              <TableCell>Rola</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockUsers.map((user) => (
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
                <TableCell sx={{ whiteSpace: { xs: "nowrap", sm: "normal" } }}>
                  {user.role}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
