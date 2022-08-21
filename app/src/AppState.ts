import { Map } from "ol";
import React from "react";
import { BusDistributionType } from "./buses";
import { SavedRoute } from "./CreateEditRoutes";
import { preProcessedStops } from "./processedTrips";
import { DEFAULT_DAY } from "./timeConfiguration";

export type Trip = {
  stops: number[];
  times: number[];
};

type AppState = {
  frameCount: number;
  dayOfWeek: string;
  busDistribution: BusDistributionType;
  olMapRef?: React.MutableRefObject<Map>;
  savedBusRoutes: {
    routes: SavedRoute[];
    trips: { [tripId: string]: Trip }[];
  };
  processedStops: {
    [tripId: string]: Trip;
  };
};

const appState: AppState = {
  frameCount: 9 * 60 * 60,
  dayOfWeek: DEFAULT_DAY,
  busDistribution: "standard",
  savedBusRoutes: {
    routes: [],
    trips: [],
  },
  processedStops: preProcessedStops,
};

const AppStateContext = React.createContext<AppState>(appState);

export { AppStateContext };
