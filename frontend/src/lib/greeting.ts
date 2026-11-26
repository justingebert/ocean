/** "Good morning, Sabine", by the hour of `now`. Without a name just "Good morning". */
export const getGreeting = (firstName: string | undefined, now: Date = new Date()): string => {
  const hour = now.getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return firstName ? `Good ${partOfDay}, ${firstName}` : `Good ${partOfDay}`;
};
