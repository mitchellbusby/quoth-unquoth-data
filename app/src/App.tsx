import ReactDOM from "react-dom/client";
import { Controls } from "./Controls";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  return (
    <div>
      <OpenLayersMap />
      <Controls />
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
