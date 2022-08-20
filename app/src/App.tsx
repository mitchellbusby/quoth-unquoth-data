import { useState } from "react";
import ReactDOM from "react-dom/client";
import { BusDistributionType } from "./buses";
import { Clock } from "./Clock";
import { Controls } from "./Controls";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  return (
    <div>
      <OpenLayersMap />
      <Controls />
      <Clock />
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
