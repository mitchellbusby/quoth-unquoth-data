import React from "react";

const appState = { frameCount: undefined };

const AppStateContext = React.createContext<{
  frameCount: number;
}>(appState);

export { AppStateContext };
