import { ClubSettingsDto } from "../utils/types";
import { ClubSettings } from "../models/ClubSettings";
import { httpError, toDto } from "../utils/helpers";


export async function getClubSettingsSvc(): Promise<ClubSettingsDto> {
  let doc = await ClubSettings.findOne({}).lean();
  if (!doc) {
    const created = await ClubSettings.create({});
    doc = created.toObject();
  }
  return toDto(doc);
}

export async function updateClubSettingsSvc(patch: Partial<Omit<ClubSettingsDto, "updatedAt">>) {
  if (patch.clubName != null && String(patch.clubName).trim().length < 2) {
    throw httpError("Nazwa klubu jest za krótka", 400);
  }

  const numFields: Array<keyof typeof patch> = [
    "maxBookingsPerWeek",
    "bookingCutoffHours",
    "cancelCutoffHours",
  ];

  for (const k of numFields) {
    const v = patch[k];
    if (v == null) continue;
    if (!Number.isFinite(Number(v))) throw httpError(`Pole ${String(k)} musi być liczbą`, 400);
  }

  const updated = await ClubSettings.findOneAndUpdate(
    {},
    {
      ...(patch.clubName != null ? { clubName: String(patch.clubName).trim() } : {}),
      ...(patch.address != null ? { address: String(patch.address).trim() } : {}),
      ...(patch.contactEmail != null ? { contactEmail: String(patch.contactEmail).trim() } : {}),
      ...(patch.contactPhone != null ? { contactPhone: String(patch.contactPhone).trim() } : {}),
      ...(patch.timezone != null ? { timezone: String(patch.timezone).trim() } : {}),
      ...(patch.maxBookingsPerWeek != null ? { maxBookingsPerWeek: Number(patch.maxBookingsPerWeek) } : {}),
      ...(patch.bookingCutoffHours != null ? { bookingCutoffHours: Number(patch.bookingCutoffHours) } : {}),
      ...(patch.cancelCutoffHours != null ? { cancelCutoffHours: Number(patch.cancelCutoffHours) } : {}),
    },
    { upsert: true, new: true }
  ).lean();

  return toDto(updated);
}
