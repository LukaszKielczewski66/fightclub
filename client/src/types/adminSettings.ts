export type ClubSettings = {
  clubName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  maxBookingsPerWeek: number;
  bookingCutoffHours: number;
  cancelCutoffHours: number;
  updatedAt: string;
};

export type UpdateClubSettingsPayload = Partial<Omit<ClubSettings, "updatedAt">>;
