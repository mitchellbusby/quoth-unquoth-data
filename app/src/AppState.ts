import { Map } from "ol";
import React from "react";
import { BusDistributionType } from "./buses";
import { SavedRoute } from "./CreateEditRoutes";
import { preProcessedStops } from "./processedTrips";
import { DEFAULT_DAY } from "./timeConfiguration";
import defaultRoutes from "./data/routes.json";

export type Trip = {
  stops: number[];
  times: number[];
};

export type TripCollection = { [tripId: string]: Trip };

export type AppState = {
  frameCount: number;
  dayOfWeek: string;
  busDistribution: BusDistributionType;
  olMapRef?: React.MutableRefObject<Map | undefined>;
  savedBusRoutes: {
    routes: SavedRoute[];
    trips: TripCollection[];
  };
  processedStops: {
    [tripId: string]: Trip;
  };
  /**
   * List of all routes inc. custom routes
   */
  routes: {
    trips: {
      [tripId: string]: { route: string };
    };
    routes: {
      [routeNumber: string | number]: { "0"?: string; "1"?: string };
    };
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
  routes: { ...defaultRoutes },
};

const AppStateContext = React.createContext<AppState>(appState);

export { AppStateContext };
