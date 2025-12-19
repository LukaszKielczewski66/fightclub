export type AdminDashboardResponse = {
  range: { from: string; to: string };
  kpis: {
    usersTotal: number;
    usersActive: number;
    trainersTotal: number;

    sessionsCount: number;
    bookingsCount: number;
    capacityTotal: number;
    fillRate: number;

    attendanceMarked: number;
    attendancePresent: number;
    attendanceAbsent: number;
    presentRate: number;
  };
  upcomingSessions: Array<{
    id: string;
    name: string;
    type: string;
    level: string;
    trainerName: string;
    startAt: string;
    endAt: string;
    reserved: number;
    capacity: number;
  }>;
  topTrainers: Array<{
    trainerId: string;
    trainerName: string;
    sessionsCount: number;
    bookingsCount: number;
  }>;
};
