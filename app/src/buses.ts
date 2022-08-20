export type BusDistributionType = "standard" | "pride";

export const BusList: { label: string; id: BusDistributionType }[] = [
  {
    label: "Standard bus distribution",
    id: "standard",
  },
  {
    label: "PRIDE MODE ON",
    id: "pride",
  },
];
