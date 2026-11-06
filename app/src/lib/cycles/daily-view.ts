/** Follow today across midnight without moving a deliberately selected historical date. */
export function advanceDailyView(selected: Date, previousToday: string, today: Date): Date {
  return selected.toDateString() === previousToday ? today : selected;
}
