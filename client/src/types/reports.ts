export type TrainerWeekSessionReport = {
  id: string;
  name: string;
  type: string;
  level: string;
  startAt: string;
  endAt: string;
  reserved: number;
  present: number;
  absent: number;
};

export type TrainerWeekDayReport = {
  date: string;
  sessionsCount: number;
  hours: number;
  reserved: number;
  present: number;
  absent: number;
  sessions: TrainerWeekSessionReport[];
};

export type TrainerWeeklyReportResponse = {
  weekStart: string;
  weekEnd: string;
  totals: {
    sessionsCount: number;
    hours: number;
    reserved: number;
    present: number;
    absent: number;
    avgAttendanceRate: number;
  };
  days: TrainerWeekDayReport[];
};
