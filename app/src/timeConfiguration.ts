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

export { days, DEFAULT_DAY, isSpecialDay };
