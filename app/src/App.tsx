import ReactDOM from "react-dom/client";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  return (
    <div>
      <OpenLayersMap />
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
