import { useReducer, useState } from "react";
import ReactDOM from "react-dom/client";
import { useLocalStorage } from "usehooks-ts";
import { BusDistributionType } from "./buses";
import { Clock } from "./Clock";
import { Controls } from "./Controls";
import { CreateRouteContext, createRouteReducer } from "./CreateEditRoutes";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  const reducer = useReducer(createRouteReducer, undefined);

  return (
    <CreateRouteContext.Provider value={reducer}>
      <div>
        <OpenLayersMap />
        <Controls />
        <Clock />
      </div>
    </CreateRouteContext.Provider>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
