type TimeRange = {
  start: string; // "08:00"
  end: string; // "18:00"
};

type DaySchedule = TimeRange | "closed" | null;

export type StoreSchedule = {
  regularHours: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  exceptions?: {
    [date: string]: DaySchedule; // "2024-12-24": { start: "08:00", end: "12:00" } | "closed"
  };
};
