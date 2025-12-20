export type OfferType = "BJJ" | "MMA" | "Cross";
export type OfferLevel = "beginner" | "intermediate" | "advanced";

export type ClassTemplateItem = {
  id: string;
  name: string;
  type: OfferType;
  level: OfferLevel;
  durationMin: number;
  defaultCapacity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListClassTemplatesResponse = { items: ClassTemplateItem[] };

export type ListClassTemplatesParams = {
  query?: string;
  type?: OfferType;
  active?: boolean;
  sort?: "createdAt:desc" | "createdAt:asc" | "name:asc" | "name:desc";
};

export type CreateClassTemplatePayload = {
  name: string;
  type: OfferType;
  level: OfferLevel;
  durationMin: number;
  defaultCapacity: number;
};

export type UpdateClassTemplatePayload = Partial<CreateClassTemplatePayload> & { active?: boolean };
