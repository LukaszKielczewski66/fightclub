import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { Link as RouterLink } from "react-router-dom";
import bgImage from "@/assets/images/bob.png";

export default function HomePublic() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          minHeight: "calc(100dvh - 150px)",
          display: "flex",
          alignItems: "center",
          py: { xs: 6, md: 10 },
          background: "linear-gradient(180deg, rgba(0,0,0,0.04), transparent)",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} maxWidth="md">
            <Typography variant="h3" component="h1" fontWeight={700}>
              Zapisuj, zarządzaj, analizuj — wszystko w jednym miejscu
            </Typography>
            <Typography variant="h6" color="text.secondary">
              System do obsługi klubu sportów walki: harmonogram, zapisy,
              obecności i raporty.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
              >
                Zaloguj się
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
              >
                Dowiedz się więcej
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Nie masz konta? Skontaktuj się z administratorem klubu.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          position: "relative",
          minHeight: 400,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />
        <Container
          maxWidth="md"
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Dołącz do nas!
          </Typography>
          <Typography variant="h6" color="grey.300">
            Trenuj, rozwijaj się i korzystaj z nowoczesnego systemu zapisów.
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight={700}
          >
            Dlaczego warto?
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="center"
            mt={4}
          >
            <Paper
              elevation={3}
              sx={{ flex: 1, p: 3, borderRadius: 3, textAlign: "center" }}
            >
              <EventAvailableIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Harmonogram
              </Typography>
              <Typography color="text.secondary">
                Przejrzyste planowanie i szybkie zapisy online.
              </Typography>
            </Paper>

            <Paper
              elevation={3}
              sx={{ flex: 1, p: 3, borderRadius: 3, textAlign: "center" }}
            >
              <SportsKabaddiIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Treningi
              </Typography>
              <Typography color="text.secondary">
                Zarządzanie obecnościami i lista rezerwowa.
              </Typography>
            </Paper>

            <Paper
              elevation={3}
              sx={{ flex: 1, p: 3, borderRadius: 3, textAlign: "center" }}
            >
              <AssessmentIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Raporty
              </Typography>
              <Typography color="text.secondary">
                Statystyki frekwencji i efektywności zajęć.
              </Typography>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
