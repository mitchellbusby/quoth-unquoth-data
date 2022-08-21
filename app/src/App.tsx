import { useContext, useReducer, useState } from "react";
import ReactDOM from "react-dom/client";
import { useLocalStorage } from "usehooks-ts";
import { AppStateContext } from "./AppState";
import { BusDistributionType } from "./buses";
import { Clock } from "./Clock";
import { Controls } from "./Controls";
import { CreateRouteContext, createRouteReducer } from "./CreateEditRoutes";
import { PeopleLayer } from "./Layers/PeopleLayer";
import { OpenLayersMap } from "./OpenLayersMap";

import stops from "./data/stops.json";

const App = () => {
  const reducer = useReducer(createRouteReducer, undefined);

  const appState = useContext(AppStateContext);
  const peopleLayer = new PeopleLayer(appState.processedStops, stops);

  return (
    <CreateRouteContext.Provider value={reducer}>
      <div>
        <OpenLayersMap {...{ appState, peopleLayer }} />
        <Controls peopleLayer={peopleLayer} />
        <Clock />
      </div>
    </CreateRouteContext.Provider>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
