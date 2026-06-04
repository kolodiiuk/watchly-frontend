export const WatchStatus = {
  PlanToWatch: 0,
  Watching: 1,
  Completed: 2,
  Dropped: 3,
  NotWatched: 4,
} as const;

export type WatchStatus = (typeof WatchStatus)[keyof typeof WatchStatus];
