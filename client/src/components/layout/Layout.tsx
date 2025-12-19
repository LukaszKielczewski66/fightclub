import { useState, MouseEvent, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "@/features/theme/useThemeMode";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssessmentIcon from "@mui/icons-material/Assessment";

type Role = "admin" | "trainer" | "user";

type NavItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  roles: Array<Role | "*">;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/", icon: <HomeIcon />, roles: ["user"] },

  // USER
  { label: "Grafik", to: "/user/schedule", icon: <CalendarMonthIcon />, roles: ["user"] },
  { label: "Moje zapisy", to: "/user/bookings", icon: <EventNoteIcon />, roles: ["user"] },
  { label: "Historia", to: "/user/history", icon: <HistoryIcon />, roles: ["user"] },

  // TRAINER
  { label: "Profil trenera", to: "/trainer", icon: <PersonIcon />, roles: ["trainer"] },
  {
    label: "Dodaj zajęcia",
    to: "/trainer/schedule",
    icon: <CalendarMonthIcon />,
    roles: ["trainer"],
  },
  {
    label: "Moje zajęcia",
    to: "/trainer/my-sessions",
    icon: <EventNoteIcon />,
    roles: ["trainer"],
  },
  {
    label: "Obecności",
    to: "/trainer/attendance",
    icon: <FactCheckIcon />,
    roles: ["trainer"],
  },
  {
    label: "Raporty",
    to: "/trainer/reports",
    icon: <AssessmentIcon />,
    roles: ["trainer"],
  },

  // ADMIN
  // ADMIN
  { label: "Dashboard", to: "/admin", icon: <AdminPanelSettingsIcon />, roles: ["admin"] },
  { label: "Użytkownicy", to: "/admin/users", icon: <PersonIcon />, roles: ["admin"] },
  { label: "Trenerzy", to: "/admin/trainers", icon: <PersonIcon />, roles: ["admin"] },
  { label: "Oferta", to: "/admin/classes", icon: <EventNoteIcon />, roles: ["admin"] },
  { label: "Raporty klubu", to: "/admin/reports", icon: <AssessmentIcon />, roles: ["admin"] },
  { label: "Ustawienia", to: "/admin/settings", icon: <FactCheckIcon />, roles: ["admin"] },

];

function VisibleItems(userRole: Role | null) {
  return NAV_ITEMS.filter((i) => i.roles.includes("*") || (userRole && i.roles.includes(userRole)));
}

const activeSx = {
  "&.active": {
    backgroundColor: "primary.main",
    color: "primary.contrastText",
    "&:hover": { backgroundColor: "primary.dark" },
  },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode, toggleMode } = useThemeMode();

  const role: Role | null = (user?.role as Role) ?? null;
  const items = useMemo(() => VisibleItems(role), [role]);

  const handleOpenUserMenu = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);

  return (
    <>
      <AppBar position="sticky" elevation={1} color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ mr: 2 }}>
            FightClub
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {items.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                startIcon={item.icon}
                sx={activeSx}
                color="inherit"
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {!user ? (
              <Button
                variant="contained"
                color="primary"
                component={NavLink}
                to="/login"
                startIcon={<LoginIcon />}
              >
                Zaloguj
              </Button>
            ) : (
              <>
                <Tooltip title={`${user.name} (${user.role})`}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: 1 }}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      logout();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Wyloguj" />
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box role="presentation" sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ px: 1, py: 1.5 }}>
            FightClub
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                sx={activeSx}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          {!user ? (
            <List>
              <ListItemButton component={NavLink} to="/login" onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Zaloguj" />
              </ListItemButton>
            </List>
          ) : (
            <List>
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Wyloguj" />
              </ListItemButton>
            </List>
          )}
        </Box>
      </Drawer>

      <Container maxWidth={false} disableGutters>
        <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 3 }}>
          <Outlet />
        </Box>
      </Container>
    </>
  );
}
