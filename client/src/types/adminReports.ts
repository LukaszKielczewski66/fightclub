export type AdminWeeklyClubReport = {
  weekStart: string;
  weekEnd: string;
  totals: {
    sessionsCount: number;
    hours: number;
    reserved: number;
    capacity: number;
    fillRate: number; 
    present: number;
    absent: number;
    attendanceRate: number;
  };
  days: Array<{
    date: string;
    sessionsCount: number;
    hours: number;
    reserved: number;
    capacity: number;
    fillRate: number;
    present: number;
    absent: number;
  }>;
  byType: Array<{
    type: string;
    sessionsCount: number;
    hours: number;
    reserved: number;
    capacity: number;
    fillRate: number;
    present: number;
    absent: number;
  }>;
  topBest: Array<{
    id: string;
    name: string;
    type: string;
    level: string;
    trainerName: string;
    startAt: string;
    endAt: string;
    hours: number;
    reserved: number;
    capacity: number;
    fillRate: number;
    present: number;
    absent: number;
  }>;
  topWorst: Array<{
    id: string;
    name: string;
    type: string;
    level: string;
    trainerName: string;
    startAt: string;
    endAt: string;
    hours: number;
    reserved: number;
    capacity: number;
    fillRate: number;
    present: number;
    absent: number;
  }>;
};
