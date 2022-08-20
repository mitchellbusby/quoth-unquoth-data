const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const specialDays = ["Saturday", "Sunday"];

const DEFAULT_DAY = "Monday";

const isSpecialDay = (day: string) => specialDays.includes(day);

const getNextDay = (currentDay: string) => {
  if (days.indexOf(currentDay) === days.length - 1) {
    return "Monday";
  }
  return days[days.indexOf(currentDay) + 1];
};

export { days, DEFAULT_DAY, isSpecialDay, getNextDay };
