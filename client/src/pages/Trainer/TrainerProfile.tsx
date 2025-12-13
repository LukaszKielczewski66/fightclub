import { Box, Paper, Typography, Avatar, Stack, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/features/auth/useAuth";

export default function TrainerProfile() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!user) return null;

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          maxWidth: 520,
          width: "100%",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 32 }}>
            {user.name?.[0]?.toUpperCase() ?? "T"}
          </Avatar>

          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }} color="primary.main">
              Trener
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
