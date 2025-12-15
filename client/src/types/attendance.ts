export type AttendanceStatus = "present" | "absent";

export type AttendanceSessionSummary = {
  id: string;
  name: string;
  type: string;
  level: string;
  startAt: string;
  endAt: string;
};

export type AttendanceParticipant = {
  id: string;
  name: string;
  status: AttendanceStatus;
};

export type ActiveAttendanceItem = {
  session: AttendanceSessionSummary;
  canEdit: boolean;
  participants: AttendanceParticipant[];
};

export type ActiveAttendanceResponse = {
  items: ActiveAttendanceItem[];
};

export type PastAttendanceResponse = {
  items: AttendanceSessionSummary[];
};

export type AttendanceDetailsResponse = {
  session: AttendanceSessionSummary;
  canEdit: boolean;
  participants: AttendanceParticipant[];
};