import type { Level, SessionType } from "@/api/schedule.api";

export type OfferTemplateItem = {
  id: string;
  name: string;
  type: SessionType;
  level: Level;
  durationMin: number;
  defaultCapacity: number;
  active: boolean;
};

export type OfferTemplatesResponse = { items: OfferTemplateItem[] };
