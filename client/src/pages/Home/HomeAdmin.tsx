import {
  Box,
  Container,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import UserAdd from "./components/UserAdd";
import { UsersTable } from "./components/UsersTable";

export default function HomeAdmin() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      width="100%"
      py={{ xs: 4, md: 6 }}
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "grid",
          gap: { xs: 3, md: 4 },
          width: "100%",
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              backgroundColor: isDark ? theme.palette.background.paper : theme.palette.grey[200],
            }}
            elevation={0}
          >
            <UserAdd />
          </Paper>

          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              backgroundColor: isDark ? theme.palette.background.paper : theme.palette.grey[200],
            }}
            elevation={0}
          >
            <UsersTable />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
