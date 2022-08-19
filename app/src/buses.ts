export type BusType = "bus" | "bus_old" | "bus_pride" | "bus_blue";

export const BusList: { label: string; id: BusType }[] = [
  { label: "Standard bus", id: "bus" },
  { label: "Old bus", id: "bus_old" },
  {
    label: "Pride bus",
    id: "bus_pride",
  },
  {
    label: "Blue bus",
    id: "bus_blue",
  },
];
