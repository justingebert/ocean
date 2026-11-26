/**
 * Home greeting, picked by `roll` (a random number in [0, 1)) from a few.
 * "Happy Friday" is only in the pick on Fridays, "Sunday session" only on
 * Sundays. Without a name just "Good morning" etc.
 */
export const getGreeting = (
  firstName: string | undefined,
  roll: number,
  now: Date = new Date(),
): string => {
  const hour = now.getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  if (!firstName) {
    return `Good ${partOfDay}`;
  }

  const greetings = [
    `Good ${partOfDay}, ${firstName}`,
    `Back at it, ${firstName}`,
    `${firstName} returns!`,
  ];
  const weekday = now.getDay();
  if (weekday === 5) {
    greetings.push(`Happy Friday, ${firstName}`);
  }
  if (weekday === 0) {
    greetings.push(`Sunday session, ${firstName}?`);
  }

  return greetings[Math.floor(roll * greetings.length)];
};
