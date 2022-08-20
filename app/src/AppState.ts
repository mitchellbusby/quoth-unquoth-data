import React from "react";
import { DEFAULT_DAY } from "./timeConfiguration";

const appState = { frameCount: undefined, dayOfWeek: DEFAULT_DAY };

const AppStateContext = React.createContext<{
  frameCount: number;
  dayOfWeek: string;
}>(appState);

export { AppStateContext };
