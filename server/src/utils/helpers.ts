import { ClubSettingsDto } from "./types";

export function parseDateOrNull(v: unknown) {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isIntInRange(v: unknown, min: number, max: number) {
  return Number.isInteger(v) && typeof v === "number" && v >= min && v <= max;
}

export function toDateOrThrow(value: unknown, fieldName: string): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const err = new Error(`Nieprawidłowe pole ${fieldName}`);
  (err as { status?: number }).status = 500;
  throw err;
}

export type HttpErr = Error & { status?: number };
export function httpError(message: string, status: number): HttpErr {
  const e: HttpErr = new Error(message);
  e.status = status;
  return e;
}

export function toDto(doc: any): ClubSettingsDto {
  return {
    clubName: doc.clubName ?? "FightClub",
    address: doc.address ?? "",
    contactEmail: doc.contactEmail ?? "",
    contactPhone: doc.contactPhone ?? "",
    timezone: doc.timezone ?? "Europe/Warsaw",
    maxBookingsPerWeek: Number(doc.maxBookingsPerWeek ?? 6),
    bookingCutoffHours: Number(doc.bookingCutoffHours ?? 2),
    cancelCutoffHours: Number(doc.cancelCutoffHours ?? 2),
    updatedAt: new Date(doc.updatedAt ?? Date.now()).toISOString(),
  };
}
