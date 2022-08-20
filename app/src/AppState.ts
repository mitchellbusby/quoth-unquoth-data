import React from "react";
import { BusDistributionType } from "./buses";
import { DEFAULT_DAY } from "./timeConfiguration";

type AppState = {
  frameCount: number;
  dayOfWeek: string;
  busDistribution: BusDistributionType;
};

const appState: AppState = {
  frameCount: 9 * 60 * 60,
  dayOfWeek: DEFAULT_DAY,
  busDistribution: "standard",
};

const AppStateContext = React.createContext<AppState>(appState);

export { AppStateContext };
