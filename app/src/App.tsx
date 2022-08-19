import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  const [state, setState] = useState<string | undefined>();

  useEffect(() => {
    const fetchState = async () => {
      const result = await fetch("/api/");

      const newState = await result.text();

      setState(newState);
    };

    fetchState();
  }, []);

  return (
    <div>
      <OpenLayersMap />
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.render(<App />, mountElement);
}
