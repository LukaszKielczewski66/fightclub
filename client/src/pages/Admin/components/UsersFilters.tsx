import { Role } from "@/types/adminUsers";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

type ActiveFilter = "all" | "true" | "false";

export type UsersFiltersState = {
  query: string;
  role: Role | "all";
  active: ActiveFilter;
  sort: "createdAt:desc" | "createdAt:asc" | "name:asc" | "name:desc";
  limit: 10 | 20 | 50 | 100;
};

type Props = {
  value: UsersFiltersState;
  onChange: (next: UsersFiltersState) => void;
};

export function UsersFilters({ value, onChange }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" },
        gap: 2,
        alignItems: "end",
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
          Szukaj
        </Typography>
        <TextField
          placeholder="Email lub imię"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          fullWidth
          size="small"
        />
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel id="role-label">Rola</InputLabel>
        <Select
          labelId="role-label"
          label="Rola"
          value={value.role}
          onChange={(e) => onChange({ ...value, role: e.target.value as UsersFiltersState["role"] })}
        >
          <MenuItem value="all">Wszyscy</MenuItem>
          <MenuItem value="user">Użytkownicy</MenuItem>
          <MenuItem value="trainer">Trenerzy</MenuItem>
          <MenuItem value="admin">Admini</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="active-label">Aktywność</InputLabel>
        <Select
          labelId="active-label"
          label="Aktywność"
          value={value.active}
          onChange={(e) => onChange({ ...value, active: e.target.value as ActiveFilter })}
        >
          <MenuItem value="all">Wszyscy</MenuItem>
          <MenuItem value="true">Aktywni</MenuItem>
          <MenuItem value="false">Nieaktywni</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="sort-label">Sortowanie</InputLabel>
        <Select
          labelId="sort-label"
          label="Sortowanie"
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value as UsersFiltersState["sort"] })}
        >
          <MenuItem value="createdAt:desc">Najnowsi</MenuItem>
          <MenuItem value="createdAt:asc">Najstarsi</MenuItem>
          <MenuItem value="name:asc">Imię A–Z</MenuItem>
          <MenuItem value="name:desc">Imię Z–A</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="limit-label">Na stronę</InputLabel>
        <Select
          labelId="limit-label"
          label="Na stronę"
          value={value.limit}
          onChange={(e) => onChange({ ...value, limit: Number(e.target.value) as UsersFiltersState["limit"] })}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
