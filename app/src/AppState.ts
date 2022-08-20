import { Map } from "ol";
import React from "react";
import { BusDistributionType } from "./buses";
import { SavedRoute } from "./CreateEditRoutes";
import { DEFAULT_DAY } from "./timeConfiguration";

type AppState = {
  frameCount: number;
  dayOfWeek: string;
  busDistribution: BusDistributionType;
  olMapRef?: React.MutableRefObject<Map>;
  savedBusRoutes: {
    routes: SavedRoute[];
  };
};

const appState: AppState = {
  frameCount: 9 * 60 * 60,
  dayOfWeek: DEFAULT_DAY,
  busDistribution: "standard",
  savedBusRoutes: {
    routes: [],
  },
};

const AppStateContext = React.createContext<AppState>(appState);

export { AppStateContext };
