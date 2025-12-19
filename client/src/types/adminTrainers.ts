export type AdminTrainerOverviewResponse = {
  range: { from: string; to: string };
  kpis: {
    trainersTotal: number;
    trainersActive: number;
    sessionsThisWeek: number;
    avgFillRate: number;
    overLimitCount: number;
  };
  items: Array<{
    id: string;
    name: string;
    email: string;
    active: boolean;
    specializations: string[];
    levelsTaught: string[];
    maxWeeklyHours: number | null;
    week: {
      sessionsCount: number;
      hours: number;
      bookings: number;
      capacity: number;
      fillRate: number;
      overLimit: boolean;
    };
    last30: {
      sessionsCount: number;
      bookings: number;
      capacity: number;
      fillRate: number;
    };
  }>;
};

export type TrainersOverviewParams = {
  query?: string;
  active?: boolean;
  sort?: "week.hours:desc" | "week.hours:asc" | "week.fillRate:desc" | "name:asc" | "name:desc";
};
