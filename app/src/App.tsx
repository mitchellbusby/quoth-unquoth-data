import { useState } from "react";
import ReactDOM from "react-dom/client";
import { BusType } from "./buses";
import { Controls } from "./Controls";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  const [selectedBus, setSelectedBus] = useState<BusType>("bus");

  return (
    <div>
      <OpenLayersMap />
      <Controls selectedBus={selectedBus} onSelectBus={setSelectedBus} />
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
